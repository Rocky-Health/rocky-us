import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
    buildLongevityCrmFormPayload,
    mapLongevityCrmAnswers,
} from "@/utils/longevityQuizPayload";
import { getLongevityQuizRequestContext } from "@/utils/longevityQuizClientContext";
import {
    formatPreHandoffForCrm,
    getNadPlusPreHandoff,
    clearNadPlusPreHandoff,
} from "@/utils/nadPlusPreConsultationHandoff";
import { logger } from "@/utils/devLogger";
import { isUserAuthenticated } from "@/utils/crossSellCheckout";
import {
    fireEverFlowConversion,
    fireEverFlowConversionWhenReady,
} from "@/components/EverFlow/EverFlowScript";

// Read the `ef_offer_id` cookie set by EverFlowScript Click on /longevity-nad-lp.
// Returns the offer id as a number, or null when the user didn't come through
// a tracked affiliate click (organic NAD+ traffic).
function readEfOfferIdCookie() {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|; )ef_offer_id=([^;]+)/);
    if (!match) return null;
    const offerId = Number(match[1]);
    return Number.isFinite(offerId) ? offerId : null;
}

// Networks per offer. Add new offers here when more affiliate LPs go live.
const EF_OFFER_NETWORKS = {
    5117: "wuse07zm",
};

/** Count of real questionnaire steps (excludes completion pseudo-step 99). */
function countQuestionSteps(steps) {
    return Object.keys(steps || {})
        .map(Number)
        .filter((n) => !Number.isNaN(n) && n !== 99).length;
}

/**
 * Resolve a navigation entry. An entry may be a static step number or a
 * function `(answers) => stepNumber` for conditional routing (e.g. skipping
 * the medication-list step on a "No" screening answer).
 */
function resolveNavigationTarget(navEntry, answers) {
    if (typeof navEntry === "function") {
        try {
            return navEntry(answers || {});
        } catch {
            return undefined;
        }
    }
    return navEntry;
}

/** Is a step's answer present? Checkbox needs a non-empty array; others a value. */
function isStepAnswered(step, answers) {
    if (!step?.field) return true;
    const val = answers?.[step.field];
    if (step.type === "checkbox") return Array.isArray(val) && val.length > 0;
    return val !== undefined && val !== null && String(val).trim() !== "";
}

/**
 * First step the user still needs to answer, walking the navigation graph from
 * step 1. Used to drop a resumed portal visitor onto their next question rather
 * than restarting the quiz. Returns the ID-upload / completion step when every
 * question is already answered.
 */
function computeResumeStep(answers, quizConfig) {
    let step = 1;
    const guard = new Set();
    while (step !== 99 && step !== 98 && !guard.has(step)) {
        guard.add(step);
        const cfg = quizConfig.steps?.[step];
        if (!cfg) break;
        if (!isStepAnswered(cfg, answers)) return step;
        const next = resolveNavigationTarget(
            quizConfig.navigation?.[step],
            answers,
        );
        if (next === undefined) return step;
        step = next;
    }
    return step;
}

/**
 * CRM completion %: maps the current step's position within the active step
 * keys to a percentage (e.g. step 1 of 4 active → 25%). Uses position rather
 * than the raw `stepIndex` so it stays correct when configs skip step
 * numbers (e.g. a commented-out step leaving a gap). Final submit uses 100.
 * UI progress bar uses progressMap separately.
 */
function crmCompletionPercentage(stepIndex, steps, isFinal) {
    if (isFinal) return 100;
    const keys = Object.keys(steps || {})
        .map(Number)
        .filter((n) => {
            if (Number.isNaN(n) || n === 99 || n === 98) return false;
            const s = steps[n];
            return s && s.type !== "id-upload";
        })
        .sort((a, b) => a - b);
    if (!keys.length) return 10;
    const position = keys.indexOf(stepIndex);
    if (position === -1) return 10;
    return Math.min(100, Math.round(((position + 1) / keys.length) * 100));
}

