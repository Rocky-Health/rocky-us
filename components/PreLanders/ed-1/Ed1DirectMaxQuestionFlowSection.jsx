"use client";

import { useRef, useState } from "react";
import Ed1QuestionCard from "@/components/PreLanders/ed-1/Ed1QuestionCard";

const FOLLOWUP_QUESTIONS = [
  {
    id: "q2",
    title: "Have you tried other ED meds before?",
    options: ["Yes", "No"],
    desktopHeightClass: "lg:h-[615px]",
  },
  {
    id: "q3",
    title: "What are you most excited about DirectMax?",
    options: [
      "Works when other meds fail",
      "Targets brain and body",
      "Fewer side effects than the rest",
      "Made in the USA",
    ],
    desktopHeightClass: "lg:h-[760px]",
  },
  {
    id: "q4",
    title: "What's most important to you with treatment?",
    options: [
      "Being ready for sex in 15 minutes",
      "Stronger than Viagra, Cialis or other",
      "Longer-lasting endurance",
      "Pleasing my partner",
      "An always-on daily solution",
    ],
    desktopHeightClass: "lg:h-[832px]",
  },
];

export default function Ed1DirectMaxQuestionFlowSection() {
  const [answers, setAnswers] = useState({});
  const cardRefs = useRef([]);

  const handleSelect = (stepIndex, option) => {
    setAnswers((prev) => ({ ...prev, [stepIndex]: option }));
    const nextIndex = stepIndex + 1;
    if (nextIndex < FOLLOWUP_QUESTIONS.length) {
      window.setTimeout(() => {
        const el = cardRefs.current[nextIndex];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 180);
    }
  };

  return (
    <section id="ed1-followup-questions" className="bg-[#F5F4EF]">
      <div className="mx-auto max-w-[1440px] space-y-6 px-8 py-24 md:space-y-8 lg:px-10">
        {FOLLOWUP_QUESTIONS.map((question, i) => {
          const step = i + 1;
          return (
            <div
              key={question.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="mx-auto w-full max-w-[976px]"
            >
              <Ed1QuestionCard
                step={step}
                question={question}
                selected={answers[i]}
                onSelect={(option) => handleSelect(i, option)}
                variant="flow"
                flowDesktopHeightClass={question.desktopHeightClass}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
