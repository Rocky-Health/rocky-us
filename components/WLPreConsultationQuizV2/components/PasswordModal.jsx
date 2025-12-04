import React, { useState } from "react";

const PasswordModal = ({ open, onClose, onSubmit }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;


  const handleSubmit = () => {
    const isValid = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password);
    if (isValid) {
      onSubmit(password);
      setPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-30">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 shadow-lg">
        <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-center mb-6">Create Password</h2>
        <div>
          <label className="block mb-2 font-medium text-lg">Password</label>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 border rounded-lg text-lg"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
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
          {/* Validation hints */}
          <div className="mb-4 text-sm">
            <p className={`text-[13px] ${password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
              • At least 8 characters
            </p>
            <p className={`text-[13px] ${/(?=.*[a-z])/.test(password) && /(?=.*[A-Z])/.test(password) ? 'text-green-600' : 'text-gray-500'}`}>
              • Contains uppercase and lowercase letters
            </p>
          </div>

          <button
            className={`w-full py-3 rounded-full font-medium text-lg transition-colors ${/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password) ? "bg-black text-white hover:bg-gray-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
            disabled={!/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password)}
            onClick={handleSubmit}
          >
            Continue
          </button>
        </div>
      
      </div>
    </div>
  );
};

export default PasswordModal;
