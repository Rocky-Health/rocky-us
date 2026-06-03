import NadPlusFaqAccordion from "./NadPlusFaqAccordion";

/**
 * Bespoke FAQ UI for NAD+ (card rows, initials avatars, +/− toggle, mortar icon in answers).
 * We intentionally do not use shared `FaqsSection` + `WlFaqs` here so this page matches design spec.
 * Copy lives in `nadPlusFaqData.js`; presentation in `NadPlusFaqAccordion.jsx`.
 */
export default function NadPlusFaqsSection() {
    return (
        <div className="w-full">
            <header className="mx-auto  max-w-3xl text-center">
                <h2 className="subheaders-font text-6xl text-center font-normal tracking-tight   text-gray-900">
                    We&apos;ve got you.
                </h2>
                <p className="text-lg text-center text-gray-600 py-4">
                    You have questions, we have answers.
                </p>
            </header>
            <NadPlusFaqAccordion />
        </div>
    );
}
