import SignInLink from "./SignInLink";

const StickyButton = ({ onClick, disabled, text, showSignIn = false }) => {
  return (
    <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.8)_37.51%,#FFFFFF_63.04%)] backdrop-blur-sm">
      <div className="w-[335px] md:w-[520px] max-w-xl flex flex-col gap-3">
        <button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={`w-full h-[52px] py-3 rounded-full font-medium transition-colors ${
            !disabled
              ? "bg-black text-white hover:bg-gray-800"
              : " bg-[#E3E3E3] text-[#A2A0A1] hover:bg-gray-50"
          }`}
        >
          {"Continue"}
        </button>

        {showSignIn && <SignInLink className="mt-2" />}
      </div>
    </div>
  );
};

export default StickyButton;