export function useLongevityQuiz(quizConfig) {
    // v3: bio-age & bio-age-nad steps were renumbered (former step 2 folded
    // into the new radio-text step 1), so a stored `stepIndex` from the
    // earlier layout would land users on the wrong question. Bumping the
    // key forces a clean restart for anyone with stale local state.
    const storageKey = `longevity-quiz-${quizConfig.form_id}-${quizConfig.entrykey_field}-v3`;
    const storageExpiryKey = `${storageKey}-expiry`;

    const [stepIndex, setStepIndex] = useState(1);
    const [answers, setAnswers] = useState({});
    const [popupType, setPopupType] = useState(null);
    const [isRestored, setIsRestored] = useState(false);
    const [prefillLoaded, setPrefillLoaded] = useState(false);
    const [entrykeyPrimed, setEntrykeyPrimed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const metaRef = useRef({
        id: "",
        token: "",
        [quizConfig.entrykey_field]: "",
    });
    const answersRef = useRef(answers);
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    // Thank-you-page pre-create handoff: when OrderReceivedPageContent
    // pre-creates a longevity CRM entry, it appends ?id=&token=&entrykey= to
    // the redirect URL so this quiz resumes that exact entry instead of
    // creating a duplicate on first save. URL params are read once on mount
    // and take precedence over any stored meta (a fresh post-checkout
    // redirect is authoritative for the current order).
    const searchParams = useSearchParams();

    const progress = quizConfig.progressMap[stepIndex] || 0;

    const readLocalStorage = () => {
        if (typeof window === "undefined") return null;
        try {
            const ttl = window.localStorage.getItem(storageExpiryKey);
            if (ttl && Date.now() < parseInt(ttl, 10)) {
                return JSON.parse(
                    window.localStorage.getItem(storageKey) || "{}",
                );
            }
            window.localStorage.removeItem(storageKey);
            window.localStorage.removeItem(storageExpiryKey);
            return null;
        } catch {
            return null;
        }
    };

    const writeLocalStorage = (data) => {
        if (typeof window === "undefined") return;
        try {
            const ttl = Date.now() + 1000 * 60 * 60;
            window.localStorage.setItem(storageKey, JSON.stringify(data));
            window.localStorage.setItem(storageExpiryKey, ttl.toString());
        } catch {}
    };

    useEffect(() => {
        const stored = readLocalStorage();
        if (stored) {
            // Drop a restored stepIndex that no longer exists in the config
            // (e.g. a step that was commented out since the last visit) and
            // start the user at step 1 instead of a blank screen.
            const storedStep = stored.stepIndex;
            const isValidStep =
                storedStep === 99 ||
                storedStep === 98 ||
                Object.prototype.hasOwnProperty.call(
                    quizConfig.steps || {},
                    String(storedStep),
                );
            if (storedStep && isValidStep) setStepIndex(storedStep);
            if (stored.answers) setAnswers(stored.answers);
            if (stored.meta)
                metaRef.current = { ...metaRef.current, ...stored.meta };
        }

        const urlId = searchParams?.get("id") || "";
        const urlToken = searchParams?.get("token") || "";
        const urlEntrykey = searchParams?.get("entrykey") || "";
        if (urlId && urlToken) {
            metaRef.current = {
                ...metaRef.current,
                id: urlId,
                token: urlToken,
                ...(urlEntrykey
                    ? { [quizConfig.entrykey_field]: urlEntrykey }
                    : {}),
            };
        }

        setIsRestored(true);
    }, []);

    // Patient-portal resume: opened from the portal with ?id=&token=&patient-token=,
    // pull the saved answers from CRM (same endpoint the ED/WL/hair quizzes use),
    // rebuild the quiz answers, and drop the user on their next question. Uses
    // the patient-token as the authorization, so it works before the FE session
    // is readable (mirrors the other quizzes' portal prefill).
    useEffect(() => {
        if (!isRestored || prefillLoaded) return;
        const id = searchParams?.get("id") || "";
        const token = searchParams?.get("token") || "";
        const patientToken = searchParams?.get("patient-token") || "";
        if (!id || !token || !patientToken) return;

        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/questionnaire-filled-answers", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        wp_entry_id: id,
                        token,
                        patient_token: patientToken,
                    }),
                });
                const data = await res.json();
                const crm = data?.data;
                if (crm && !cancelled) {
                    const prefilled = mapLongevityCrmAnswers(crm, quizConfig);
                    const stored = readLocalStorage();
                    const merged = { ...(stored?.answers || {}), ...prefilled };
                    const resume = computeResumeStep(merged, quizConfig);
                    metaRef.current = { ...metaRef.current, id, token };
                    setAnswers(merged);
                    setStepIndex(resume);
                    writeLocalStorage({
                        answers: merged,
                        stepIndex: resume,
                        meta: metaRef.current,
                    });
                }
            } catch (e) {
                logger.warn("Longevity quiz portal prefill failed:", e);
            } finally {
                if (!cancelled) setPrefillLoaded(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isRestored, prefillLoaded, quizConfig, searchParams]);

    // Skincare pre-checkout pattern (e.g. useAcneQuiz): GET only when logged in.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                if (isUserAuthenticated()) {
                    const qs = new URLSearchParams({
                        action: quizConfig.action,
                    });
                    await fetch(`${quizConfig.api_endpoint}?${qs}`, {
                        method: "GET",
                        credentials: "include",
                    });
                }
            } catch (e) {
                logger.warn("Longevity quiz entrykey prefetch failed:", e);
            } finally {
                if (!cancelled) setEntrykeyPrimed(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [quizConfig.api_endpoint, quizConfig.action]);

    useEffect(() => {
        if (!isRestored) return;
        writeLocalStorage({ answers, stepIndex, meta: metaRef.current });
    }, [answers, stepIndex, isRestored]);

    // EverFlow Start Quiz event — fires only when the user arrived via a
    // tracked affiliate click (ef_offer_id cookie set by EverFlowScript on
    // /longevity-nad-lp). Cookie-gated so organic NAD+ buyers don't get
    // reported as affiliate funnel starts. Polls for window.EF because the
    // SDK <Script> on the order-received page may still be loading when
    // this SPA-navigated quiz mounts.
    useEffect(() => {
        const offerId = readEfOfferIdCookie();
        if (!offerId) return;
        const network = EF_OFFER_NETWORKS[offerId];
        if (!network) return;
        return fireEverFlowConversionWhenReady({
            network,
            offerId,
            eventId: 6284,
        });
    }, []);

    const submitToServer = useCallback(
        async (isGoingToComplete, answersOverride = null) => {
            if (!isUserAuthenticated()) {
                throw new Error("Please log in to continue.");
            }

            const effectiveAnswers = answersOverride ?? answers;
            const formPayload = buildLongevityCrmFormPayload(
                effectiveAnswers,
                quizConfig,
            );

            const questionStepKeys = Object.keys(quizConfig.steps || {})
                .map(Number)
                .filter((n) => {
                    if (Number.isNaN(n) || n === 99 || n === 98) return false;
                    const s = quizConfig.steps[n];
                    return s && s.type !== "id-upload";
                });
            const maxQuestionStep = Math.max(1, ...questionStepKeys);

            const nextStep = resolveNavigationTarget(
                quizConfig.navigation[stepIndex],
                effectiveAnswers,
            );
            const pageStep =
                isGoingToComplete || nextStep === 99
                    ? maxQuestionStep
                    : (nextStep ?? stepIndex + 1);

            const entrykeyField = quizConfig.entrykey_field;
            const clientContext = getLongevityQuizRequestContext(entrykeyField);
            const ekVal =
                String(clientContext.entrykey || "").trim() ||
                String(metaRef.current[entrykeyField] || "").trim();
            clientContext.entrykey = ekVal;

            const rawPercentage = crmCompletionPercentage(
                stepIndex,
                quizConfig.steps,
                isGoingToComplete,
            );
            // Never send 100% / "Full" unless the caller explicitly marks this
            // as the final submission (i.e. the ID has been uploaded). This
            // prevents the last real question step from being reported as
            // complete before the ID upload step runs.
            const completionPercentage = isGoingToComplete
                ? 100
                : Math.min(95, rawPercentage);

            const preHandoff =
                isGoingToComplete && quizConfig.action === "longevity_nad"
                    ? formatPreHandoffForCrm(getNadPlusPreHandoff())
                    : {};

            const requestBody = {
                action: quizConfig.action,
                form_id: quizConfig.form_id,
                id: metaRef.current.id || "",
                token: metaRef.current.token || "",
                stage: "consultation-after-checkout",
                page_step: pageStep,
                completion_state: isGoingToComplete ? "Full" : "Partial",
                "completion.state": isGoingToComplete ? "Full" : "Partial",
                completion_percentage: completionPercentage,
                "completion.percentage": completionPercentage,
                source_site: process.env.NEXT_PUBLIC_SITE_URL || "https://www.myrocky.com",
                ...clientContext,
                ...preHandoff,
                ...formPayload,
            };

            const response = await fetch(quizConfig.api_endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
                credentials: "include",
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(
                    data.msg ||
                        data.error_message ||
                        "Could not save your answers",
                );
            }

            metaRef.current = {
                ...metaRef.current,
                id: data.id || metaRef.current.id,
                token: data.token || metaRef.current.token,
                [quizConfig.entrykey_field]:
                    data.entrykey ||
                    data[quizConfig.entrykey_field] ||
                    metaRef.current[quizConfig.entrykey_field],
            };

            writeLocalStorage({
                answers: effectiveAnswers,
                stepIndex,
                meta: metaRef.current,
            });
            return data;
        },
        [answers, quizConfig, stepIndex],
    );

    /** Screening risk hides Continue — persist choice so CRM still gets e.g. 1202_1: "Yes". */
    const persistScreeningRiskSelection = useCallback(
        async (answersSnapshot) => {
            if (!isUserAuthenticated()) return;
            setSubmitError(null);
            try {
                await submitToServer(false, answersSnapshot);
            } catch (e) {
                logger.error("Longevity quiz partial save error:", e);
                setSubmitError(
                    e.message ||
                        "Could not save your answer. Please try again.",
                );
            }
        },
        [submitToServer],
    );

    const closePopup = () => setPopupType(null);

    const handleNext = () => {
        const nextStep = resolveNavigationTarget(
            quizConfig.navigation[stepIndex],
            answers,
        );
        if (nextStep !== undefined) {
            setStepIndex(nextStep);
        }
    };

    const handleBack = () => {
        if (stepIndex === 1) return;

        if (stepIndex === 99) {
            const entryToComplete = Object.entries(quizConfig.navigation).find(
                ([, target]) =>
                    resolveNavigationTarget(target, answers) === 99,
            );
            const prevStep = entryToComplete ? Number(entryToComplete[0]) : 1;
            setStepIndex(prevStep);
            return;
        }

        // For conditional navigation, find the source step whose resolved
        // target matches the current step given the current answers. This
        // ensures the "No → skip" branch on step 1 correctly walks back to
        // step 1 (rather than the skipped intermediate step).
        const navEntries = Object.entries(quizConfig.navigation).map(
            ([k, v]) => [Number(k), v],
        );
        const prevEntry = navEntries.find(
            ([, target]) =>
                resolveNavigationTarget(target, answers) === stepIndex,
        );
        const prevStep = prevEntry ? prevEntry[0] : stepIndex - 1;
        setStepIndex(prevStep);
    };

    const handleAction = (action, payload) => {
        switch (action) {
            case "showPopup":
                setPopupType(payload);
                break;
            case "navigate":
                setStepIndex(payload);
                break;
            case "continue":
                closePopup();
                handleNext();
                break;
            default:
                break;
        }
    };

    const handleIdUploadComplete = useCallback(
        async (s3Url) => {
            const updatedAnswers = { ...answers, photoIdUrl: s3Url };
            setAnswers(updatedAnswers);
            setSubmitError(null);

            if (quizConfig.submitOnThankYou) {
                answersRef.current = updatedAnswers;
                writeLocalStorage({
                    answers: updatedAnswers,
                    stepIndex: 99,
                    meta: metaRef.current,
                });
                setAnswers(updatedAnswers);
                setStepIndex(99);
                return;
            }

            setIsSubmitting(true);
            try {
                await submitToServer(true, updatedAnswers);
                const offerId = readEfOfferIdCookie();
                const network = offerId ? EF_OFFER_NETWORKS[offerId] : null;
                if (offerId && network) {
                    fireEverFlowConversion({
                        network,
                        offerId,
                        eventId: 6285,
                    });
                }
                handleNext();
            } catch (e) {
                logger.error("Longevity quiz ID upload submit error:", e);
                setSubmitError(
                    e.message || "Something went wrong. Please try again.",
                );
                throw e;
            } finally {
                setIsSubmitting(false);
            }
        },
        [answers, quizConfig.submitOnThankYou, submitToServer],
    );

    const submitFinalConsultation = useCallback(async () => {
        setSubmitError(null);
        setIsSubmitting(true);
        try {
            await submitToServer(true, answersRef.current);
            if (quizConfig.action === "longevity_nad") {
                clearNadPlusPreHandoff();
            }
            const offerId = readEfOfferIdCookie();
            const network = offerId ? EF_OFFER_NETWORKS[offerId] : null;
            if (offerId && network) {
                fireEverFlowConversion({
                    network,
                    offerId,
                    eventId: 6285,
                });
            }
        } catch (e) {
            logger.error("Longevity quiz final submit error:", e);
            setSubmitError(
                e.message || "Something went wrong. Please try again.",
            );
            throw e;
        } finally {
            setIsSubmitting(false);
        }
    }, [quizConfig.action, submitToServer]);

    const handleContinue = async () => {
        const nextStep = resolveNavigationTarget(
            quizConfig.navigation[stepIndex],
            answers,
        );
        const isGoingToComplete = nextStep === 99;
        if (isGoingToComplete && quizConfig.submitOnThankYou) {
            handleNext();
            return;
        }
        setSubmitError(null);
        setIsSubmitting(true);
        try {
            await submitToServer(isGoingToComplete);
            // Secondary Quiz Completed path: a non-ID-upload step that
            // navigates directly to step 99. Dedupe in fireEverFlowConversion
            // prevents double-fire with handleIdUploadComplete.
            if (isGoingToComplete) {
                const offerId = readEfOfferIdCookie();
                const network = offerId ? EF_OFFER_NETWORKS[offerId] : null;
                if (offerId && network) {
                    fireEverFlowConversion({
                        network,
                        offerId,
                        eventId: 6285,
                    });
                }
            }
            handleNext();
        } catch (e) {
            logger.error("Longevity quiz save error:", e);
            setSubmitError(
                e.message || "Something went wrong. Please try again.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        stepIndex,
        progress,
        answers,
        setAnswers,
        popupType,
        handleNext,
        handleBack,
        handleAction,
        closePopup,
        handleContinue,
        handleIdUploadComplete,
        submitFinalConsultation,
        entrykeyPrimed,
        isSubmitting,
        submitError,
        persistScreeningRiskSelection,
    };
}
