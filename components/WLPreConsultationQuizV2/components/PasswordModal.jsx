import React, { useState, useEffect } from "react";
import { usePassword } from "../contexts/PasswordContext";

const PasswordModal = ({ open, onClose, onSubmit,email  }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setPassword: setContextPassword } = usePassword();
  const [emailExists, setEmailExists] = useState(false);
  
  useEffect(() => {
    if (!open || !email) return;
    const checkEmail = async () => {
      try {
        const res = await fetch("/api/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          const data = await res.json();
          setEmailExists(data.registered === true);
        }
      } catch (e) {
        // default to new user if check fails
        setEmailExists(false);
      }
    };
    checkEmail();
  }, [open, email]);

  if (!open) return null;

  const isExistingUser = emailExists === true;
  const autoCompleteValue = isExistingUser
    ? "current-password"
    : "new-password";
  const headingText = isExistingUser
    ? "Enter Your Password"
    : "Create Password";
  const placeholderText = isExistingUser
    ? "Your password"
    : "Enter your password";

  // For existing users just require a non-empty password (they set it themselves).
  // For new users enforce the complexity rules.
  const isValid = isExistingUser
    ? password.trim().length > 0
    : /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);

    const handleSubmit = () => { 
      if (isValid) {
        onSubmit(password);
        setPassword("");
      }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-30">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 shadow-lg">
        <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-center mb-6">{headingText}</h2>
        <div>
          <label className="block mb-2 font-medium text-lg">Password</label>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete={autoCompleteValue}
              className="w-full p-3 border rounded-lg text-[16px]"
              placeholder={placeholderText}
              value={password}
              onChange={(e) => setPassword(e.target.value)}            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                // eye-off / hide
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-7a11.05 11.05 0 0 1 2.33-4.01" />
                  <path d="M1 1l22 22" />
                  <path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" />
                </svg>
              ) : (
                // eye / show
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
         {/* Show complexity hints only for new users */}
         {!isExistingUser && (
            <div className="mb-4 text-sm">
              <p className={`text-[13px] ${password.length >= 8 ? "text-green-600" : "text-gray-500"}`}>
                • At least 8 characters
              </p>
              <p className={`text-[13px] ${/(?=.*[a-z])/.test(password) && /(?=.*[A-Z])/.test(password) ? "text-green-600" : "text-gray-500"}`}>
                • Contains uppercase and lowercase letters
              </p>
            </div>
          )}

          <button
           className={`w-full py-3 rounded-full font-medium text-lg transition-colors ${isValid ? "bg-black text-white hover:bg-gray-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
           disabled={!isValid}
            onClick={handleSubmit}
          >
            Continue
          </button>
        </div>
      </div>
      </div>
    );
  };
};

export default PasswordModal;
