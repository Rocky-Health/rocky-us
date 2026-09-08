import YourWeightPopup from "./YourWeightPopup";
import React, { useEffect } from "react";
import CustomImage from "@/components/utils/CustomImage";
import Counter from "./Counter"; // Use separate Counter for BO2/BO3
import WeightLossResultPasswordPopup from "../../components/WeightLossResultPasswordPopup";
import { ProgressBar } from "@/components/EdQuestionnaire/ProgressBar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QuestionnaireNavbar from "../../components/QuestionnaireNavbar";
import { isAuthenticated } from "@/lib/cart/cartService";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

// Separate GenericPopup component for BO2/BO3 simplified flow
// This is completely independent from the default WL flow GenericPopup
const GenericPopup = ({
    isOpen,
    onClose,
    popupConfig,
    onAction,
    currentPage,
    setUserData,
    progressBar,
    asPage = false,
}) => {
    const router = useRouter();
    useEffect(() => {
        if (asPage) return; // when used as a full page, don't lock body scroll
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        // Cleanup when unmounting
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen, asPage]);

    if (!isOpen || !popupConfig) return null;

    const isNotQualifiedSerifLayout =
        popupConfig.popupLayout === "notQualifiedSerif";

    const waitForAuthenticatedUser = async ({
        tries = 12,
        delayMs = 120,
    } = {}) => {
        for (let i = 0; i < tries; i += 1) {
            try {
                if (isAuthenticated()) return true;
            } catch (e) {
                // ignore and retry
            }
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        return false;
    };

    const handlePasswordPopupSubmit = async (action, payload) => {
        if (popupConfig.passwordPopupMode === "stepElevenSignInGate") {
            const isStep11Completion =
                action === "continue" ||
                (action === "openPopup" && payload === "YourWeightPopup");
            if (isStep11Completion) {
                const authenticated = await waitForAuthenticatedUser();
                if (authenticated) {
                    onClose();
                    onAction(
                        "navigate",
                        popupConfig.authenticatedNavigateTo ?? 32,
                    );
                    return;
                }
                onAction("continue");
                return;
            }
        }
        onAction(action, payload);
    };

    const handleButtonClick = (button) => {
        switch (button.action) {
            case "redirect":
                if (
                    button.url.startsWith("http") ||
                    button.url.includes("://")
                ) {
                    window.location.href = button.url; // External URLs
                } else {
                    router.push(button.url); // Internal navigation
                }
                break;
            case "continue":
                onAction("continue");
                break;
            case "openPopup":
                if (button.popupName) {
                    onAction("showPopup", button.popupName);
                }
                break;
            case "navigate":
                if (button.payload) {
                    onClose();
                    onAction("navigate", button.payload);
                }
                break;
            case "close":
            default:
                onClose();
                break;
        }
    };

    const getTitleColor = () => {
        if (popupConfig.titleColor === "red") return "text-red-600";
        return "text-[#C19A6B]"; // Use WL title color as default
    };

    const rootClass = asPage
        ? `min-h-[100vh] ${
              isNotQualifiedSerifLayout ? "bg-[#F9F7F2]" : "bg-[#F5F4EF]"
          } flex flex-col overflow-auto`
        : "fixed inset-0 top-0 bg-[#F5F4EF] !z-[999999] flex items-start justify-start overflow-auto w-full min-h-[100vh]";

    return (
        <div
            className={rootClass}
            style={{
                animation: isOpen
                    ? "fadeIn 0.3s ease-in-out"
                    : "fadeOut 0.3s ease-in-out",
            }}
        >
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
            `}</style>

            {asPage && !isNotQualifiedSerifLayout && (
                <>
                    <QuestionnaireNavbar
                        onBackClick={onClose}
                        currentPage={currentPage + 1}
                    />
                    {/* Progress Bar */}
                    {currentPage !== 3 && !popupConfig.hideProgressBar && (
                        <div className="">
                            <ProgressBar
                                progress={
                                    progressBar >= 100
                                        ? 100
                                        : popupConfig.progress ||
                                          progressBar + 2
                                }
                            />
                        </div>
                    )}
                </>
            )}

            <div
                className={
                    asPage
                        ? `flex-1 flex ${
                              isNotQualifiedSerifLayout
                                  ? "items-start"
                                  : "items-start"
                          } justify-center overflow-auto`
                        : "flex-1 flex items-start justify-start overflow-auto"
                }
            >
                <div
                    className={
                        asPage
                            ? "w-full mt-4 max-w-4xl relative flex flex-col"
                            : "w-full h-full relative flex flex-col "
                    }
                >
                    {!asPage && (
                        <div className="flex items-center flex-col">
                            <Link href="/">
                                <CustomImage
                                    width="100"
                                    height="100"
                                    className={`mb-16 ${popupConfig.isWL ? "" : "mt-6"}`}
                                    src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
                                />
                            </Link>
                        </div>
                    )}

                    <div
                        className={
                            popupConfig.title === "You want something..."
                                ? "flex justify-start items-start"
                                : "flex justify-start items-start md:justify-center md:items-center"
                        }
                    >
                        <div
                            className={` px-4 md:px-0 max-w-4xl flex flex-col  ${
                                popupConfig.contentAlign === "left"
                                    ? "items-start"
                                    : "items-center justify-start mx-auto"
                            }`}
                        >
                            {isNotQualifiedSerifLayout ? (
                                <div className="w-full max-w-4xl pb-12 pt-6 md:pt-8">
                                    <p className="w-full text-center font-sans text-[15px] md:text-[17px] leading-[145%] text-[#251F20] mb-8 md:mb-10 px-1">
                                        {popupConfig.disqualificationEyebrow}
                                    </p>
                                    <p className="w-full text-left headers-font text-[1.1875rem] md:text-[1.375rem] leading-[150%] text-[#251F20] mb-6">
                                        {popupConfig.disqualificationMain}
                                    </p>
                                    <div
                                        className="w-full text-left headers-font text-base leading-[155%] text-[#251F20]"
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeHtml(
                                                popupConfig.disqualificationFooterHtml ||
                                                    "",
                                            ),
                                        }}
                                    />
                                    {popupConfig.buttons && (
                                        <div className="mt-10 flex w-full flex-col items-stretch gap-3">
                                            {popupConfig.buttons.map(
                                                (button, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() =>
                                                            handleButtonClick(
                                                                button,
                                                            )
                                                        }
                                                        disabled={
                                                            button.disabled
                                                        }
                                                        className={`h-[52px] w-full max-w-4xl py-3 rounded-full font-medium transition-colors ${
                                                            button.variant ===
                                                                "sky" &&
                                                            button.primary
                                                                ? "bg-[#A7885A] text-white hover:opacity-90"
                                                                : button.primary
                                                                  ? "bg-black text-white hover:bg-gray-800"
                                                                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        {button.label}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Optional image */}
                                    {popupConfig.image &&
                                        popupConfig.imageTop == true && (
                                            <div
                                                className={
                                                    asPage
                                                        ? "mx-auto"
                                                        : "w-full"
                                                }
                                            >
                                                <CustomImage
                                                    width="1000"
                                                    sizes="(max-width: 768px) 100vw, 500px"
                                                    height="1000"
                                                    src={popupConfig.image}
                                                    alt={popupConfig.title}
                                                    className={
                                                        popupConfig.imageStyle
                                                            ? popupConfig.imageStyle
                                                            : "rounded-lg w-[335px] h-[324px]"
                                                    }
                                                />
                                            </div>
                                        )}

                                    {popupConfig.component !== "Counter" &&
                                        popupConfig.component !==
                                            "YourWeightPopup" &&
                                        popupConfig.title && (
                                            <h3
                                                className={
                                                    popupConfig.headerStyle
                                                        ? popupConfig.headerStyle
                                                        : `text-[26px] md:text-[32px]  headers-font ${getTitleColor()} leading-[140%] mb-8`
                                                }
                                            >
                                                {popupConfig.titleIsHtml ? (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: sanitizeHtml(
                                                                popupConfig.title,
                                                            ),
                                                        }}
                                                    />
                                                ) : (
                                                    popupConfig.title
                                                )}
                                            </h3>
                                        )}

                                    {popupConfig.component === "Counter" ? (
                                        <Counter
                                            seconds={popupConfig.seconds || 3}
                                            texts={popupConfig.texts || []}
                                            title={popupConfig.title}
                                            onAction={onAction}
                                            nextPopup={
                                                popupConfig.nextPopup ||
                                                "YourWeightPopup"
                                            }
                                        />
                                    ) : popupConfig.component ===
                                      "WeightLossResultPasswordPopup" ? (
                                        <WeightLossResultPasswordPopup
                                            onSubmit={handlePasswordPopupSubmit}
                                            setUserData={setUserData}
                                            nextAction={popupConfig.nextAction}
                                            nextPayload={
                                                popupConfig.nextPayload
                                            }
                                        />
                                    ) : popupConfig.component ===
                                      "YourWeightPopup" ? (
                                        <YourWeightPopup
                                            weight={
                                                popupConfig.weight !== undefined
                                                    ? popupConfig.weight
                                                    : popupConfig.text
                                            }
                                            onAction={onAction}
                                            setUserData={setUserData}
                                        />
                                    ) : (
                                        <div
                                            className={
                                                popupConfig.messageStyle
                                                    ? popupConfig.messageStyle
                                                    : "text-[14px] md:text-[16px] leading-[140%] mb-6"
                                            }
                                        >
                                            {popupConfig.message &&
                                                popupConfig.message
                                                    .split("\n")
                                                    .map((line, index) => (
                                                        <p
                                                            key={index}
                                                            className={
                                                                index > 0
                                                                    ? "mt-4"
                                                                    : ""
                                                            }
                                                            dangerouslySetInnerHTML={{
                                                                __html: sanitizeHtml(
                                                                    line,
                                                                ),
                                                            }}
                                                        />
                                                    ))}
                                        </div>
                                    )}

                                    {popupConfig.content && (
                                        <div>
                                            {typeof popupConfig.content ===
                                            "string" ? (
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: sanitizeHtml(
                                                            popupConfig.content,
                                                        ),
                                                    }}
                                                />
                                            ) : (
                                                popupConfig.content
                                            )}
                                        </div>
                                    )}

                                    {/* Optional image */}
                                    {popupConfig.image &&
                                        popupConfig.imageTop === false && (
                                            <div
                                                className={
                                                    asPage
                                                        ? "mx-auto"
                                                        : "w-full"
                                                }
                                            >
                                                <CustomImage
                                                    width="1000"
                                                    sizes="(max-width: 768px) 100vw, 500px"
                                                    height="1000"
                                                    src={popupConfig.image}
                                                    alt={popupConfig.title}
                                                    className={
                                                        popupConfig.imageStyle
                                                            ? popupConfig.imageStyle
                                                            : "rounded-lg w-auto h-[350px] md:w-[335px] md:h-[324px]"
                                                    }
                                                />
                                            </div>
                                        )}
                                </>
                            )}

                            {popupConfig.PrivacyText == true && (
                                <>
                                    <div className="text-[10px] leading-[140%] font-medium text-[#BABABA] mt-2 mb-24">
                                        We respect your privacy. All of your
                                        information is securely stored on our
                                        HIPAA Compliant server.
                                    </div>
                                </>
                            )}

                            {/* Fixed bottom button area */}
                            {!isNotQualifiedSerifLayout && (
                                <div
                                    className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-center bg-white/90 px-4 pb-4 backdrop-blur-sm"
                                    style={{
                                        boxShadow:
                                            "0 -12px 30px rgba(255,255,255,0.95)",
                                    }}
                                >
                                    <div
                                        className={
                                            asPage
                                                ? "flex w-full max-w-[400px] flex-col items-center justify-center gap-3 sm:max-w-4xl"
                                                : "flex w-full flex-col items-center justify-center gap-3"
                                        }
                                    >
                                        {popupConfig.buttons &&
                                            popupConfig.buttons.map(
                                                (button, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() =>
                                                            handleButtonClick(
                                                                button,
                                                            )
                                                        }
                                                        disabled={
                                                            button.disabled
                                                        }
                                                        className={`h-[52px] w-full py-3 ${
                                                            popupConfig.title ===
                                                            "You want something..."
                                                                ? "w-full"
                                                                : "max-w-sm"
                                                        } items-center rounded-full font-medium transition-colors ${
                                                            button.variant ===
                                                                "sky" &&
                                                            button.primary
                                                                ? "bg-[#A7885A] text-white hover:opacity-90"
                                                                : button.primary
                                                                  ? "bg-black text-white hover:bg-gray-800"
                                                                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        {button.label}
                                                    </button>
                                                ),
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenericPopup;
