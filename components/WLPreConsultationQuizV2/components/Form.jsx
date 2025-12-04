"use client";
import React, { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import { toast } from "react-toastify";
import PasswordModal from "./PasswordModal";

import Loader from "@/components/Loader";
import Link from "next/link";
import SignInLink from "./SignInLink";
import StickyButton from "./StickyButton";
import DOBInput from "@/components/shared/DOBInput";
import {
  isWordPressCriticalError,
  transformPaymentError,
} from "@/utils/paymentErrorHandler";

const Form = ({
  config,
  userData,
  setUserData,
  onContinue,
  onStepHasConditionalActions,
  onAction,
}) => {
  // Fallback for missing config or fields
  if (!config || !Array.isArray(config.fields)) {
    return (
      <div className="flex flex-col items-center w-full">
        <h2 className="text-xl font-bold text-center mb-2">Form</h2>
        <div className="w-full max-w-md text-center text-red-500">
          Form configuration error: config or fields missing.
        </div>
      </div>
    );
  }

  // Dynamically initialize state for each field in config.fields
  // Support checkbox fields in two modes:
  // - multiple options (Array) => store array of selected option ids
  // - single consent checkbox (no options) => store boolean
  const initialFieldState = {};
  config.fields.forEach((field) => {
    if (field.type === "checkbox") {
      if (Array.isArray(field.options)) {
        initialFieldState[field.id] = userData?.[field.id] || [];
      } else {
        initialFieldState[field.id] = userData?.[field.id] ?? false;
      }
    } else {
      initialFieldState[field.id] = userData?.[field.id] || "";
    }
  });
  const [fieldsState, setFieldsState] = useState(initialFieldState);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingContinue, setPendingContinue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Track which fields the user has "completed" (blurred or paused typing)
  const [completedFields, setCompletedFields] = useState(() => {
    const init = {};
    config.fields.forEach((f) => {
      const v = initialFieldState[f.id];
      if (Array.isArray(v)) init[f.id] = v.length > 0;
      else if (typeof v === "string") init[f.id] = v.trim().length > 0;
      else init[f.id] = !!v;
    });
    return init;
  });
  const debounceTimersRef = React.useRef({});

  // Determine whether the form includes an input with id 'password'
  const hasPasswordField = React.useMemo(() => {
    try {
      return (
        Array.isArray(config?.fields) &&
        config.fields.some((f) => String(f.id).toLowerCase() === "password")
      );
    } catch (e) {
      return false;
    }
  }, [config]);

  // If a password field exists, require password length > 8 (i.e. at least 9).
  const requiredPasswordLength = hasPasswordField ? 9 : 6;

  useEffect(() => {
    const updatedState = {};
    config.fields.forEach((field) => {
      if (field.type === "checkbox") {
        if (Array.isArray(field.options)) {
          updatedState[field.id] = userData?.[field.id] || [];
        } else {
          updatedState[field.id] = userData?.[field.id] ?? false;
        }
      } else {
        updatedState[field.id] = userData?.[field.id] || "";
      }
    });
    setFieldsState(updatedState);
    // Update completedFields according to new userData
    const updatedCompleted = {};
    config.fields.forEach((f) => {
      const v = updatedState[f.id];
      if (Array.isArray(v)) updatedCompleted[f.id] = v.length > 0;
      else if (typeof v === "string")
        updatedCompleted[f.id] = v.trim().length > 0;
      else updatedCompleted[f.id] = !!v;
    });
    setCompletedFields(updatedCompleted);
  }, [userData, config]);

  // Clear debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach((t) => clearTimeout(t));
      debounceTimersRef.current = {};
    };
  }, []);

  // Toggle handler for checkbox fields
  const handleCheckboxToggle = (field, optionId) => {
    setFieldsState((prev) => {
      const cur = prev[field.id];
      // Multi-option checkbox (array of selected ids)
      if (Array.isArray(field.options)) {
        const set = new Set(Array.isArray(cur) ? cur : []);
        if (set.has(optionId)) set.delete(optionId);
        else set.add(optionId);
        // mark completed immediately for multi-option
        setCompletedFields((cprev) => ({ ...cprev, [field.id]: set.size > 0 }));
        // if this field has conditionalActions for this option, trigger it
        try {
          triggerConditionalActionForField(field, optionId);
        } catch (e) {
          logger.error("Error triggering conditionalAction for checkbox:", e);
        }
        return { ...prev, [field.id]: Array.from(set) };
      }
      // Single consent checkbox (boolean)
      const next = { ...prev, [field.id]: !cur };
      setCompletedFields((cprev) => ({
        ...cprev,
        [field.id]: !!next[field.id],
      }));

      // If single consent has conditionalActions keyed by boolean, trigger it
      try {
        triggerConditionalActionForField(field, !!next[field.id]);
      } catch (e) {
        logger.error(
          "Error triggering conditionalAction for consent checkbox:",
          e
        );
      }
      return next;
    });
  };

  // Helper to robustly find and trigger a conditionalAction for a field given a value
  const triggerConditionalActionForField = (field, value) => {
    logger.log("check triggering");
    if (!field || !field.conditionalActions) return null;
    // try direct match
    let key = value;
    let actionCfg = field.conditionalActions?.[key];
    logger.log(
      "Checking conditionalActions for field",
      field.id,
      "value:",
      value,
      "key:",
      key,
      "found:",
      actionCfg
    );
    if (!actionCfg) {
      // try stringified
      key = String(value);
      actionCfg = field.conditionalActions?.[key];
    }
    if (!actionCfg && Array.isArray(field.options)) {
      // try matching against option.id or option.value
      for (const opt of field.options) {
        if (opt == null) continue;
        if (opt.id === value || opt.value === value || opt.label === value) {
          // try keys by id/value/label
          actionCfg =
            field.conditionalActions?.[opt.id] ||
            field.conditionalActions?.[opt.value] ||
            field.conditionalActions?.[opt.label];
          if (actionCfg) break;
        }
      }
    }
    if (!actionCfg) {
      // fallback: try boolean strings
      const boolKey = String(!!value);
      actionCfg = field.conditionalActions?.[boolKey];
    }
    if (actionCfg && typeof onAction === "function") {
      logger.log(
        `Triggering conditional action for field ${field.id} key=${String(
          value
        )}`,
        actionCfg
      );
      onAction(actionCfg.action, actionCfg.popupType || actionCfg);
      return actionCfg;
    }
    return null;
  };

  const transformErrMsg = (response) => {
    // Return the parsed object or extract specific error message
    if (typeof response !== "string" || response !== null) {
      switch (response.code) {

        case "incorrect_password":
          return "The password you entered is incorrect. Please try again.";
        default:
          return "An unexpected error occurred. Please try again later.";
      }
    } else {
      return response;
    }
  };

  const handleChange = (id, value) => {
    setFieldsState((prev) => ({ ...prev, [id]: value }));
    
    // Update userData immediately ONLY for fields that control conditional navigation
    // This ensures conditional navigation has the latest value without interfering with other inputs
    const field = config.fields.find((f) => f.id === id);
    const textLike =
      field &&
      ["text", "email", "tel", "number", "textarea"].includes(field.type);
    
    // Check if this field is used for conditional navigation
    const isConditionalField = config.field === id;
    
    if (!textLike && isConditionalField) {
      // For radio, select fields that control navigation - update userData immediately
      setUserData((prev) => ({ ...prev, [id]: value }));
    }
    
    // Debounce text-like inputs to mark completed when user pauses
    if (textLike) {
      setCompletedFields((prev) => ({ ...prev, [id]: false }));
      if (debounceTimersRef.current[id])
        clearTimeout(debounceTimersRef.current[id]);
      debounceTimersRef.current[id] = setTimeout(() => {
        setCompletedFields((prev) => ({ ...prev, [id]: true }));
        delete debounceTimersRef.current[id];
      }, 700);
    } else {
      setCompletedFields((prev) => ({ ...prev, [id]: true }));
    }
    // After updating state, check for conditionalActions on this field
    try {
      const field = config.fields.find((f) => f.id === id);
      if (field && field.conditionalActions) {
        triggerConditionalActionForField(field, value);
      }
    } catch (e) {
      logger.error("Error checking conditionalActions in handleChange:", e);
    }
  };

  // Mark a field completed on blur (user finished typing)
  const handleBlurMark = (id) => {
    if (debounceTimersRef.current[id]) {
      clearTimeout(debounceTimersRef.current[id]);
      delete debounceTimersRef.current[id];
    }
    setCompletedFields((prev) => ({ ...prev, [id]: true }));
  };

  // Helper: format date as DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const str = String(dateStr);
    // If dateStr is a native Date string, format as DD/MM/YYYY
    if (str.match(/^[A-Za-z]{3} /)) {
      const d = new Date(str);
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return str;
  };

  // Helper: check if user is 18+ years old
  const isValidAge = (dateStr) => {
    if (!dateStr) return false;
    const str = String(dateStr);
    let birthDate;
    if (str.match(/^[A-Za-z]{3} /)) {
      birthDate = new Date(str);
    } else if (str.includes("-")) {
      birthDate = new Date(str);
    } else if (str.includes("/")) {
      // MM/DD/YYYY or DD/MM/YYYY
      const parts = str.split("/");
      if (parts[2] && parts[0].length <= 2) {
        // Assume DD/MM/YYYY
        birthDate = new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0])
        );
      } else {
        // Fallback
        birthDate = new Date(str);
      }
    }
    if (!birthDate || isNaN(birthDate.getTime())) return false;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 18;
  };

  // Helper: check if email is valid format
  const isValidEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    return /\S+@\S+\.\S+/.test(email.trim());
  };

  // Reusable registration logic for both WLFlow1 and WLFlow2
  const registerUser = async (mergedUserData) => {
    setLoading(true);
    // Step 1 validation (name, email, password)
    if (!mergedUserData.firstName || !mergedUserData.lastName) {
      toast.error("Please enter your full name");
      setLoading(false);
      return false;
    }
    if (!mergedUserData.email) {
      toast.error("Email address is required");
      setLoading(false);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(mergedUserData.email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return false;
    }
    if (!mergedUserData.password) {
      toast.error("Password is required");
      setLoading(false);
      return false;
    }
    if (mergedUserData.password.length < requiredPasswordLength) {
      toast.error(
        `Password must be at least ${requiredPasswordLength} characters`
      );
      setLoading(false);
      return false;
    }

    // Step 2 validation (phone, dob, province)
    if (!mergedUserData.phone) {
      toast.error("Phone number is required");
      setLoading(false);
      return false;
    }
    if (!mergedUserData.dateOfBirth) {
      toast.error("Date of birth is required");
      setLoading(false);
      return false;
    }
    if (!mergedUserData.province) {
      toast.error("Province is required");
      setLoading(false);
      return false;
    }

    // Format date_of_birth to YYYY-MM-DD if needed
    let formattedDOB = mergedUserData.dateOfBirth;
    if (formattedDOB && formattedDOB.includes("/")) {
      const parts = formattedDOB.split("/");
      if (parts.length === 3) {
        formattedDOB = `${parts[2]}-${parts[1].padStart(
          2,
          "0"
        )}-${parts[0].padStart(2, "0")}`;
      }
    }

    // Call register API (step 1)
    try {
      const res1 = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: mergedUserData.firstName,
          last_name: mergedUserData.lastName,
          email: mergedUserData.email,
          password: mergedUserData.password,
          register_step: 1,
        }),
      });
      const data1 = await res1.json();
      if (!res1.ok || !data1.success) {
        toast.error(data1.error || "Step 1 registration failed");
        setLoading(false);
        return false;
      }

      // Call register API (step 2)
      const res2 = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: mergedUserData.firstName,
          last_name: mergedUserData.lastName,
          email: mergedUserData.email,
          password: mergedUserData.password,
          phone: mergedUserData.phone,
          date_of_birth: formattedDOB,
          province: mergedUserData.province,
          gender: mergedUserData.gender,
          register_step: 2,
        }),
      });
      const data2 = await res2.json();
      if (!res2.ok || !data2.success) {
        toast.error(data2.error || "Step 2 registration failed");
        setLoading(false);
        return false;
      }
      //toast.success(data2.message || "Registration successful!");
      setLoading(false);
      return true;
    } catch (err) {
      toast.error("Registration failed. Please try again.");
      setLoading(false);
      logger.error(err);
      return false;
    }
  };

  const handleContinue = async () => {
    // If the form includes a password input and the user has entered a password,
    // ensure it meets the required length before proceeding. This prevents the
    // user from continuing when password validation fails.
    try {
      if (hasPasswordField) {
        const pw = fieldsState.password ?? userData?.password ?? "";
        if (pw && pw.length > 0 && pw.length < requiredPasswordLength) {
          // Block continuation; let registerUser show the user-facing message
          return;
        }
      }
    } catch (e) {
      // ignore any unexpected errors in this quick validation
    }
    // On Continue: check visible fields for conditionalActions and trigger them first.
    try {
      for (const field of visibleFields) {
        if (!field.conditionalActions) continue;
        const val = fieldsState[field.id];
        if (Array.isArray(val)) {
          for (const v of val) {
            const acted = triggerConditionalActionForField(field, v);
            if (acted) return; // stop continue if popup/action fired
          }
        } else if (val !== null && val !== undefined && val !== "") {
          const acted = triggerConditionalActionForField(field, val);
          if (acted) return;
        }
      }
    } catch (e) {
      logger.error("Error while evaluating conditionalActions on continue:", e);
    }

    // If this is the contact info step (step 17), show password modal before continuing
    if (config.id === "contactInfo") {
      if (
        typeof userData["password"] === "string" &&
        userData["password"].trim().length > 0
      ) {
        // Merge latest form fields and password into userData
        const mergedUserData = { ...userData, ...fieldsState };
        setUserData(mergedUserData);

        if (mergedUserData.phone) {
          const success = await registerUser(mergedUserData);
          if (success && onContinue) onContinue();
          setShowAuthModal(true);
          return;
        }
      }

      setShowPasswordModal(true);

      setPendingContinue(true);
      return;
    }
    // If this is WLFlow2 step 3 (basicInfo), register directly
    if (config.id === "basicInfo2") {
      // Merge fields into userData
      const newFields = { ...fieldsState };
      config.fields.forEach((field) => {
        if (field.type === "date" && newFields[field.id]) {
          newFields[field.id] = formatDate(newFields[field.id]);
        }
      });
      const mergedUserData = { ...userData, ...newFields };
      setUserData(mergedUserData);
      // Prompt for password if not present
      if (!mergedUserData.password) {
        toast.error(
          "Password is required. Please go back and enter your password."
        );
        return;
      }
      const success = await registerUser(mergedUserData);
      if (success && onContinue) onContinue();
      return;
    }

    if (config.id === "register_form") {
      // Handle registration form submission
      const mergedUserData = { ...userData, ...fieldsState };
      setUserData(mergedUserData);
      const success = await registerUser(mergedUserData);
      if (success && onContinue) onContinue();
      return;
    }
    // Default: just merge fields and continue
    const newFields = { ...fieldsState };
    config.fields.forEach((field) => {
      if (field.type === "date" && newFields[field.id]) {
        newFields[field.id] = formatDate(newFields[field.id]);
      }
    });
    setUserData({
      ...userData,
      ...newFields,
    });
    if (onContinue) onContinue();
  };

  const handlePasswordSubmit = async (password) => {
    setShowPasswordModal(false);
    setPendingContinue(false);
    // Merge latest form fields and password into userData
    const mergedUserData = { ...userData, ...fieldsState, password };
    setUserData(mergedUserData);

    if (mergedUserData.phone) {
      const success = await registerUser(mergedUserData);
      if (success && onContinue) onContinue();
      setShowAuthModal(true);
      return;
    }

    onContinue();
  };

  // For date fields, require valid age (24+)
  // Helper: determine if a field should be visible based on showInCondition
  const isFieldVisible = (field) => {
    if (!field.showInCondition) return true;

    // Two supported shapes:
    // 1) string -> field id to check truthiness
    // 2) object { fieldId, value } or { fieldId, values }
    const cond = field.showInCondition;
    if (typeof cond === "string") {
      // require the controlling field to be completed
      if (!completedFields[cond]) return false;
      const v = fieldsState[cond];
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "string") return v.trim().length > 0;
      return !!v;
    }
    if (typeof cond === "object" && cond.fieldId) {
      // require the controlling field to be completed
      if (!completedFields[cond.fieldId]) return false;
      const target = fieldsState[cond.fieldId];
      if (cond.hasOwnProperty("value")) {
        return target === cond.value;
      }
      if (Array.isArray(cond.values)) {
        return cond.values.includes(target);
      }
      // fallback to truthiness
      if (Array.isArray(target)) return target.length > 0;
      if (typeof target === "string") return target.trim().length > 0;
      return !!target;
    }

    // default: show
    return true;
  };

  // For date fields, require valid age (18+) but only for visible fields
  const visibleFields = config.fields.filter(isFieldVisible);

  // detect if any visible field defines conditionalActions
  const [hasConditionalActions, setHasConditionalActions] = useState(false);
  useEffect(() => {
    const has = visibleFields.some(
      (f) =>
        f.conditionalActions && Object.keys(f.conditionalActions).length > 0
    );
    setHasConditionalActions(has);
    logger.log("Form step", config.id, "hasConditionalActions:", has);
    if (typeof onStepHasConditionalActions === "function") {
      try {
      } catch (e) {
        // ignore callback errors
        logger.error("onStepHasConditionalActions callback error:", e);
      }
    }
  }, [visibleFields, onStepHasConditionalActions]);

  const allFilled = visibleFields.every((field) => {
    const value = fieldsState[field.id];
    if (field.type === "date") {
      return value && isValidAge(value);
    }
    if (field.type === "email") {
      return value && isValidEmail(value);
    }
    if (field.type === "checkbox") {
      if (Array.isArray(field.options)) {
        return Array.isArray(value) && value.length > 0;
      }
      return !!value;
    }
    if (typeof value === "string") {
      return value.trim();
    }
    return !!value;
  });

  // Interpolate [LASTNAME] in the title if present
  let formTitle = config.title;
  if (formTitle && formTitle.includes("[LASTNAME]")) {
    const lastName = userData?.lastName || fieldsState.lastName || "";
    formTitle = formTitle.replace("[LASTNAME]", lastName);
  }

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}

      {/* Simple login modal shown when registration indicates email exists */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">
              Account found — sign in
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We found an account with this email. Please enter your password to
              continue.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={fieldsState.email ?? ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={fieldsState.password ?? ""}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full border px-3 py-2 rounded pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#B8875A] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex-1 bg-black text-white py-2 rounded"
                  onClick={async () => {
                    // attempt login
                    try {
                      setLoading(true);
                      const res = await fetch("/api/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          username: fieldsState.email || "",
                          password: fieldsState.password || "",
                        }),
                      });
                      if (res.ok) {
                        toast.success("Logged in successfully");
                        setShowAuthModal(false);
                        // proceed with parent's continue callback if provided
                        if (typeof onContinue === "function") {
                          onContinue();
                        }
                      } else {
                        let data = null;
                        try {
                          data = await res.json();
                        } catch (e) {}
                        const msg =
                          (data && (data.message || data.error)) ||
                          "Login failed";

                        const userFriendlyMessage = transformErrMsg(data);
                        toast.error(userFriendlyMessage);
                      }
                    } catch (e) {
                      console.error(e);
                      toast.error("Login failed. Please try again.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Sign in
                </button>

                <button
                  className="flex-1 border py-2 rounded"
                  onClick={() => setShowAuthModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form
        className="flex flex-col gap-1 w-full min-h-screen pb-28"
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
      >
        <div className="flex flex-col">
          {visibleFields.map((field) => {
            const isSingleConsent =
              field.type === "checkbox" && !Array.isArray(field.options);
            return (
              <div key={field.id} className="mb-4 flex-grow">
                {!isSingleConsent && (
                  <>
                    {field.label && (
                      <label className="block text-[16px] font-medium mb-2">
                        {field.label}
                      </label>
                    )}
                  </>
                )}

                {isSingleConsent ? (
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      aria-pressed={!!fieldsState[field.id]}
                      onClick={() => handleCheckboxToggle(field)}
                      className="flex items-center justify-center p-0"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all border-2 ${
                          fieldsState[field.id]
                            ? "bg-[#B8875A] border-[#B8875A] p-[2px]"
                            : "bg-white border-gray-500"
                        }`}
                      >
                        {fieldsState[field.id] && (
                          <svg
                            width="18"
                            height="14"
                            viewBox="0 0 18 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1 7L6 12L17 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                    <div className="text-[12px] md:text-[14px] text-black leading-6">
                      {field.id == "privacy_accept" ? (
                        <>
                          <span className=" font-medium leading-[140%]">
                            By clicking “Continue” I agree to the{" "}
                            <Link
                              href="/terms-of-use"
                              className="text-[#00000080] font-bold underline"
                            >
                              Terms and Conditions
                            </Link>{" "}
                            and{" "}
                            <Link
                              href="/telehealth-consent"
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
                        </>
                      ) : (
                        field.label
                      )}
                    </div>
                  </div>
                ) : field.type === "select" && Array.isArray(field.options) ? (
                  <select
                    className="w-full h-[60px] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[16px] focus:outline-none focus:border-black"
                    value={fieldsState[field.id] ?? ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    onBlur={() => handleBlurMark(field.id)}
                  >
                    <option value="" disabled>
                      {field.placeholder || `Select ${field.label}`}
                    </option>
                    {field.options.map((opt) => (
                      <option
                        key={opt.value ?? opt.id}
                        value={opt.value ?? opt.id}
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "date" ? (
                  <DOBInput
                    value={fieldsState[field.id]}
                    onChange={(value) => handleChange(field.id, value)}
                    className="w-full h-[60px] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[16px] focus:outline-none focus:border-black"
                    placeholder={field.placeholder || "MM/DD/YYYY"}
                    minAge={18}
                    required
                  />
                ) : field.type === "radio" && Array.isArray(field.options) ? (
                  <div className="flex  ">
                    {field.options.map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        className={`flex-1 py-3  border text-[16px] font-medium ${
                          fieldsState[field.id] === opt.value
                            ? "border-black bg-white"
                            : "border-[#E5E5E5] bg-white"
                        }`}
                        onClick={() => handleChange(field.id, opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <input
                      type={field.type}
                      className={`w-full h-[60px] border rounded-lg px-4 py-3 text-[16px] focus:outline-none transition-colors ${
                        field.type === "email" &&
                        fieldsState[field.id] &&
                        completedFields[field.id] &&
                        !isValidEmail(fieldsState[field.id])
                          ? "border-red-500 focus:border-red-500"
                          : "border-[#E5E5E5] focus:border-black"
                      }`}
                      placeholder={field.placeholder}
                      value={fieldsState[field.id] ?? ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      onBlur={() => handleBlurMark(field.id)}
                    />
                    {field.type === "email" &&
                      fieldsState[field.id] &&
                      completedFields[field.id] &&
                      !isValidEmail(fieldsState[field.id]) && (
                        <p className="text-red-500 text-sm mt-1">
                          Please enter a valid email address
                        </p>
                      )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {config.showSignIn && (
          <>
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-[#E5E5E5]" />
              <div className="px-4 text-[14px] text-[#888] font-medium">OR</div>
              <div className="flex-1 h-px bg-[#E5E5E5]" />
            </div>
            <SignInLink
              className={`${config.privacyNote ? "mt-1 mb-4" : "mt-1 mb-20"}`}
            />
          </>
        )}

        {config.privacyNote && (
          <div
            className={`${
              config.privacyNoteStyle
                ? config.privacyNoteStyle
                : "text-[13px] text-[#888] mt-2 mb-4  flex items-center gap-2 justify-center"
            }`}
          >
            <img
              src="https://myrocky.b-cdn.net/WP%20Images/convert_test/lock.svg"
              alt="privacy"
              className="w-4 h-4"
            />
            {config.privacyNote}
          </div>
        )}

        {/* <div className="fixed left-0 right-0 bottom-0 z-50 py-4 px-4 bg-white/80 backdrop-blur-sm md:px-0">
          <div className="max-w-[720px] mx-auto flex justify-center items-center">
            <button
              type="submit"
              className={`w-full h-[52px] max-w-md py-4 rounded-full text-[18px] font-semibold transition ${
                allFilled
                  ? "bg-black text-white hover:bg-gray-900"
                  : "bg-[#E5E5E5] text-[#888] cursor-not-allowed"
              }`}
              disabled={!allFilled}
            >
              Next
            </button>
          </div>
        </div> */}

        <StickyButton
          text="Continue"
          disabled={!allFilled}
          onClick={handleContinue}
        />

        <PasswordModal
          open={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordSubmit}
        />
      </form>
    </>
  );
};

export default Form;
