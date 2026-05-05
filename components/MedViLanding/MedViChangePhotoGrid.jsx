import CustomImage from "@/components/utils/CustomImage";
import { WL_MEDVI_CHANGE_GRID_TILES as defaultTiles } from "@/components/MedViLanding/wlMedViChangeGridImages";

function PhotoCell({ src, alt, className, classNameContainer = "" }) {
    const hasSrc = Boolean(src);
    return (
        <div
            className={`relative lg:pe-0 pe-2 sm:pe-2 lg:pb-0 sm:pb-4 pb-2 overflow-hidden  ${className}`}
        >
            {hasSrc ? (
                <div
                    className={`relative w-full h-full overflow-hidden rounded-[40px] ${classNameContainer}`}
                >
                    <CustomImage
                        src={src}
                        alt={alt || "Patient"}
                        fill
                        sizes="(max-width: 1024px) 48vw, 24vw"
                        className="object-cover hover:scale-105 transition-all duration-300"
                        loading="lazy"
                    />
                </div>
            ) : (
                <span className="absolute inset-0 bg-[#E2E2E1]" aria-hidden />
            )}
        </div>
    );
}

/**
 * Headline + MEDVi-style 4-column / 7-tile masonry. Image `src` values:
 * wlMedViChangeGridImages.js
 *
 * @param {{ tiles?: { id: string, src: string, alt: string }[] }} props
 */
export default function MedViChangePhotoGrid({ tiles = defaultTiles }) {
    const [c1Top, c1Bot, c2Top, c2Bot, center, c4Top, c4Bot] = tiles.slice(
        0,
        7,
    );

    return (
        <div className="w-full">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12 lg:mb-14 px-4">
                <h2 className="headers-font text-[#1a1a1a] sm:text-[28px] text-[24px] leading-[115%] font-[500]  tracking-tight mb-3">
                    The change we&apos;ve all been waiting for.
                </h2>
                <p className="poppins-font text-[#6b6b6b] text-sm leading-[1.5]">
                    Join the over{" "}
                    <span className="font-[700] text-[#AE7E56]">500,000</span>{" "}
                    MyRocky patients and we&apos;ll help you finally get real,
                    lasting results.
                </p>
            </div>

            {/* Desktop: col1 stacked | col2 stacked | tall center rowspan 2 | col4 stacked */}
            <div className=" grid sm:grid-cols-[1fr_1.12fr_1.12fr_1fr] grid-cols-[1fr_1.12fr_1fr] sm:grid-rows-6 grid-rows-4 lg:gap-5 h-[clamp(360px,50vw,540px)] ">
                <PhotoCell
                    {...c1Top}
                    className="col-start-1 row-start-1 min-h-0 h-full sm:row-span-2 row-span-1 lg:mt-0 sm:mt-10 mt-4"
                    classNameContainer="lg:rounded-l-[40px] rounded-l-none"
                />
                <PhotoCell
                    {...c1Bot}
                    className="col-start-1 sm:row-start-3 row-start-2 min-h-0 h-full sm:row-span-4 row-span-3 lg:mt-0 sm:mt-10 mt-4"
                    classNameContainer="lg:rounded-l-[40px] rounded-l-none"
                />
                <PhotoCell
                    {...c2Top}
                    className="col-start-2 row-start-1 sm:min-h-0 sm:h-full sm:row-span-3 row-span-2 lg:mt-0 sm:mt-4 mt-2"
                />
                <PhotoCell
                    {...c2Bot}
                    className="col-start-2 sm:row-start-4 row-start-3 sm:min-h-0 sm:h-full sm:row-span-3 row-span-2 lg:mt-0 sm:mt-4 mt-0"
                />
                <PhotoCell
                    {...center}
                    className="col-start-3 sm:row-start-1 row-span-6 sm:min-h-0 sm:h-full lg:mt-0 sm:mt-4  sm:!pe-2 !pe-0 "
                    classNameContainer="sm:rounded-r-[40px] rounded-r-none"
                />
                <PhotoCell
                    {...c4Top}
                    className="sm:col-start-4 sm:row-start-1 sm:min-h-0 sm:h-full row-span-4 !pe-0 sm:block hidden"
                    classNameContainer="lg:rounded-r-[40px] rounded-r-none"
                />
                <PhotoCell
                    {...c4Bot}
                    className="sm:col-start-4 sm:row-start-5 sm:min-h-0 sm:h-full row-span-2 !pe-0 sm:block hidden"
                    classNameContainer="lg:rounded-r-[40px] rounded-r-none"
                />
            </div>

            {/* Tablet / mobile: 2-column flow */}
            {/* <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
                <PhotoCell {...c1Top} className="aspect-[5/4] min-h-[120px]" />
                <PhotoCell {...c2Top} className="aspect-[4/5] min-h-[120px]" />
                <PhotoCell {...c1Bot} className="aspect-[4/5] min-h-[120px]" />
                <PhotoCell {...c2Bot} className="aspect-[4/5] min-h-[120px]" />
                <PhotoCell
                    {...center}
                    className="col-span-2 aspect-[16/11] min-h-[180px] sm:min-h-[220px]"
                />
                <PhotoCell {...c4Top} className="aspect-square min-h-[120px]" />
                <PhotoCell {...c4Bot} className="aspect-[5/3] min-h-[120px]" />
            </div> */}
        </div>
    );
}
