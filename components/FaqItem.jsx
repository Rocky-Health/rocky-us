"use client";
import { useState } from "react";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const FaqItem = ({
  question,
  answer,
  isFirstCardOpen,
  index,
  isHighlighted,
}) => {
  const [isOpen, setIsOpen] = useState(
    (index === 0 && isFirstCardOpen) || isHighlighted || false
  );

  return (
    <div className={`border-b border-gray-300 last:border-none`}>
      <button
        className="w-full flex justify-between items-center py-4 text-left text-[16px] lg:text-lg font-[500] hover:text-gray-700 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(question) }} />
        <span
          className={`text-2xl transform transition-transform duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "pb-5 opacity-100 max-h-[1000px]" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className="text-gray-700 text-start"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(answer) }}
        />
      </div>
    </div>
  );
};

export default FaqItem;
