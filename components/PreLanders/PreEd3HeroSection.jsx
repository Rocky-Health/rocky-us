import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoContainer from "./LogoContainer";

/**
 * Hero Section component specifically for /pre-ed3 A/B testing variations
 * This is a dedicated component to avoid affecting other pages using EdHeroSection
 *
 * Supports two layouts:
 * - "centered": Desktop text centered, mobile text top/image bottom (for Hero1 images)
 * - "left": Desktop text left, mobile text top/image bottom (for Hero2 images)
 */
const PreEd3HeroSection = memo(
  ({
    desktopBgImage,
    mobileBgImage,
    titleLine1,
    titleLine2,
    subTitle,
    btnText,
    quizHref,
    layout = "left",
  }) => {
    // Centered layout (Hero1)
    if (layout === "centered") {
      return (
        <section className="relative flex flex-col overflow-hidden min-h-screen">
          {/* Desktop Background Image */}
          {desktopBgImage && (
            <div className="hidden md:block absolute inset-0 w-full h-full">
              <Image
                src={desktopBgImage}
                alt="ED Treatment"
                fill
                priority
                className="object-cover"
                quality={90}
                sizes="100vw"
                unoptimized={desktopBgImage.startsWith("http")}
              />
            </div>
          )}

          {/* Content - Desktop: Centered */}
          <div className="relative z-10 hidden md:flex flex-col items-center justify-center min-h-screen w-full px-4 md:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center max-w-[555px]">
              <LogoContainer quizHref={quizHref} />
              <div className="flex items-center gap-2 mt-4 md:mt-6 mb-2">
                <span className="text-sm md:text-base text-black">
                  Trusted by 300,000+ users
                </span>
              </div>
              <h1 className="mt-2 md:mt-4 text-[32px] md:text-[54px] leading-[115%] headers-font mb-4 md:mb-6">
                <span className="block text-black">{titleLine1}</span>
                <span className="block text-[#805531]">{titleLine2}</span>
              </h1>
              <p className="text-base md:text-[20px] text-[#000000D9] mb-8 max-w-[420px]">
                {subTitle}
              </p>
              {quizHref && (
                <Link
                  href={quizHref}
                  className="inline-flex items-center justify-center w-[220px] bg-[#013D3D] hover:bg-[#012929]  py-3 px-6 rounded-full transition-colors duration-200"
                >
                  <span className="inline-flex items-center text-[#FFFFFF]">
                    {btnText} {btnText && !btnText.includes("→") && "→"}
                  </span>
                </Link>
              )}
            </div>
          </div>

          {/* Content - Mobile: Top with image below */}
          <div className="block md:hidden relative z-10 flex flex-col w-full px-4 pt-16 pb-0 bg-[#DACFC4]">
            <LogoContainer quizHref={quizHref} />
            <div className="flex items-center gap-2 mt-4 mb-2">
              <span className="text-sm text-black">
                Trusted by 300,000+ users
              </span>
            </div>
            <h1 className="mt-2 text-[32px] md:text-[54px] leading-[115%] headers-font mb-4">
              <span className="block text-black">{titleLine1}</span>
              <span className="block text-[#805531]">{titleLine2}</span>
            </h1>
            <p className="text-base text-[#000000D9] mb-8 max-w-[90%]">
              {subTitle}
            </p>
            {quizHref && (
              <Link
                href={quizHref}
                className="inline-flex items-center justify-center w-full  bg-[#013D3D] hover:bg-[#012929]  py-3 px-6 rounded-full transition-colors duration-200 "
              >
                <span className="inline-flex items-center text-[#FFFFFF]">
                  {btnText} {btnText && !btnText.includes("→") && "→"}
                </span>
              </Link>
            )}
          </div>

          {/* Mobile Image */}
          {mobileBgImage && (
            <div className="block md:hidden w-full">
              <Image
                src={mobileBgImage}
                alt="ED Treatment"
                width={800}
                height={600}
                className="w-full h-auto"
                quality={90}
                priority
                sizes="100vw"
                unoptimized={mobileBgImage.startsWith("http")}
              />
            </div>
          )}
        </section>
      );
    }

    // Left layout (Hero2) - default
    return (
      <section className="relative flex flex-col overflow-hidden min-h-screen">
        {/* Desktop Background Image */}
        {desktopBgImage && (
          <div className="hidden md:block absolute inset-0 w-full h-full">
            <Image
              src={desktopBgImage}
              alt="ED Treatment"
              fill
              priority
              className="object-cover"
              quality={90}
              sizes="100vw"
              unoptimized={desktopBgImage.startsWith("http")}
            />
          </div>
        )}

        {/* Content - Desktop: Left aligned horizontally, centered vertically */}
        <div className="relative z-10 hidden md:flex md:items-center md:min-h-screen w-full max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="w-full md:w-1/2 flex flex-col">
            <LogoContainer quizHref={quizHref} />
            <div className="flex items-center gap-2 mt-4 mb-2 max-w-[555px]">
              <span className="text-sm md:text-base text-black">
                Trusted by 300,000+ users
              </span>
            </div>
            <h1 className="mt-2 text-[32px]  sm:text-[40px] md:text-[54px] leading-[115%] headers-font mb-4">
              <span className="block text-black">{titleLine1}</span>
              <span className="block text-[#805531]">{titleLine2}</span>
            </h1>
            <p className="text-base md:text-lg text-[#000000D9] mb-8 max-w-[380px] ">
              {subTitle}
            </p>
            {quizHref && (
              <Link
                href={quizHref}
                className="inline-flex items-center justify-center w-[220px] bg-[#013D3D] hover:bg-[#012929]  py-3 px-6 rounded-full transition-colors duration-200"
              >
                <span className="inline-flex items-center text-[#FFFFFF]">
                  {btnText} {btnText && !btnText.includes("→") && "→"}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Content - Mobile: Top with image below */}
        <div className="block md:hidden relative z-10 flex flex-col w-full px-4 pt-16 pb-0 bg-[#DECBB8]">
          <LogoContainer quizHref={quizHref} />
          <div className="flex items-center gap-2 mt-4 mb-2">
            <span className="text-sm text-black">
              Trusted by 300,000+ users
            </span>
          </div>
          <h1 className="mt-2 text-[32px] sm:text-[40px] leading-[115%] headers-font mb-4">
            <span className="block text-black">{titleLine1}</span>
            <span className="block text-[#805531]">{titleLine2}</span>
          </h1>
          <p className="text-base text-[#000000D9] mb-8 max-w-[90%]">
            {subTitle}
          </p>
          {quizHref && (
            <Link
              href={quizHref}
              className="inline-flex items-center justify-center w-full bg-[#013D3D] hover:bg-[#012929]  py-3 px-6 rounded-full transition-colors duration-200 "
            >
              <span className="inline-flex items-center text-[#FFFFFF]">
                {btnText} {btnText && !btnText.includes("→") && "→"}
              </span>
            </Link>
          )}
        </div>

        {/* Mobile Image */}
        {mobileBgImage && (
          <div className="block md:hidden w-full">
            <Image
              src={mobileBgImage}
              alt="ED Treatment"
              width={800}
              height={600}
              className="w-full h-auto"
              quality={90}
              priority
              sizes="100vw"
              unoptimized={mobileBgImage.startsWith("http")}
            />
          </div>
        )}
      </section>
    );
  }
);

PreEd3HeroSection.displayName = "PreEd3HeroSection";

export default PreEd3HeroSection;
