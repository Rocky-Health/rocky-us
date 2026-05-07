"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";
import { encryptPasswordWithServerKey } from "@/utils/encryptPasswordWithServerKey";
import { logger } from "@/utils/devLogger";

function normalizePhoneDigits(value) {
  return value.replace(/\D/g, "");
}

function looksLikeEmail(value) {
  const v = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

const EyeIcon = ({ open }) =>
  open ? (
    <svg
      className="h-5 w-5"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 11C3.5 6.5 7.5 4 11 4C14.5 4 18.5 6.5 20 11C19.5 12.5 18.5 14 17 15.2M14.5 17C13.4 17.6 12.2 18 11 18C7.5 18 3.5 15.5 2 11C2.6 9.3 3.7 7.9 5.2 6.8M9 9.5C9.6 9.2 10.3 9 11 9C13.2 9 15 10.8 15 13C15 13.7 14.8 14.4 14.5 15M9 9.5L14.5 15M9 9.5L5.2 6.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg className="h-5 w-5" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path
        d="M2 11C3.5 6.5 7.5 4 11 4C14.5 4 18.5 6.5 20 11C18.5 15.5 14.5 18 11 18C7.5 18 3.5 15.5 2 11Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );

export default function PrEdQuiz2PatientInfoStep({
  step,
  onContinue,
  onBack,
  selectedValues,
  eligibilityAnswer,
}) {
  const [firstName, setFirstName] = useState(selectedValues?.firstName || "");
  const [lastName, setLastName] = useState(selectedValues?.lastName || "");
  const [email, setEmail] = useState(selectedValues?.email || "");
  const [phone, setPhone] = useState(selectedValues?.phone || "");
  const [smsConsent, setSmsConsent] = useState(
    Boolean(selectedValues?.smsConsent),
  );

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [showAuthFields, setShowAuthFields] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const phoneDigits = useMemo(() => normalizePhoneDigits(phone), [phone]);

  const headline =
    step.headline ||
    "This is looking great! Last thing we need before we apply your discounts";
  const introLine = step.introLine;
  const privacyLine =
    step.privacyLine || "Your information is protected by HIPAA.";

  const pwRule1 = (pw) => pw.length >= 8;
  const pwRule2 = (pw) => /[A-Z]/.test(pw) && /[a-z]/.test(pw);
  const isNewPasswordValid = (pw) => !!pw && pwRule1(pw) && pwRule2(pw);

  const checkEmailRegistered = async (value) => {
    if (!looksLikeEmail(value)) return;
    try {
      setIsCheckingEmail(true);
      const res = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmailExists(data.registered === true);
      } else {
        setEmailExists(false);
      }
    } catch (err) {
      logger.error("pr-ed-quiz-2 check-email:", err);
      setEmailExists(false);
    } finally {
      setShowAuthFields(true);
      setIsCheckingEmail(false);
    }
  };

  const handleEmailBlur = () => {
    if (!emailTouched) setEmailTouched(true);
    const trimmed = email.trim();
    if (looksLikeEmail(trimmed) && !isCheckingEmail) {
      checkEmailRegistered(trimmed);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setShowAuthFields(false);
    setEmailExists(false);
    setPassword("");
    if (!emailTouched) setEmailTouched(true);
  };

  const encryptLoginPassword = async (plain) => {
    let useEnc = false;
    const enc = await encryptPasswordWithServerKey(plain);
    if (!enc.error && enc.encryptedPassword) useEnc = true;
    return {
      payload: useEnc ? enc.encryptedPassword : plain,
      isEncryptedPassword: useEnc,
    };
  };

  const tryLogin = async (emailVal, passwordVal) => {
    const { payload, isEncryptedPassword } =
      await encryptLoginPassword(passwordVal);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: emailVal.trim(),
        password: payload,
        isEncryptedPassword,
      }),
    });
    if (res.ok) return true;
    const data = await res.json().catch(() => ({}));
    let msg = "Login failed. Please try again.";
    if (data?.code === "incorrect_password") {
      msg = "That password doesn’t match this email. Try again or reset on myRocky.";
    } else if (
      data?.code === "invalid_email" ||
      data?.code === "invalid_username"
    ) {
      msg = "We couldn’t find that email.";
    } else if (data?.error || data?.message) {
      msg = String(data.error || data.message)
        .replace(/<[^>]*>/g, "")
        .trim();
    }
    throw new Error(msg);
  };

  const formatDobForApi = () => {
    const y = String(eligibilityAnswer?.year || "").trim();
    const m = String(eligibilityAnswer?.month || "").trim();
    const d = String(eligibilityAnswer?.day || "").trim();
    if (!y || !m || !d) return "";
    return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  };

  // Match GLP2 behavior: step 1 validate, step 2 create account, then login to set auth cookies.
  const registerAndLogin = async () => {
    const { payload, isEncryptedPassword } =
      await encryptLoginPassword(password);
    const baseData = {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      password: payload,
      phone: phoneDigits,
      date_of_birth: formatDobForApi(),
      province: String(eligibilityAnswer?.state || "").trim(),
      gender: String(eligibilityAnswer?.sexAtBirth || "").trim(),
      isEncryptedPassword,
    };

    const r1 = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...baseData,
        register_step: 1,
      }),
    });
    const d1 = await r1.json();
    if (!r1.ok || (!d1.success && d1.error)) {
      throw new Error(d1.error || "Could not verify this email and password.");
    }

    const r2 = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...baseData,
        register_step: 2,
      }),
    });
    const d2 = await r2.json();
    if (!r2.ok || !d2.success) {
      throw new Error(d2.error || "Could not create your account.");
    }

    await tryLogin(email, password);
  };

  const baseFieldsOk =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    looksLikeEmail(email) &&
    phoneDigits.length >= 10 &&
    smsConsent &&
    showAuthFields &&
    password.length > 0;

  const passwordOkForSubmit = emailExists
    ? password.length > 0
    : isNewPasswordValid(password);

  const canSubmit = baseFieldsOk && passwordOkForSubmit;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phoneDigits,
        smsConsent,
      };

      if (emailExists) {
        await tryLogin(email, password);
        toast.success("Signed in — you’re all set to continue.");
      } else {
        await registerAndLogin();
        toast.success("Account created — you’re signed in.");
      }
      onContinue?.(payload);
    } catch (err) {
      logger.error("PrEdQuiz2 patient auth:", err);
      toast.error(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "poppins-font w-full rounded-2xl border-2 border-[#e5e2dc] bg-white px-4 pb-3 pt-5 text-[#1c1b19] outline-none transition focus:border-[#AE7E56]";

  const isNewUser = showAuthFields && !emailExists;
  const passwordInvalid =
    isNewUser && password.length > 0 && !isNewPasswordValid(password);

  return (
    <section className="wizard-content mx-auto w-full max-w-6xl px-4 pb-16">
      {loading ? (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/25">
          <Loader />
        </div>
      ) : null}

      <div className="mx-auto max-w-xl pt-2">
        <button
          type="button"
          onClick={() => onBack?.()}
          className="inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-[#AE7E56]"
          aria-label="Go back"
        >
          <span className="text-lg">←</span>
        </button>
      </div>

      <div className="mx-auto mt-6 max-w-xl">
        <p className="poppins-font mb-3 text-sm font-medium tracking-wide text-[#AE7E56]">
          {step.eyebrow || "Patient info"}
        </p>
        <h2
          className="headers-font mb-6 text-left text-4xl font-black leading-snug text-[#0d1728]"
          style={{ lineHeight: 1 }}
        >
          {headline}
        </h2>
        {introLine ? (
          <p className="poppins-font mb-4 text-base leading-relaxed text-[#1b2431]/85">
            {introLine}
          </p>
        ) : null}
        <p className="poppins-font mb-8 text-sm text-[#1b2431]/80">
          {privacyLine}
        </p>

        <div className="space-y-4">
          <div className="relative">
            <label className="poppins-font block">
              <span className="absolute left-4 top-2.5 text-xs text-gray-500">
                First Name
              </span>
              <input
                type="text"
                name="firstName"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`${inputClass} min-h-[3.25rem]`}
              />
            </label>
          </div>
          <div className="relative">
            <label className="poppins-font block">
              <span className="absolute left-4 top-2.5 text-xs text-gray-500">
                Last Name
              </span>
              <input
                type="text"
                name="lastName"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`${inputClass} min-h-[3.25rem]`}
              />
            </label>
          </div>
          <div className="relative">
            <label className="poppins-font block">
              <span className="absolute left-4 top-2.5 text-xs text-gray-500">
                Phone Number
              </span>
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${inputClass} min-h-[3.25rem]`}
              />
            </label>
          </div>
          <div className="relative">
            <label className="poppins-font block">
              <span className="absolute left-4 top-2.5 text-xs text-gray-500">
                Email Address
              </span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                className={`${inputClass} min-h-[3.25rem]`}
              />
            </label>
            {emailTouched && !looksLikeEmail(email) && email.length > 0 ? (
              <p className="poppins-font mt-1 text-xs text-red-600">
                Please enter a valid email.
              </p>
            ) : null}
            {isCheckingEmail ? (
              <p className="poppins-font mt-1 text-xs text-[#6b7280]">
                Checking email…
              </p>
            ) : null}
            {showAuthFields && looksLikeEmail(email) && !isCheckingEmail ? (
              <p
                className={`poppins-font mt-1 text-xs ${
                  emailExists ? "text-[#AE7E56]" : "text-[#6b7280]"
                }`}
              >
                {emailExists
                  ? "This email already has a myRocky account — sign in below."
                  : "New email — create a password for myRocky below."}
              </p>
            ) : null}
          </div>

          {showAuthFields ? (
            <div className="relative">
              <label className="poppins-font block">
                <span className="absolute left-4 top-2.5 z-[1] text-xs text-gray-500">
                  {emailExists ? "Password" : "Create password"}
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete={emailExists ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={emailExists ? "" : "At least 8 characters"}
                    className={`${inputClass} min-h-[3.25rem] pr-12 ${
                      passwordInvalid ? "border-red-400" : ""
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </label>
              {!emailExists ? (
                <ul className="poppins-font mt-2 list-disc space-y-1 pl-5 text-xs">
                  <li
                    className={
                      pwRule1(password) ? "text-green-700" : "text-[#555]"
                    }
                  >
                    At least 8 characters
                  </li>
                  <li
                    className={
                      pwRule2(password) ? "text-green-700" : "text-[#555]"
                    }
                  >
                    Uppercase and lowercase letters
                  </li>
                </ul>
              ) : (
                <p className="poppins-font mt-2 text-xs text-[#6b7280]">
                  Forgot?{" "}
                  <Link
                    href="/login-register?viewshow=forgot"
                    className="font-medium text-[#AE7E56] underline underline-offset-2"
                  >
                    Reset password
                  </Link>
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="poppins-font mt-6 rounded-2xl bg-[#ecebea] px-4 py-4 ring-1 ring-black/[0.04]">
          <label className="flex cursor-pointer gap-3 text-left text-sm leading-snug text-[#1c1b19]">
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
              className="mt-0.5 h-8 w-8 shrink-0 cursor-pointer rounded-md border-2 border-[#1c1b19] bg-white accent-[#1c1b19]"
            />
            <span>
              By continuing, you confirm that you've read and agree to our{" "}
              <Link href="/terms-of-use" className="text-[#AE7E56] underline">
                Terms and Conditions
              </Link>
              ,{" "}
              <Link href="/terms-of-use" className="text-[#AE7E56] underline">
                Professional Disclosure
              </Link>
              ,{" "}
              <Link href="/privacy-policy" className="text-[#AE7E56] underline">
                Privacy Policy
              </Link>
              ,{" "}
              <Link href="/terms-of-use" className="text-[#AE7E56] underline">
                Telehealth Consent
              </Link>{" "}
              and{" "}
              <Link href="/implied-consent" className="text-[#AE7E56] underline">
                Implied Consent.
              </Link>
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="headers-font relative mt-10 flex w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-[#2d2c2a] to-[#141312] px-6 py-4 text-base font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span>{step.ctaLabel || "Continue"}</span>
          <span className="ml-3 inline-flex" aria-hidden>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </span>
        </button>
      </div>
    </section>
  );
}
