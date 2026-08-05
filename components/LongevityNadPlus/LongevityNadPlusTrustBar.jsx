import Image from "next/image";

export const LONGEVITY_NAD_PLUS_TRUST_ITEMS = [
    {
        label: "350K+ patients",
        icon: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/icon-1.png",
    },
    {
        label: "Licensed Clinicians",
        icon: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/icon-2.png",
    },
    {
        label: "Free Discreet Delivery",
        icon: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/icon-3.png",
    },
    {
        label: "Certified Pharmacy",
        icon: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/icon-4.png",
    },
];

const TrustItem = ({ label, icon, staticLayout = false }) => (
    <div
        className={`flex items-center justify-center gap-2 flex-shrink-0 ${
            staticLayout
                ? " px-2"
                : "px-8 md:px-12 min-w-[220px] md:min-w-[260px]"
        }`}
    >
        <div className="relative w-6 h-6 flex-shrink-0">
            <Image
                src={icon}
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
            />
        </div>
        <span className="helvetica-text-font text-[14px] md:text-[16px] leading-[1.4] tracking-[-0.28px] md:tracking-[-0.32px] text-black whitespace-nowrap">
            {label}
        </span>
    </div>
);

const LongevityNadPlusTrustBar = ({
    items = LONGEVITY_NAD_PLUS_TRUST_ITEMS,
    stopOnLargeScreens = false,
}) => {
    // Four identical runs — -25% per cycle keeps the loop seamless on wide viewports.
    const marqueeItems = [...items, ...items, ...items, ...items];

    const marquee = (
        <div className="relative overflow-hidden w-full">
            <div className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-16 bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)]" />
            <div className="pointer-events-none absolute right-0 top-0 z-[1] h-full w-16 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,#ffffff_100%)]" />

            <div className="flex items-center whitespace-nowrap w-fit min-h-[32px] animate-scroll-press-logos">
                {marqueeItems.map((item, index) => (
                    <TrustItem key={`${item.label}-${index}`} {...item} />
                ))}
            </div>
        </div>
    );

    return (
        <section className="w-full bg-white border-b border-[#E2E2E1] overflow-hidden pb-10">
            {stopOnLargeScreens ? (
                <>
                    <div className="hidden lg:flex max-w-[1200px] mx-auto px-5 items-center justify-center gap-12 min-h-[32px]">
                        {items.map((item) => (
                            <TrustItem
                                key={item.label}
                                {...item}
                                staticLayout
                            />
                        ))}
                    </div>
                    <div className="lg:hidden">{marquee}</div>
                </>
            ) : (
                marquee
            )}
        </section>
    );
};

export default LongevityNadPlusTrustBar;
