"use client";

import React, { useState } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";
import { toast } from "react-toastify";
import { logger } from "@/utils/devLogger";
import { usePassword } from "@/components/WLPreConsultationQuizV2/contexts/PasswordContext";
import PhoneInput, { isValidPhone } from "@/components/PhoneInput";
import { encryptPasswordWithServerKey } from "@/utils/encryptPasswordWithServerKey";

const isValidEmail = (e) => {
    if (!e || typeof e !== "string") return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
};

const EyeIcon = ({ open }) =>
    open ? (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
                d="M2 11C3.5 6.5 7.5 4 11 4C14.5 4 18.5 6.5 20 11C19.5 12.5 18.5 14 17 15.2M14.5 17C13.4 17.6 12.2 18 11 18C7.5 18 3.5 15.5 2 11C2.6 9.3 3.7 7.9 5.2 6.8M9 9.5C9.6 9.2 10.3 9 11 9C13.2 9 15 10.8 15 13C15 13.7 14.8 14.4 14.5 15M9 9.5L14.5 15M9 9.5L5.2 6.8"
                stroke="#888"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ) : (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
                d="M2 11C3.5 6.5 7.5 4 11 4C14.5 4 18.5 6.5 20 11C18.5 15.5 14.5 18 11 18C7.5 18 3.5 15.5 2 11Z"
                stroke="#888"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="11" cy="11" r="3" stroke="#888" strokeWidth="1.5" />
        </svg>
    );

