import Image from "next/image";

const GLOBAL = "https://myrocky.b-cdn.net/WP%20Images/Global%20Images";

/* Matches the exact outlet list already live in
   components/NAD+/NadPlusRockyInTheNews.jsx (the "in the news" component
   already used on the US /nad-plus page), including its Canadian-sourced
   outlets (The Globe and Mail, Canadian Healthcare Technology) — kept for
   consistency with what's already published elsewhere on the US site.
   "The Canadian Business Journal" stays out since it's commented out
   (disabled) in that same source component. Order and per-logo box sizes
   come straight from the design; the logos have very different aspect
   ratios, so a single shared height reads badly. */
export const NAD_PRESS_LOGOS = [
    { src: `${GLOBAL}/bloomberg-logo.png`, alt: "Bloomberg", width: 129, height: 26 },
    { src: `${GLOBAL}/yahoo-logo-grey.png`, alt: "Yahoo", width: 80, height: 27 },
    { src: `${GLOBAL}/The_Globe_and_Mail_Stretched_grey.png`, alt: "The Globe and Mail", width: 90, height: 25 },
    { src: `${GLOBAL}/huf-magazine-grey.png`, alt: "HUF Magazine", width: 58, height: 19 },
    { src: `${GLOBAL}/influencive-grey.png`, alt: "Influencive", width: 90, height: 27 },
    { src: `${GLOBAL}/market-watch-grey-new.png`, alt: "MarketWatch", width: 49, height: 27 },
    { src: `${GLOBAL}/trendhunters.png`, alt: "Trend Hunter", width: 90, height: 27 },
    { src: `${GLOBAL}/voyage-grey.png`, alt: "Voyage", width: 60, height: 31 },
    { src: `${GLOBAL}/canhealth-logo-2x.png`, alt: "Healthcare Technology", width: 99, height: 26 },
];

const PressLogo = ({ logo }) => (
    <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        sizes="143px"
        className="shrink-0 object-contain brightness-0"
        style={{ width: logo.width, height: logo.height }}
    />
);

/** Static evenly-spaced row on desktop, marquee on mobile, divider underneath. */
const LongevityNadPressLogos = ({ bg = "bg-white" }) => {
    const marqueeLogos = [
        ...NAD_PRESS_LOGOS,
        ...NAD_PRESS_LOGOS,
        ...NAD_PRESS_LOGOS,
        ...NAD_PRESS_LOGOS,
    ];

    return (
        <section className={`w-full ${bg} py-8 md:py-10`}>
            <div className="mx-auto max-w-[1200px] md:px-5">
                <div className="hidden items-center justify-between md:flex">
                    {NAD_PRESS_LOGOS.map((logo) => (
                        <PressLogo key={logo.alt} logo={logo} />
                    ))}
                </div>

                <div className="relative overflow-hidden md:hidden">
                    <div className={`pointer-events-none absolute left-0 top-0 z-[1] h-full w-12 bg-gradient-to-r from-white to-transparent`} />
                    <div className={`pointer-events-none absolute right-0 top-0 z-[1] h-full w-12 bg-gradient-to-l from-white to-transparent`} />
                    <div className="flex w-fit animate-scroll-press-logos items-center gap-10 whitespace-nowrap">
                        {marqueeLogos.map((logo, i) => (
                            <PressLogo key={`${logo.alt}-${i}`} logo={logo} />
                        ))}
                    </div>
                </div>

                <div className="mt-8 h-px w-full bg-[#E2E2E1] md:mt-10" />
            </div>
        </section>
    );
};

export default LongevityNadPressLogos;
