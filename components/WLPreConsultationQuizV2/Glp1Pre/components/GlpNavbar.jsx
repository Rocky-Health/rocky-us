import Logo from "../../../Navbar/Logo";
import Image from "next/image";

export default function GlpNavbar({ currentPage, onBack }) {
  const showBack = currentPage > 1;

  // Cumulative gold state per step
  const startActive = true; // always gold once in the quiz
  const detailsActive = currentPage >= 4;
  const eligibilityActive = currentPage >= 12;

  // Mobile: only the furthest-reached label is visible
  const activeLabel = eligibilityActive
    ? "eligibility"
    : detailsActive
      ? "details"
      : "start";

  return (
    <>
      <div className="fixed top-0 left-0 z-40 right-0 h-10 flex items-center justify-center bg-[#F7F4F0]">
        <Logo />
        <div className="ml-4 flex items-center gap-2">
          {/* Excellent text */}
          <span className="text-black font-semibold text-sm md:text-[14px] whitespace-nowrap">
            Excellent 4.8
          </span>

          {/* Stars image */}
          <div className="w-[96px] h-[18px] md:w-[106px] md:h-[20px] flex-shrink-0">
            <Image
              src="/trustpilot/stars.png"
              alt="Trustpilot stars"
              className="w-full h-full object-contain"
              width={106}
              height={20}
              priority
            />
          </div>
        </div>
      </div>
      <div className="mt-10 flex items-center w-full z-[11] lg:sticky lg:top-10 justify-between mb-5 md:mb-10 lg:mb-12 border-b pb-2 bg-[#F7F4F0] border-gray-900/10">
        <div className="flex justify-start ml-3 w-[65px] z-10 h-42px mt-[6px] mt-2">
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
        </div>
        <nav
          aria-label="Progress"
          className="glp-header flex justify-center w-full items-center group relative -mb-2 sm:-mb-3"
        >
          <ol role="list" className="flex items-center !mb-0 relative">
            {/* Start */}
            <li className="flex items-center">
              <div className="group flex items-center">
                <div className="progress-circle relative z-5 flex items-center justify-center rounded-full border-2 h-8 w-8 border-[#AE7E56]">
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-[#AE7E56]"
                    aria-hidden="true"
                  />
                </div>
                <span
                  className={`ml-3 step-name text-base font-normal max-w-[80px] ${activeLabel === "start" ? "block" : "hidden sm:block"}`}
                >
                  Start
                </span>
              </div>
            </li>
            {/* Start → Details connector */}
            <div
              className={`flex-initial border-t-2 w-14 ml-3 mr-3 ${detailsActive ? "border-[#AE7E56]" : "border-gray-900/30"}`}
            ></div>
            {/* Details */}
            <li className="flex items-center">
              <div className="group flex items-center">
                <div
                  className={`progress-circle relative z-5 flex items-center justify-center rounded-full border-2 h-8 w-8 ${detailsActive ? "border-[#AE7E56]" : "border-gray-900/30"}`}
                >
                  {detailsActive && (
                    <span
                      className="h-2.5 w-2.5 rounded-full bg-[#AE7E56]"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span
                  className={`ml-3 step-name text-base font-normal max-w-[80px] ${activeLabel === "details" ? "block" : "hidden sm:block"}`}
                >
                  Details
                </span>
              </div>
            </li>
            {/* Details → Eligibility connector */}
            <div
              className={`flex-initial border-t-2 w-14 ml-3 mr-3 ${eligibilityActive ? "border-[#AE7E56]" : "border-gray-900/30"}`}
            ></div>
            {/* Eligibility */}
            <li className="flex items-center">
              <div className="group flex items-center">
                <div
                  className={`progress-circle relative z-5 flex items-center justify-center rounded-full border-2 h-8 w-8 ${eligibilityActive ? "border-[#AE7E56]" : "border-gray-900/30"}`}
                >
                  {eligibilityActive && (
                    <span
                      className="h-2.5 w-2.5 rounded-full bg-[#AE7E56]"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <span
                  className={`ml-3 step-name text-base font-normal max-w-[110px] ${activeLabel === "eligibility" ? "block" : "hidden sm:block"}`}
                >
                  Eligibility
                </span>
              </div>
            </li>
          </ol>
        </nav>
        <div className="flex h-14 items-center w-[70px] mr-4 justify-end pt-1"></div>
      </div>
    </>
  );
}
