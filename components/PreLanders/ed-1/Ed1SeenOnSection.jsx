import Image from "next/image";

const DEFAULT_MOBILE_SRC = "/ed-1/seen-on-mobile.webp";
const DEFAULT_DESKTOP_SRC = "/ed-1/seen-on-desktop.webp";

/**
 * `/ed-1` only — "Seen on" strip (layout matches Direct Max reference).
 */
export default function Ed1SeenOnSection({
  mobileSeenOnSrc = DEFAULT_MOBILE_SRC,
  desktopSeenOnSrc = DEFAULT_DESKTOP_SRC,
  seenOnImageAlt = "As seen on",
  tabsImageSrc = "/ed-1/direct-max-tabs-2.png",
  tabsImageAlt = "Direct Max Tabs",
}) {
  return (
    <section className="relative overflow-visible border-t-[12px] border-[#AE7E56] bg-white px-8 pb-16 pt-8 text-center md:pb-24 md:pt-10 lg:pb-24 lg:pt-24">
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-20 hidden w-screen max-w-[1440px] -translate-x-1/2 lg:block"
        aria-hidden
      >
        <div className="flex justify-start px-5 lg:px-10">
          <Image
            src={tabsImageSrc}
            alt={tabsImageAlt}
            width={620}
            height={456}
            priority
            className="relative z-10 h-auto w-full max-w-[620px] -translate-y-1/2 object-contain object-left drop-shadow-2xl"
          />
        </div>
      </div>

      <p className="poppins-font mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        we&apos;ve been featured all over
      </p>
      <div className="flex items-center justify-center">
        <Image
          src={mobileSeenOnSrc}
          alt={seenOnImageAlt}
          width={640}
          height={160}
          className="block h-auto w-full max-w-sm object-contain opacity-90 md:hidden"
          sizes="(max-width: 767px) 100vw, 0px"
          loading="lazy"
        />
        <Image
          src={desktopSeenOnSrc}
          alt={seenOnImageAlt}
          width={1014}
          height={82}
          className="hidden h-auto w-full max-w-4xl object-contain opacity-90 md:block"
          sizes="(min-width: 768px) 90vw, 0px"
          loading="lazy"
        />
      </div>
    </section>
  );
}
