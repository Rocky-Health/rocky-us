import CustomImage from "@/components/utils/CustomImage";
import { WL_MEDVI_CHANGE_GRID_TILES as defaultTiles } from "@/components/MedViLanding/wlMedViChangeGridImages";

function PhotoCell({ src, alt, className }) {
    const hasSrc = Boolean(src);
    return (
        <div
            className={`relative overflow-hidden  bg-[#E2E2E1] shadow-sm rounded-[40px] ${className}`}
        >
            {hasSrc ? (
                <div className="relative w-full h-full overflow-hidden">
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
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12 lg:mb-14">
                <h2 className="headers-font text-[#1a1a1a] text-[1.75rem] sm:text-3xl  font-[500] leading-[1.15] tracking-tight mb-3">
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
            <div className="hidden lg:grid lg:grid-cols-[1fr_1fr_1.12fr_1fr] lg:grid-rows-6 lg:gap-5 lg:h-[clamp(460px,50vw,540px)] ">
                <PhotoCell
                    {...c1Top}
                    className="lg:col-start-1 lg:row-start-1 lg:min-h-0 lg:h-full row-span-2"
                />
                <PhotoCell
                    {...c1Bot}
                    className="lg:col-start-1 lg:row-start-3 lg:min-h-0 lg:h-full row-span-4"
                />
                <PhotoCell
                    {...c2Top}
                    className="lg:col-start-2 lg:row-start-1 lg:min-h-0 lg:h-full row-span-3"
                />
                <PhotoCell
                    {...c2Bot}
                    className="lg:col-start-2 lg:row-start-4 lg:min-h-0 lg:h-full row-span-3"
                />
                <PhotoCell
                    {...center}
                    className="lg:col-start-3 lg:row-start-1 lg:row-span-6 lg:min-h-0 lg:h-full"
                />
                <PhotoCell
                    {...c4Top}
                    className="lg:col-start-4 lg:row-start-1 lg:min-h-0 lg:h-full row-span-4"
                />
                <PhotoCell
                    {...c4Bot}
                    className="lg:col-start-4 lg:row-start-5 lg:min-h-0 lg:h-full row-span-2"
                />
            </div>

            {/* Tablet / mobile: 2-column flow */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:hidden">
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
            </div>
        </div>
    );
}
