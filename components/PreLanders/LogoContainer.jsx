import Link from "next/link";

const LogoContainer = ({ quizHref }) => {
  return (
    <nav className="absolute top-0 left-0 w-full z-10 py-4 md:py-6">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex justify-center md:justify-between items-center">
          <div className="flex-shrink-0">
            <img
              src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
              alt="MyRocky"
              className="w-[90px] md:w-[116px]"
            />
          </div>
          {quizHref && (
            <Link
              href={quizHref}
              className="hidden md:flex items-center justify-center bg-[#00A76F] hover:bg-[#008f5e] text-white font-medium py-2 px-5 rounded-full transition-colors duration-200 text-sm"
            >
              Get Started →
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default LogoContainer;
