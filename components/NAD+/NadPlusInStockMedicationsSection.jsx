import NadPlusFeaturesCtaBlock from "./NadPlusFeaturesCtaBlock";
import CustomImage from "../utils/CustomImage";
/** Point `imageSrc` at files you add under `/public/dm-offers/…` (WebP or PNG). */
export const NAD_PLUS_INSTOCK_CARDS = [
    {
        title: (
            <>
                Compounded NAD+
                <br className="hidden md:block" /> Injections
            </>
        ),
        badge: "In Stock - Up to $100 OFF",
        imageSrc: "https://myrocky.b-cdn.net/WP%20Images/glp-offer/GLP-1.png",
        imageAlt: "MyRocky GLP-1 NAD+ injection vials",
    },
];

function InStockCard({
    title,
    badge,
    imageSrc,
    imageAlt,
}) {
    return (
        <article className="mx-auto flex w-full max-w-[520px] flex-col rounded-2xl bg-white pt-6 sm:px-6 px-4 shadow-sm ring-1 ring-neutral-200/80 md:rounded-3xl">
            <h3 className="subheaders-font lg:text-5xl text-3xl font-light tracking-normal text-gray-800/80 md:px-0 px-1 mb-4 !leading-tight text-center">
                {title}
                <hr className="mx-auto w-[85%] border-[#E2E2E1] mt-6" />
            </h3>
            <div className="relative mt-0 w-full flex-1 overflow-hidden ">
                <div className="relative mx-auto aspect-square w-full max-w-[420px]">
                    <CustomImage
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        className="object-contain object-bottom"
                        sizes="(max-width: 768px) 100vw, 420px"
                    />
                </div>
                <div
                    className="pointer-events-none absolute bottom-10 left-1/2 z-[1] -translate-x-1/2 rounded-full bg-[linear-gradient(120deg,#f6ea75_0%,#e7c48a_35%,#cb9468_68%,#b27856_100%)] bg-[length:180%_180%] px-6 py-3 text-center font-poppins text-xs font-semibold leading-tight text-black shadow-md md:bottom-10"
                    aria-label={badge}
                >
                    {badge}
                </div>
            </div>
        </article>
    );
}

export default function NadPlusInStockMedicationsSection({
    heading = "Medications In Stock Ready to Ship",
    cards = NAD_PLUS_INSTOCK_CARDS,
}) {
    return (
        <div className="w-full text-center md:text-center">
            <h2 className="subheaders-font text-3xl lg:text-3xl py-10 font-normal tracking-tight text-gray-900 mb-4 sm:px-0 px-4">
                {heading}
            </h2>
            <div className="grid grid-cols-1 gap-8 mb-10 justify-items-center">
                {cards.map((card) => (
                    <InStockCard key={card.title} {...card} />
                ))}
            </div>

            <NadPlusFeaturesCtaBlock />
        </div>
    );
}
