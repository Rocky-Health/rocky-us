import DmOffersFeaturesCtaBlock from "./DmOffersFeaturesCtaBlock";
import CustomImage from "../utils/CustomImage";
/** Point `imageSrc` at files you add under `/public/dm-offers/…` (WebP or PNG). */
export const DM_OFFERS_INSTOCK_CARDS = [
    {
        title: (
            <>
                Compounded
                <br className="hidden md:block" /> GLP-1
            </>
        ),
        badge: "In Stock - Up to $200 OFF",
        imageSrc: "https://myrocky.b-cdn.net/WP%20Images/glp-offer/GLP-1.png",
        imageAlt: "M yRocky compounded GLP-1/GIP injection vials",
    },
    {
        title: "Compounded GLP-1/GIP",
        badge: "In Stock - Up to $200 OFF",
        imageSrc: "https://myrocky.b-cdn.net/WP%20Images/glp-offer/GIP.png",
        imageAlt: "MyRocky compounded GLP-1 injection vials",
    },
];

function InStockCard({ title, badge, imageSrc, imageAlt }) {
    return (
        <article className="flex flex-col rounded-2xl bg-white pt-6 sm:px-6 px-2 shadow-sm ring-1 ring-neutral-200/80  md:rounded-3xl">
            <h3 className="subheaders-font lg:text-5xl text-3xl font-light tracking-normal text-gray-800/80 md:px-10 px-1 mb-4 !leading-tight ">
                {title}
                <hr className="w-full border-[rgba(59, 130, 246, 0.5)] mt-6" />
            </h3>
            <div className="relative mt-0 w-full flex-1 overflow-hidden ">
                <div className="relative aspect-square w-full max-w-[90%] mx-auto ">
                    <CustomImage
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        className="object-contain object-bottom "
                        sizes="(max-width: 768px) 100vw, 40vw"
                    />
                </div>
                <div
                    className="pointer-events-none absolute bottom-10 left-0 z-[1] rounded-full bg-[linear-gradient(120deg,#f6ea75_0%,#e7c48a_35%,#cb9468_68%,#b27856_100%)] bg-[length:180%_180%]  py-3 text-center font-poppins font-semibold leading-tight text-black shadow-md md:bottom-10 md:left-0 px-6 text-xs"
                    aria-label={badge}
                >
                    {badge}
                </div>
            </div>
        </article>
    );
}

export default function DmOffersInStockMedicationsSection({
    heading = "Medications In Stock Ready to Ship",
    cards = DM_OFFERS_INSTOCK_CARDS,
}) {
    return (
        <div className="w-full text-center md:text-center">
            <h2 className="subheaders-font text-3xl lg:text-3xl py-10 font-normal tracking-tight text-gray-900 mb-4 sm:px-0 px-4">
                {heading}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:text-left mb-10">
                {cards.map((card) => (
                    <InStockCard key={card.title} {...card} />
                ))}
            </div>

            <DmOffersFeaturesCtaBlock />
        </div>
    );
}
