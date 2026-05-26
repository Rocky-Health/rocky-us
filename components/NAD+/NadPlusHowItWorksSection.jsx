import Image from "next/image";
import { MdPlayArrow } from "react-icons/md";
import CustomImage from "@/components/utils/CustomImage";
import {
    NAD_PLUS_HOW_IT_WORKS_CONTENT,
    NAD_PLUS_HOW_IT_WORKS_IMAGE,
    NAD_PLUS_HOW_IT_WORKS_VIAL_IMAGE,
} from "./nadPlusHowItWorksData";

export default function NadPlusHowItWorksSection({
    content = NAD_PLUS_HOW_IT_WORKS_CONTENT,
    imageSrc = NAD_PLUS_HOW_IT_WORKS_IMAGE,
    vialImageSrc = NAD_PLUS_HOW_IT_WORKS_VIAL_IMAGE,
    imageAlt = "Active lifestyle — NAD+ cellular energy",
    vialAlt = "NAD+ prescription vial",
}) {
    return (
        <section className="w-full bg-[#F5F4EF] px-4 py-12 md:py-16 lg:py-20">
            <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
                <div className="relative mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-3xl shadow-md">
                    <CustomImage
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        className="object-cover object-center"
                        sizes="(max-width: 1024px) 90vw, 520px"
                    />
                    <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                        aria-hidden
                    />
                    <div className="absolute bottom-4 left-4 z-10 sm:bottom-6 sm:left-6">
                        <Image
                            src={vialImageSrc}
                            alt={vialAlt}
                            width={120}
                            height={160}
                            className="h-auto w-[72px] object-contain drop-shadow-lg sm:w-[96px]"
                        />
                    </div>
                    <p className="absolute bottom-5 right-5 z-10 max-w-[55%] text-right font-poppins text-2xl font-bold leading-tight text-[#F0E8DF] drop-shadow-sm sm:bottom-7 sm:right-7 sm:text-3xl lg:text-4xl">
                        {content.imageOverlayTitle}
                    </p>
                </div>

                <div className="lg:pl-2">
                    <h2 className="text-3xl font-light leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                        {content.headline}
                    </h2>
                    <p className="mt-4 font-poppins text-base font-light leading-relaxed text-gray-600 sm:text-lg">
                        {content.subheadline}
                    </p>

                    <p className="mt-8 font-poppins text-sm font-semibold tracking-wide text-[#AE7E56] sm:mt-10">
                        {content.eyebrow}
                    </p>

                    <div className="mt-3 rounded-xl border border-[#E2E2E1] bg-white px-5 py-5 sm:px-6 sm:py-6">
                        <MdPlayArrow
                            className="mb-2 size-6 text-gray-900"
                            aria-hidden
                        />
                        <p className="font-poppins text-base font-semibold leading-relaxed text-gray-900 sm:text-lg">
                            {content.body}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
