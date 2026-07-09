"use client";

import { useState } from "react";

export default function NadPlusFaqItem({
    question,
    answer,
    defaultOpen = false,
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-black/10 last:border-b-0">
            <button
                type="button"
                className="w-full flex justify-between items-start gap-6 py-5 md:py-6 text-left"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
            >
                <span className="helvetica-text-font font-medium text-[16px] md:text-[18px] leading-[1.4] tracking-[-0.32px] text-black">
                    {question}
                </span>
                <span
                    className="shrink-0 w-6 h-6 flex items-center justify-center text-black text-xl leading-none mt-0.5"
                    aria-hidden
                >
                    {isOpen ? "×" : "+"}
                </span>
            </button>
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen
                        ? "max-h-[500px] opacity-100 pb-5 md:pb-6"
                        : "max-h-0 opacity-0"
                }`}
            >
                <p className="helvetica-text-font text-[14px] md:text-[16px] leading-[1.4] tracking-[-0.28px] md:tracking-[-0.32px] text-[#000000BF] pr-8">
                    {answer}
                </p>
            </div>
        </div>
    );
}
