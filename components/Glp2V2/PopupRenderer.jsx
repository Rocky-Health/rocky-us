"use client";

import { useEffect } from "react";
import QuestionnaireNavbar from "@/components/EdQuestionnaire/QuestionnaireNavbar";

/**
 * PopupRenderer — warning overlay popup (mode: "warning")
 *
 * This component handles the "warning" popup mode only.
 * The "page" popup mode (informational interlude that replaces page content)
 * is handled directly inside QuizPageRenderer.
 *
 * Popup config shape (popup.mode === "warning"):
 * {
 *   mode: "warning",
 *   title: string,           // headline
 *   body: string,            // body text
 *   canContinue: boolean,    // true → show acknowledge CTA; false → show exit only
 *   ctaLabel: string,        // CTA label when canContinue: true  (default: "I understand, continue")
 *   exitLabel: string,       // exit label when canContinue: false (default: "Go back")
 *   exitAction: string,      // "back" | page-id (used by resolvePopup when proceed=false)
 *   condition: fn,           // (answers) => boolean  — evaluated before the popup opens
 * }
 *
 * resolvePopup(true)  → user acknowledged, engine advances to nextPage
 * resolvePopup(false) → user dismissed, engine executes exitAction
 */
export default function PopupRenderer({ popup, onResolve }) {
  const {
    title,
    body,
    canContinue = true,
    ctaLabel = "I understand, continue",
    exitLabel = "Go back",
  } = popup;

  // Lock body scroll while the overlay is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#F5F4EF] z-[999999] flex flex-col overflow-auto">
      {/* Navbar: back button calls resolvePopup(false) — same as "go back" */}
      <QuestionnaireNavbar
        onBackClick={() => onResolve(false)}
        currentPage={canContinue ? 2 : 1}
      />

      <div className="flex-1 flex flex-col justify-center px-5 py-10 max-w-[520px] mx-auto w-full">
        {title && (
          <h2 className="text-[#C19A6B] text-[24px] font-medium leading-[120%] mb-5 headers-font">
            {title}
          </h2>
        )}

        {body && (
          <p className="text-gray-700 leading-relaxed mb-8 text-[15px]">
            {body}
          </p>
        )}

        {canContinue ? (
          <button
            type="button"
            onClick={() => onResolve(true)}
            className="w-full bg-[#A7885A] hover:bg-[#96774d] text-white font-medium rounded-[12px] py-4 text-[16px] transition-colors"
          >
            {ctaLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onResolve(false)}
            className="w-full border-2 border-[#A7885A] text-[#A7885A] hover:bg-[#A7885A] hover:text-white font-medium rounded-[12px] py-4 text-[16px] transition-colors"
          >
            {exitLabel}
          </button>
        )}
      </div>
    </div>
  );
}
