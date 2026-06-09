"use client";

import { useEffect, useState } from "react";
import { VERTICAL_DISPLAY_NAMES } from "@/lib/questionnaire/questionnaireSequence";

/**
 * QuestionnaireIntermission
 *
 * Shown between two consecutive questionnaires in a multi-questionnaire order.
 * Auto-advances after 4 seconds — no user-dismissal mechanism.
 *
 * Props:
 *  completedVertical  {string}   slug of the questionnaire just finished, e.g. "wl"
 *  nextVertical       {string}   slug of the upcoming questionnaire, e.g. "ed"
 *  sequenceN          {number}   1-based index of the questionnaire just finished
 *  sequenceTotal      {number}   total number of questionnaires in this order
 *  onComplete         {Function} called when the 4-second timer expires
 */
const QuestionnaireIntermission = ({
  completedVertical,
  nextVertical,
  sequenceN,
  sequenceTotal,
  onComplete,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(4);

  const completedName =
    VERTICAL_DISPLAY_NAMES[completedVertical] || completedVertical;
  const nextName = VERTICAL_DISPLAY_NAMES[nextVertical] || nextVertical;

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const tick = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(tick);
  }, [secondsLeft]);

  return (
    <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 mt-6 pb-24">
      <div className="flex flex-col items-center text-center py-12">
        {/* Progress line */}
        <p className="text-[13px] font-[500] text-gray-500 mb-6 poppins-font uppercase tracking-wide">
          Questionnaire {sequenceN} of {sequenceTotal}
        </p>

        {/* Checkmark circle — styled like LongevityThankYouStep */}
        <div className="w-16 h-16 bg-[#FFFBF7] border-2 border-[#A7885A] rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-[#A7885A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="headers-font text-[26px] md:text-[32px] leading-[115%] mb-4">
          {completedName} questionnaire complete
        </h2>

        {/* Body */}
        <p className="text-[16px] text-gray-600 mb-8 leading-[140%] max-w-sm">
          Now let&#39;s start your {nextName} questionnaire.
        </p>

        {/* Countdown indicator — purely informational, no button */}
        <p className="text-[14px] text-gray-400 poppins-font">
          Starting in {secondsLeft}…
        </p>
      </div>
    </div>
  );
};

export default QuestionnaireIntermission;
