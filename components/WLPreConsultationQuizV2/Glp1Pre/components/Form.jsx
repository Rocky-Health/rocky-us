"use client";
import React, { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import { toast } from "react-toastify";

import Loader from "@/components/Loader";
import Link from "next/link";

import DOBInput from "@/components/shared/DOBInput";
import PhoneInput, { isValidPhone } from "@/components/PhoneInput";
import {
  isWordPressCriticalError,
  transformPaymentError,
} from "@/utils/paymentErrorHandler";
import {
  clearStoredPasswordSecurely,
  restorePasswordSecurely,
  storePasswordSecurely,
} from "@/utils/quizPasswordVault";
import { encryptPasswordWithServerKey } from "@/utils/encryptPasswordWithServerKey";
import RadioOption from "./RadioOption";

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
    // Use functional updates to avoid overwriting fields the user is actively editing.
    // When userData changes (e.g. the sex radio calls setUserData so navigation logic
    // sees the latest value), we must NOT wipe other fields (dateOfBirth, post_code)
    // that are only tracked in local fieldsState and not yet in userData.
    setFieldsState((prev) => {
      const updatedState = {};
      config.fields.forEach((field) => {
        const uVal = userData?.[field.id];
        if (field.type === "checkbox") {
          if (Array.isArray(field.options)) {
            // Sync from userData when it has a value; otherwise keep what the user typed
            updatedState[field.id] =
              uVal !== undefined && uVal !== null ? uVal : prev[field.id] || [];
          } else {
            updatedState[field.id] =
              uVal !== undefined && uVal !== null
                ? uVal
                : (prev[field.id] ?? false);
          }
        } else {
          // Only overwrite with the userData value when it is actually set (non-empty).
          // This prevents clearing fields like dateOfBirth / post_code when an
          // unrelated field (sex) triggers a userData update.
          updatedState[field.id] =
            uVal !== undefined && uVal !== null && uVal !== ""
              ? uVal
              : prev[field.id] || "";
        }
      });
      return updatedState;
    });
    // Update completedFields only for fields that have values in userData
    setCompletedFields((prev) => {
      const updatedCompleted = { ...prev };
      config.fields.forEach((f) => {
        const uVal = userData?.[f.id];
        if (uVal !== undefined && uVal !== null) {
          if (Array.isArray(uVal)) updatedCompleted[f.id] = uVal.length > 0;
          else if (typeof uVal === "string")
            updatedCompleted[f.id] = uVal.trim().length > 0;
          else updatedCompleted[f.id] = !!uVal;
        }
        // If userData has no value for this field, leave completedFields as-is
      });
      return updatedCompleted;
    });
  }, [userData, config]);

  // Clear debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach((t) => clearTimeout(t));
      debounceTimersRef.current = {};
    };
  }, []);

  // Detect autofilled inputs and sync with state
  useEffect(() => {
    const checkAutofill = () => {
      const inputs = document.querySelectorAll("input, select, textarea");
      const updates = {};
      let hasUpdates = false;

      inputs.forEach((input) => {
        const name = input.name || input.id;
        if (!name) return;

        // Check if field exists in config
        const field = config.fields.find((f) => f.id === name);
        if (!field) return;

        // Get current value from DOM
        const domValue = input.value;
        const stateValue = fieldsState[name];

        // If DOM has value but state doesn't, update state
        if (domValue && !stateValue) {
          updates[name] = domValue;
          hasUpdates = true;
        }
      });

      if (hasUpdates) {
        setFieldsState((prev) => ({ ...prev, ...updates }));
        // Mark updated fields as completed
        setCompletedFields((prev) => {
          const newCompleted = { ...prev };
          Object.keys(updates).forEach((key) => {
            newCompleted[key] = true;
          });
          return newCompleted;
        });
      }
    };

    // Check immediately after mount
    const timer = setTimeout(checkAutofill, 100);

    // Listen for autofill animation (webkit browsers)
    const handleAnimationStart = (e) => {
      if (e.animationName === "onAutoFillStart") {
        checkAutofill();
      }
    };

    document.addEventListener("animationstart", handleAnimationStart, true);

    return () => {
      clearTimeout(timer);
      document.removeEventListener(
        "animationstart",
        handleAnimationStart,
        true,
      );
    };
  }, [config.fields, fieldsState]);

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
        setCompletedFields((cprev) => ({
          ...cprev,
          [field.id]: set.size > 0,
        }));
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
          e,
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
      actionCfg,
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
          value,
        )}`,
        actionCfg,
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

    // Always sync to userData so the combined-page continue button can read the latest values
    setUserData((prev) => ({ ...prev, [id]: value }));

    const field = config.fields.find((f) => f.id === id);
    const textLike =
      field &&
      ["text", "email", "tel", "number", "textarea"].includes(field.type);

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
          parseInt(parts[0]),
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
    // Restore password from encrypted storage after refresh when needed.
    let resolvedPassword = mergedUserData.password;
    if (!resolvedPassword) {
      resolvedPassword = await restorePasswordSecurely();
    }
    const registrationData = {
      ...mergedUserData,
      password: resolvedPassword,
    };

    // Step 1 validation (name, email, password)
    if (!registrationData.firstName || !registrationData.lastName) {
      toast.error("Please enter your full name");
      setLoading(false);
      return false;
    }
    if (!registrationData.email) {
      toast.error("Email address is required");
      setLoading(false);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(registrationData.email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return false;
    }
    if (!registrationData.password) {
      toast.error("Password is required");
      setLoading(false);
      return false;
    }
    if (registrationData.password.length < requiredPasswordLength) {
      toast.error(
        `Password must be at least ${requiredPasswordLength} characters`,
      );
      setLoading(false);
      return false;
    }

    // Step 2 validation (phone, dob, province)
    if (!registrationData.phone) {
      toast.error("Phone number is required");
      setLoading(false);
      return false;
    }
    // Check if phone number contains only zeros
    const digitsOnly = registrationData.phone.replace(/\D/g, "");
    if (digitsOnly.length > 0 && /^0+$/.test(digitsOnly)) {
      toast.error("Please enter a valid phone number");
      setLoading(false);
      return false;
    }
    if (!registrationData.dateOfBirth) {
      toast.error("Date of birth is required");
      setLoading(false);
      return false;
    }
    if (!registrationData.province) {
      toast.error("Province is required");
      setLoading(false);
      return false;
    }

    // Format date_of_birth to YYYY-MM-DD if needed
    let formattedDOB = registrationData.dateOfBirth;
    if (formattedDOB && formattedDOB.includes("/")) {
      const parts = formattedDOB.split("/");
      if (parts.length === 3) {
        formattedDOB = `${parts[2]}-${parts[1].padStart(
          2,
          "0",
        )}-${parts[0].padStart(2, "0")}`;
      }
    }

    // Call register API (step 1)
    try {
      let isEncryptedPassword = false;
      const encryptResult = await encryptPasswordWithServerKey(
        registrationData.password,
      );
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

      const res1 = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: mergedUserData.firstName,
          last_name: mergedUserData.lastName,
          email: registrationData.email,
          password: isEncryptedPassword
            ? encryptedPassword
            : registrationData.password,
          register_step: 1,
          isEncryptedPassword,
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
          email: registrationData.email,
          password: isEncryptedPassword
            ? encryptedPassword
            : registrationData.password,
          phone: registrationData.phone,
          date_of_birth: formattedDOB,
          province: registrationData.province,
          gender: mergedUserData.sex,
          register_step: 2,
          isEncryptedPassword,
        }),
      });
      const data2 = await res2.json();
      if (!res2.ok || !data2.success) {
        toast.error(data2.error || "Step 2 registration failed");
        setLoading(false);
        return false;
      }
      //toast.success(data2.message || "Registration successful!");
      clearStoredPasswordSecurely();
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
      let resolvedPassword = userData["password"] || "";
      if (
        (typeof resolvedPassword !== "string" ||
          resolvedPassword.trim().length === 0) &&
        typeof window !== "undefined"
      ) {
        resolvedPassword = await restorePasswordSecurely();
        if (resolvedPassword) {
          setUserData((prev) => ({
            ...prev,
            password: resolvedPassword,
          }));
        }
      }

      if (
        typeof resolvedPassword === "string" &&
        resolvedPassword.trim().length > 0
      ) {
        // Merge latest form fields and password into userData
        const mergedUserData = {
          ...userData,
          ...fieldsState,
          password: resolvedPassword,
        };
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
          "Password is required. Please go back and enter your password.",
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
    await storePasswordSecurely(password);
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
      // require the controlling field to be completed.
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
        f.conditionalActions && Object.keys(f.conditionalActions).length > 0,
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
    if (field.type === "tel") {
      return value && isValidPhone(value);
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

      <form
        className="flex flex-col gap-1 w-full pb-20"
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
                        </>
                      ) : (
                        field.label
                      )}
                    </div>
                  </div>
                ) : field.type === "select" && Array.isArray(field.options) ? (
                  <select
                    name={field.id}
                    id={field.id}
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
                ) : (field.type === "radio" || field.type === "radio-text") &&
                  Array.isArray(field.options) ? (
                  <div
                    className={
                      field.options.length <= 2
                        ? "grid grid-cols-2 gap-2"
                        : "flex flex-col gap-2"
                    }
                  >
                    {field.options.map((opt) => {
                      const optVal = opt.id ?? opt.value;
                      return (
                        <RadioOption
                          key={optVal}
                          name={field.id}
                          value={optVal}
                          label={opt.label}
                          selected={fieldsState[field.id] === optVal}
                          onClick={() => handleChange(field.id, optVal)}
                        />
                      );
                    })}
                  </div>
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.id}
                    id={field.id}
                    className="w-full min-h-[100px] border border-[#E5E5E5] rounded-lg px-4 py-3 text-[16px] focus:outline-none focus:border-black resize-none"
                    placeholder={field.placeholder}
                    value={fieldsState[field.id] ?? ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    onBlur={() => handleBlurMark(field.id)}
                  />
                ) : field.type === "tel" ? (
                  <PhoneInput
                    id={field.id}
                    name={field.id}
                    value={fieldsState[field.id] ?? ""}
                    onChange={(formatted) => handleChange(field.id, formatted)}
                    onBlur={() => handleBlurMark(field.id)}
                    placeholder={field.placeholder}
                    showError={
                      !!(fieldsState[field.id] && completedFields[field.id])
                    }
                    inputClassName={`w-full h-[60px] border rounded-lg px-4 py-3 text-[16px] focus:outline-none transition-colors ${
                      fieldsState[field.id] &&
                      completedFields[field.id] &&
                      !isValidPhone(fieldsState[field.id])
                        ? "border-red-500 focus:border-red-500"
                        : "border-[#E5E5E5] focus:border-black"
                    }`}
                  />
                ) : (
                  <>
                    <input
                      name={field.id}
                      id={field.id}
                      type={field.type}
                      autoComplete={
                        field.type === "email"
                          ? "email"
                          : field.id === "firstName"
                            ? "given-name"
                            : field.id === "lastName"
                              ? "family-name"
                              : field.id === "password"
                                ? "new-password"
                                : "on"
                      }
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

        {onContinue && (
          <div className="w-full pt-4">
            <button
              type="submit"
              disabled={!allFilled}
              className={`w-full py-3 rounded-full h-[52px] font-medium border-none focus:outline-none focus:ring-0 transition-colors ${
                allFilled
                  ? "bg-black text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>
        )}
      </form>
    </>
  );
};

export default Form;
