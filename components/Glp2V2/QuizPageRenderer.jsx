"use client";

import QuestionRenderer from "./QuestionRenderer";

/**
 * ContentBlock
 *
 * Renders a single declarative content block from page.content[].
 *
 * Supported types: "image" | "video" | "heading" | "paragraph"
 *
 * Each block accepts:
 *   text/src  — the content value
 *   className — optional Tailwind class override (falls back to sensible defaults)
 *   style     — optional inline style object
 *   alt       — alt text for images
 *   controls  — boolean for video (default true)
 */
function ContentBlock({ block }) {
  switch (block.type) {
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.src}
          alt={block.alt ?? ""}
          className={block.className ?? "w-full rounded-xl mb-6 object-cover"}
          style={block.style}
        />
      );

    case "video":
      return (
        <video
          src={block.src}
          controls={block.controls !== false}
          playsInline
          className={block.className ?? "w-full rounded-xl mb-6"}
          style={block.style}
        />
      );

    case "heading":
      return (
        <h1
          className={
            block.className ??
            "text-[26px] font-medium leading-[120%] tracking-[-0.5px] mb-3 text-[#C19A6B] headers-font"
          }
          style={block.style}
        >
          {block.text}
        </h1>
      );

    case "paragraph":
      return (
        <p
          className={block.className ?? "text-gray-600 leading-relaxed mb-4"}
          style={block.style}
        >
          {block.text}
        </p>
      );

    default:
      return null;
  }
}

/**
 * QuizPageRenderer
 *
 * Renders one quiz page. Receives the current page config and the full engine
 * object so it has read access to answers, canAdvance, activePopup, etc.
 *
 * Rendering order:
 *   1. If activePopup.mode === "page" → render the popup content instead of
 *      the page (informational interlude). The regular page is completely hidden.
 *   2. Otherwise → content blocks → questions → CTA button.
 *
 * CTA button:
 *   - Only rendered when page.nextPage is non-null/non-undefined.
 *   - Disabled (opacity-40, cursor-not-allowed) when canAdvance is false.
 *   - Label defaults to "Continue", overridable via page.ctaLabel.
 */
export default function QuizPageRenderer({ page, engine }) {
  const { answers, setAnswer, canAdvance, goNext, activePopup, resolvePopup } =
    engine;

  // ── "page" popup: replaces the entire page content ───────────────────────
  if (activePopup?.mode === "page") {
    return (
      <div className="w-full md:w-[520px] px-5 md:px-0 mx-auto mt-6 pb-10">
        {(activePopup.content ?? []).map((block, i) => (
          <ContentBlock key={i} block={block} />
        ))}
        <button
          type="button"
          onClick={() => resolvePopup(true)}
          className="w-full bg-[#A7885A] hover:bg-[#96774d] text-white font-medium rounded-[12px] py-4 text-[16px] transition-colors mt-4"
        >
          {activePopup.cta ?? "Continue"}
        </button>
      </div>
    );
  }

  // ── Regular page ──────────────────────────────────────────────────────────
  return (
    <div className="w-full md:w-[520px] px-5 md:px-0 mx-auto mt-6 pb-10">
      {/* Content blocks (images, videos, headings, paragraphs) */}
      {(page.content ?? []).map((block, i) => (
        <ContentBlock key={i} block={block} />
      ))}

      {/* Questions */}
      {(page.questions ?? []).map((q) => (
        <QuestionRenderer
          key={q.id}
          question={q}
          answers={answers}
          setAnswer={setAnswer}
        />
      ))}

      {/* CTA — hidden on pages with no nextPage (e.g. final/completion page) */}
      {page.nextPage != null && (
        <button
          type="button"
          onClick={goNext}
          disabled={!canAdvance}
          className={`w-full font-medium rounded-[12px] py-4 text-[16px] transition-all mt-4 ${
            canAdvance
              ? "bg-[#A7885A] hover:bg-[#96774d] text-white cursor-pointer"
              : "bg-[#A7885A] text-white opacity-40 cursor-not-allowed"
          }`}
        >
          {page.ctaLabel ?? "Continue"}
        </button>
      )}
    </div>
  );
}
