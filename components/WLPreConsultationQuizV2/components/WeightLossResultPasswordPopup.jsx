import Loader from "@/components/Loader";
import { isAuthenticated } from "@/lib/cart/cartService";
import { logger } from "@/utils/devLogger";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { usePassword } from "@/components/WLPreConsultationQuizV2/contexts/PasswordContext";
import { encryptPasswordWithServerKey } from "@/utils/encryptPasswordWithServerKey";

const WeightLossResultPasswordPopup = ({
    onSubmit,
    disabled,
    style,
    setUserData,
    nextAction = "openPopup",
    nextPayload = "YourWeightPopup",
}) => {
    const { password: contextPassword, setPassword: setContextPassword } =
        usePassword();
    const [isAuth, setIsAuth] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const hasMinLength = (pwd = "") => pwd.length >= 8;
    const hasUppercase = (pwd = "") => /[A-Z]/.test(pwd);
    const hasLowercase = (pwd = "") => /[a-z]/.test(pwd);
    const hasNumberOrSymbol = (pwd = "") => /[\d\W_]/.test(pwd);
    const meetsRegistrationPasswordRules = (pwd = "") =>
        hasMinLength(pwd) &&
        hasUppercase(pwd) &&
        hasLowercase(pwd) &&
        hasNumberOrSymbol(pwd);

    // Email validation (simple, robust enough for client-side)
    const isValidEmail = (e) => {
        if (!e || typeof e !== "string") return false;
        const s = e.trim();
        // Basic RFC-like check: local@domain.tld (no spaces)
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
    };

    const triggerNext = () => {
        if (typeof onSubmit !== "function") return;
        if (nextPayload !== undefined && nextPayload !== null) {
            onSubmit(nextAction, nextPayload);
            return;
        }
        onSubmit(nextAction);
    };

    // Run auth check on mount and call onSubmit if authenticated.
    // This must run in a useEffect to avoid updating state during render.
    React.useEffect(() => {
        try {
            if (isAuthenticated()) {
                setIsAuth(true);
                triggerNext();
            }
        } catch (e) {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkEmailExists = async (emailToCheck) => {
        if (!isValidEmail(emailToCheck)) return;

        try {
            setIsCheckingEmail(true);
            const res = await fetch("/api/check-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailToCheck }),
            });

            if (res.ok) {
                const data = await res.json();
                setEmailExists(data.registered === true);
            } else {
                // If check fails, default to \"not existing\" behaviour
                setEmailExists(false);
            }
        } catch (error) {
            console.error("Error checking email:", error);
            // Default to false if check fails
            setEmailExists(false);
        } finally {
            // Only show password field AFTER we've done the check
            setShowPasswordSection(true);
            setIsCheckingEmail(false);
        }
    };

    const maybeCheckEmailAndShowPassword = () => {
        if (isCheckingEmail) return;
        const trimmedEmail = String(email || "").trim();
        if (trimmedEmail.length === 0) return;
        if (!isValidEmail(trimmedEmail)) return;
        checkEmailExists(trimmedEmail);
    };

    const TryLogin = async ({ email, password }) => {
        try {
            setLoading(true);
            setPasswordError("");

            // Use password from Context (memory) or fallback to parameter
            const loginPassword = contextPassword || password || "";

            let isEncryptedPassword = false;
            const encryptResult =
                await encryptPasswordWithServerKey(loginPassword);
            logger.log("Form data:", encryptResult);
            if (encryptResult.error) {
                isEncryptedPassword = false;
                logger.error(
                    "Error fetching private or public keys:",
                    encryptResult.statusText,
                );
            }
            const { encryptedPassword } = encryptResult;
            if (encryptedPassword) {
                isEncryptedPassword = true;
            }

            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: email || "",
                    password: isEncryptedPassword
                        ? encryptedPassword
                        : loginPassword,
                    isEncryptedPassword,
                }),
            });
            if (res.ok) {
                toast.success("Logged in successfully");
                return true;
            } else {
                let data = null;
                try {
                    data = await res.json();
                } catch (e) {}
                const msg =
                    (data && (data.message || data.error)) || "Login failed";
                logger.log("Login failed:", msg);
                const userFacingError =
                    "Wrong password. Please try again or reset your password.";
                setPasswordError(userFacingError);
                toast.error(userFacingError);
                return false;
            }
        } catch (e) {
            console.error(e);
            const fallbackError =
                "Unable to verify your password right now. Please try again.";
            setPasswordError(fallbackError);
            toast.error(fallbackError);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (onSubmit) {
            setUserData((prev) => ({
                ...prev,
                email,
                password,
                agreePrivacy,
            }));

            if (emailExists) {
                const loggedIn = await TryLogin({ email, password });
                if (!loggedIn) return;
            }
            triggerNext();
        }
    };

    const isButtonDisabled =
        !email ||
        !isValidEmail(email) ||
        !password ||
        !agreePrivacy ||
        (!emailExists && !meetsRegistrationPasswordRules(password)) ||
        disabled;

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-end justify-center"
            style={{
                backdropFilter: "blur(2px)",
                background: "rgba(245,244,239,0.7)",
            }}
        >
            {loading && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-30">
                    <Loader />
                </div>
            )}
            <div className="w-full bg-white rounded-t-2xl">
                <div className="w-full md:w-[420px] max-w-[440px] rounded-t-[32px] bg-white  px-6 pt-8 pb-10 mx-auto">
                    <h2 className="text-center font-medium text-[24px] leading-[120%] mb-8">
                        See how much weight you could lose
                    </h2>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-6"
                    >
                        <div>
                            <label className="block text-[14px] font-medium mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="w-full border border-[#E5E5E5] rounded-lg px-4 py-4 text-[14px] focus:outline-none focus:border-black"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    // Email changed: hide password section until we re-check on blur.
                                    if (showPasswordSection) {
                                        setShowPasswordSection(false);
                                    }
                                    setEmailExists(false);
                                    setPassword("");
                                    setPasswordError("");
                                    setContextPassword("");
                                    // mark touched as user types so errors can show after interaction
                                    if (!emailTouched) setEmailTouched(true);
                                }}
                                onBlur={() => {
                                    if (!emailTouched) setEmailTouched(true);
                                    // Re-check email existence every time user leaves this field.
                                    maybeCheckEmailAndShowPassword();
                                }}
                                aria-invalid={
                                    emailTouched && !isValidEmail(email)
                                }
                                aria-describedby={
                                    emailTouched && !isValidEmail(email)
                                        ? "email-error"
                                        : undefined
                                }
                                required
                            />
                            {emailTouched && !isValidEmail(email) && (
                                <p
                                    id="email-error"
                                    className="mt-2 text-[12px] text-red-600"
                                    role="alert"
                                >
                                    Please enter a valid email address (e.g.
                                    name@domain.com)
                                </p>
                            )}
                            {isCheckingEmail && (
                                <p className="mt-2 text-[12px] text-[#666]">
                                    Checking email ...
                                </p>
                            )}
                        </div>
                        {/* Password field appears once email is validated and checked. */}
                        {showPasswordSection && (
                            <div>
                                <label className="block text-[14px] font-medium mb-2">
                                    {emailExists
                                        ? "Enter your password to log in"
                                        : "Create a Password"}
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        className="w-full border border-[#E5E5E5] rounded-lg px-4 py-4 text-[14px] focus:outline-none focus:border-black pr-12"
                                        placeholder={
                                            emailExists
                                                ? "Password"
                                                : "Must be at least 8 characters"
                                        }
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (passwordError)
                                                setPasswordError("");
                                            // Store in Context (memory) for use in registration/login
                                            setContextPassword(e.target.value);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]"
                                        onClick={() =>
                                            setShowPassword((v) => !v)
                                        }
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <svg
                                                width="22"
                                                height="22"
                                                viewBox="0 0 22 22"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M2 11C3.5 6.5 7.5 4 11 4C14.5 4 18.5 6.5 20 11C19.5 12.5 18.5 14 17 15.2M14.5 17C13.4 17.6 12.2 18 11 18C7.5 18 3.5 15.5 2 11C2.6 9.3 3.7 7.9 5.2 6.8M9 9.5C9.6 9.2 10.3 9 11 9C13.2 9 15 10.8 15 13C15 13.7 14.8 14.4 14.5 15M9 9.5L14.5 15M9 9.5L5.2 6.8"
                                                    stroke="#888"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                width="22"
                                                height="22"
                                                viewBox="0 0 22 22"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M2 11C3.5 6.5 7.5 4 11 4C14.5 4 18.5 6.5 20 11C18.5 15.5 14.5 18 11 18C7.5 18 3.5 15.5 2 11Z"
                                                    stroke="#888"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <circle
                                                    cx="11"
                                                    cy="11"
                                                    r="3"
                                                    stroke="#888"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {emailExists && passwordError && (
                                    <p
                                        className="mt-2 text-[12px] text-red-600"
                                        role="alert"
                                    >
                                        {passwordError}
                                    </p>
                                )}
                                {!emailExists && (
                                    <ul className="mt-2 text-[12px] text-[#000] list-none pl-0 space-y-1">
                                        <li
                                            className={`flex items-center gap-2 ${
                                                hasMinLength(password)
                                                    ? "text-green-600"
                                                    : "text-[#000]"
                                            }`}
                                        >
                                            {hasMinLength(password) ? (
                                                <span className="text-[12px] leading-none text-green-600">
                                                    ✓
                                                </span>
                                            ) : (
                                                <span className="text-[12px] leading-none text-black">
                                                    ○
                                                </span>
                                            )}
                                            <span>
                                                Password must be at least 8
                                                characters
                                            </span>
                                        </li>
                                        <li
                                            className={`flex items-center gap-2 ${
                                                hasUppercase(password) &&
                                                hasLowercase(password) &&
                                                hasNumberOrSymbol(password)
                                                    ? "text-green-600"
                                                    : "text-[#000]"
                                            }`}
                                        >
                                            {hasUppercase(password) &&
                                            hasLowercase(password) &&
                                            hasNumberOrSymbol(password) ? (
                                                <span className="text-[12px] leading-none text-green-600">
                                                    ✓
                                                </span>
                                            ) : (
                                                <span className="text-[12px] leading-none text-black">
                                                    ○
                                                </span>
                                            )}
                                            <span>
                                                Include uppercase, lowercase,
                                                and a number or symbol
                                            </span>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="privacy"
                                checked={agreePrivacy}
                                onChange={() => setAgreePrivacy((v) => !v)}
                                className="w-5 h-5 accent-black"
                            />
                            <label htmlFor="privacy" className="text-[12px]">
                                <span className="font-medium leading-[140%]">
                                    By clicking "Continue" I agree to the{" "}
                                    <Link
                                        href="/terms-of-use"
                                        className="text-[#00000080] font-bold underline"
                                    >
                                        Terms and Conditions
                                    </Link>{" "}
                                    and{" "}
                                    <Link
                                        href="/terms-of-use"
                                        className="text-[#00000080] font-bold underline"
                                    >
                                        Telehealth Consent
                                    </Link>{" "}
                                    and acknowledge the{" "}
                                    <Link
                                        href="/privacy-policy"
                                        className="text-[#00000080] font-bold underline"
                                    >
                                        Privacy Policy.
                                    </Link>
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className={`w-full mt-2 py-4 rounded-full h-[52px] text-[14px] font-semibold transition bg-black text-white ${
                                isButtonDisabled
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-900 "
                            }`}
                            disabled={isButtonDisabled}
                        >
                            View Results
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WeightLossResultPasswordPopup;
