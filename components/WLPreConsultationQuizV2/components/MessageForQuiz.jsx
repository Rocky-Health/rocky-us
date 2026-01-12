import React from "react";

const MessageForQuiz = ({ message = "Promo applied: Free online assessment", messageStyle = "" }) => {
  return (
    <div className={`inline-flex items-center gap-[2px] mb-[27px] bg-[#00A267] text-white px-[4px] py-[3px] rounded-lg ${messageStyle}`} role="status">
      <span className="flex items-center justify-center w-5 h-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-[12px] leading-[140%] font-medium">{message}</span>
    </div>
  );
};

export default MessageForQuiz;