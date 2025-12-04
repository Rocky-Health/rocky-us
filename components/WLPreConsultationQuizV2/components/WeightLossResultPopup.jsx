import React, { useState } from "react";

const WeightLossResultPopup = ({ onAction, disabled, style, setUserData }) => {
  const [email, setEmail] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAction) {
      setUserData((prev) => ({ ...prev, email, agreePrivacy, agreeTerms }));
      onAction("openPopup", "WeightLossResultPasswordPopup");
    }
  };

  const isButtonDisabled = !email || !agreePrivacy || !agreeTerms || disabled;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-end justify-center"
      style={{
        backdropFilter: "blur(8px)",
        background: "rgba(245,244,239,0.1)",
      }}
    >
      <div className="w-full bg-white">
        <div
          className="w-full md:w-[420px] max-w-[440px] rounded-t-[32px] bg-white  px-6 pt-8 pb-10 mx-auto"
          style={style}
        >
          <h2 className="text-center font-semibold text-[24px] leading-[140%] mb-8">
            See how much weight you could lose
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-[14px] font-medium mb-2">
                Email address
              </label>
              <input
                type="email"
                className="w-full border border-[#E5E5E5] rounded-lg px-4 py-4 text-[14px] focus:outline-none focus:border-black"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="privacy"
                checked={agreePrivacy}
                onChange={() => setAgreePrivacy((v) => !v)}
                className="w-5 h-5 accent-black"
              />
              <label htmlFor="privacy" className="text-[12px]">
                I agree to{" "}
                <a
                  href="/privacy-policy"
                  target="_blank"
                  className="text-black underline"
                >
                  privacy policy
                </a>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={() => setAgreeTerms((v) => !v)}
                className="w-5 h-5 accent-black"
              />
              <label htmlFor="terms" className="text-[12px]">
                I agree to{" "}
                <a
                  href="/terms-of-use"
                  target="_blank"
                  className="text-black underline"
                >
                  terms and conditions
                </a>
              </label>
            </div>
            <button
              type="submit"
              className={`w-full mt-2 py-4 rounded-full h-[52px] text-[14px] font-semibold transition bg-black text-white ${
                isButtonDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-900"
              }`}
              disabled={isButtonDisabled}
            >
              View results
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WeightLossResultPopup;
