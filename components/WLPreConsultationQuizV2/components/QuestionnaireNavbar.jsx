import Logo from "@/components/Navbar/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";


const QuestionnaireNavbar = ({ onBackClick, currentPage }) => {
  const router = useRouter();
  const isThankYouPage = currentPage === 22;
  const showBackButton = currentPage > 1 && !isThankYouPage;

  return (
    <header
      className={`questionnaire-header w-full py-2 relative  ${
        isThankYouPage ? "bg-transparent z-10" : ""
      }`}
      suppressHydrationWarning={true}
    >
      <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 relative h-[40px] flex items-center">
        {showBackButton && (
          <button
            onClick={onBackClick}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-900"
            aria-label="Go back to previous question"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}

        <div className="mx-auto scale-125 flex justify-center items-center min-w-[120px] ">
          {isThankYouPage ? (
            <button
              onClick={() => router.push("/")}
              className="cursor-pointer mr-[18px] md:mr-0"
              aria-label="Go to home"
            >
              <Logo withLink={false} />
            </button>
          ) : (
            <button
              onClick={() => router.push("/")}
              className="cursor-pointer md:mr-0"
              aria-label="Go to home"
            >
              <Logo withLink={false} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default QuestionnaireNavbar;