const Glp2ContactAuthStep = ({ userData, setUserData, onContinue }) => {
    const { setPassword: setContextPassword } = usePassword();

    const [email, setEmail] = useState(userData?.email || "");
    const [phone, setPhone] = useState(userData?.phone || "");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);

    const [emailTouched, setEmailTouched] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [emailExists, setEmailExists] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const setFieldError = (field, msg) =>
        setErrors((prev) => ({ ...prev, [field]: msg }));
    const clearFieldError = (field) =>
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });

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
                setEmailExists(false);
            }
        } catch (err) {
            logger.error("GLP2 ContactAuth check-email:", err);
            setEmailExists(false);
        } finally {
            setShowPasswordSection(true);
            setIsCheckingEmail(false);
        }
    };

    const handleEmailBlur = () => {
        if (!emailTouched) setEmailTouched(true);
        const trimmed = email.trim();
        if (isValidEmail(trimmed) && !isCheckingEmail) {
            checkEmailExists(trimmed);
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (showPasswordSection) setShowPasswordSection(false);
        setEmailExists(false);
        setPassword("");
        setContextPassword("");
        if (!emailTouched) setEmailTouched(true);
        clearFieldError("email");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setContextPassword(e.target.value);
        clearFieldError("password");
    };

    // Try logging in; returns true on success
    const tryLogin = async (emailVal, passwordVal) => {
        let isEncryptedPassword = false;
        const encryptResult = await encryptPasswordWithServerKey(passwordVal);
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
                username: emailVal.trim(),
                password: isEncryptedPassword ? encryptedPassword : passwordVal,
                isEncryptedPassword,
            }),
        });
        if (res.ok) return true;
        const data = await res.json().catch(() => ({}));

        let msg = "Login failed. Please try again.";
        if (data?.code === "incorrect_password") {
            msg = "The password you entered is incorrect. Please try again.";
        } else if (
            data?.code === "invalid_email" ||
            data?.code === "invalid_username"
        ) {
            msg = "No account found with that email address.";
        } else if (data?.error || data?.message) {
            msg = (data.error || data.message).replace(/<[^>]*>/g, "").trim();
        }

        throw new Error(msg);
    };

    // Convert MM/DD/YYYY → YYYY-MM-DD (required by /api/register)
    const formatDobForApi = (dob) => {
        if (!dob) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) return dob; // already correct
        if (dob.includes("/")) {
            const parts = dob.split("/");
            if (parts.length === 3) {
                const [mm, dd, yyyy] = parts;
                return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
            }
        }
        return dob;
    };

    // Register new user (two-step) then log in
    const registerAndLogin = async () => {
        let isEncryptedPassword = false;
        const encryptResult = await encryptPasswordWithServerKey(password);
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

        const mergedData = {
            first_name: userData?.firstName || "",
            last_name: userData?.lastName || "",
            email: email.trim(),
            password: isEncryptedPassword ? encryptedPassword : password,
            phone,
            date_of_birth: formatDobForApi(userData?.dateOfBirth || ""),
            province: userData?.province || "",
            gender: userData?.sex || "",
            isEncryptedPassword,
        };

        // Step 1: validate + email check
        const r1 = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...mergedData, register_step: 1 }),
        });
        const d1 = await r1.json();
        if (d1.error) throw new Error(d1.error);

        // Step 2: create user
        const r2 = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...mergedData, register_step: 2 }),
        });
        const d2 = await r2.json();
        if (d2.error) throw new Error(d2.error);

        // Log in to set cookies
        await tryLogin(email, password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        // Validate on click (button is always enabled). Show inline errors
        // under the relevant input and stop instead of silently doing nothing.
        if (!isValidEmail(email)) {
            setEmailTouched(true);
            return;
        }
        if (!showPasswordSection) {
            // Email hasn't been verified yet — reveal the password section.
            await checkEmailExists(email.trim());
            return;
        }
        if (isNewUser && !isValidPhone(phone)) {
            setFieldError("phone", "Please enter a valid phone number.");
            return;
        }
        if (!password) {
            setFieldError(
                "password",
                emailExists
                    ? "Please enter your password."
                    : "Please create a password.",
            );
            return;
        }
        if (isNewUser && !isPasswordValid(password)) {
            setFieldError(
                "password",
                "Password must be at least 8 characters and include uppercase and lowercase letters.",
            );
            return;
        }
        if (!agreePrivacy) {
            setFieldError(
                "consent",
                "Please agree to the terms to continue.",
            );
            return;
        }

        setLoading(true);
        try {
            // Save email + phone into userData (password never goes to localStorage)
            setUserData((prev) => ({
                ...prev,
                email: email.trim(),
                phone,
            }));

            if (emailExists) {
                await tryLogin(email, password);
                toast.success("Logged in successfully");
            } else {
                await registerAndLogin();
                toast.success("Account created successfully");
            }

            onContinue?.();
        } catch (err) {
            logger.error("GLP2 ContactAuth submit:", err);
            toast.error(
                err?.message || "Something went wrong. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    // New user needs: valid email, phone, password + consent
    // Existing user needs: valid email, password + consent
    const isNewUser = showPasswordSection && !emailExists;
    const isExistingUser = showPasswordSection && emailExists;

    // Password validation for new users:
    //   Rule 1 — at least 8 characters
    //   Rule 2 — contains both uppercase and lowercase letters
    const pwRule1 = (pw) => pw.length >= 8;
    const pwRule2 = (pw) => /[A-Z]/.test(pw) && /[a-z]/.test(pw);
    const isPasswordValid = (pw) => !!pw && pwRule1(pw) && pwRule2(pw);

    const passwordInvalid = isNewUser && password && !isPasswordValid(password);

    return (
        <div className="w-full h-full flex flex-col px-4 md:px-0">
            {loading && (
                <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-30">
                    <Loader />
                </div>
            )}

            <div className="w-full md:w-[580px] mx-auto flex-grow pb-32 md:pb-36">
                <h1 className="headers-font text-[28px] md:text-[32px] leading-[115%] text-[#251F20] mb-2">
                    {userData?.firstName
                        ? `${userData.firstName}, how can we reach you?`
                        : "How can we reach you?"}
                </h1>
                <p className="text-[14px] text-[#888] mb-8">
                    Our medical teams and pharmacy use email and text for
                    patient communication.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5"
                    noValidate
                >
                    {/* Email */}
                    <div>
                        <label className="block text-[14px] font-medium text-[#251F20] mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                            placeholder="your@email.com"
                            required
                            aria-invalid={emailTouched && !isValidEmail(email)}
                            className="w-full h-[52px] border border-[#E2E2E1] rounded-[8px] px-4 bg-white text-[15px] text-[#251F20] focus:outline-none focus:border-[#AE7E56]"
                        />
                        {emailTouched && !isValidEmail(email) && (
                            <p className="mt-1 text-[12px] text-red-500">
                                Please enter a valid email address.
                            </p>
                        )}
                        {isCheckingEmail && (
                            <p className="mt-1 text-[12px] text-[#888]">
                                Checking email…
                            </p>
                        )}
                        {isExistingUser && (
                            <p className="mt-1 text-[12px] text-[#AE7E56] font-medium">
                                Account found — enter your password to log in.
                            </p>
                        )}
                    </div>

                    {/* Phone — only for new users */}
                    {isNewUser && (
                        <div>
                            <label className="block text-[14px] font-medium text-[#251F20] mb-2">
                                Phone
                            </label>
                            <PhoneInput
                                id="glp2-phone"
                                name="phone"
                                value={phone}
                                onChange={(formatted) => {
                                    setPhone(formatted);
                                    clearFieldError("phone");
                                }}
                                placeholder="(123) 456-7890"
                                inputClassName={`w-full h-[52px] border rounded-[8px] px-4 bg-white text-[15px] text-[#251F20] focus:outline-none ${
                                    (errors.phone || (!isValidPhone(phone) && phone))
                                        ? "border-red-400 focus:border-red-400"
                                        : "border-[#E2E2E1] focus:border-[#AE7E56]"
                                }`}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-[12px] text-red-500">
                                    {errors.phone}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Password — shown after email check */}
                    {showPasswordSection && (
                        <div>
                            <label className="block text-[14px] font-medium text-[#251F20] mb-2">
                                {emailExists ? "Password" : "Create a password"}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    placeholder={
                                        emailExists
                                            ? "Enter your password"
                                            : "Min. 8 characters"
                                    }
                                    className={`w-full h-[52px] border rounded-[8px] px-4 pr-12 bg-white text-[15px] text-[#251F20] focus:outline-none ${
                                        passwordInvalid || errors.password
                                            ? "border-red-400 focus:border-red-400"
                                            : "border-[#E2E2E1] focus:border-[#AE7E56]"
                                    }`}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888]"
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-[12px] text-red-500">
                                    {errors.password}
                                </p>
                            )}
                            {!emailExists && (
                                <ul className="mt-2 text-[12px] list-disc pl-5 space-y-1">
                                    <li
                                        className={
                                            pwRule1(password)
                                                ? "text-green-600"
                                                : "text-[#555]"
                                        }
                                    >
                                        At least 8 characters
                                    </li>
                                    <li
                                        className={
                                            pwRule2(password)
                                                ? "text-green-600"
                                                : "text-[#555]"
                                        }
                                    >
                                        Contains uppercase and lowercase letters
                                    </li>
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Consent checkbox */}
                    <div className="flex items-start gap-3 mt-1">
                        <input
                            type="checkbox"
                            id="glp2-privacy"
                            checked={agreePrivacy}
                            onChange={() => {
                                setAgreePrivacy((v) => !v);
                                clearFieldError("consent");
                            }}
                            className="mt-0.5 w-5 h-5 accent-black shrink-0"
                        />
                        <label
                            htmlFor="glp2-privacy"
                            className="text-[12px] leading-[150%]"
                        >
                            I understand that my information is never shared, is
                            protected by HIPAA and agree to the{" "}
                            <Link
                                href="/terms-of-use"
                                target="_blank"
                                className="underline font-medium"
                            >
                                terms and privacy policies
                            </Link>{" "}
                            and to be contacted as necessary by MyRocky and its
                            medical partners and can opt-out at anytime.
                        </label>
                    </div>
                    {errors.consent && (
                        <p className="text-[12px] text-red-500">
                            {errors.consent}
                        </p>
                    )}
                </form>
            </div>

            <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] backdrop-blur-sm">
                <div className="w-[335px] md:w-[520px] max-w-xl">
                    <button
                        type="submit"
                        form=""
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full py-3 flex items-center justify-center gap-2 rounded-full h-[52px] font-medium border-none focus:outline-none focus:ring-0 ${
                            loading
                                ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                                : "bg-black text-white"
                        }`}
                    >
                        {loading ? "Please wait…" : "Next →"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Glp2ContactAuthStep;
