import Image from "next/image";
import { trustBadges as defaultBadges } from "@/components/MedViLanding/data";

const BADGE_ICONS = {
    guarantee: "/medvi/icn-guarantee.svg",
    delivery: "/medvi/icn-shipping.svg",
    doctor: "/medvi/icn-doctor.svg",
    fees: "/medvi/icn-fees.svg",
};

function BadgeIcon({ id }) {
    const src = BADGE_ICONS[id];
    if (!src) {
        return (
            <span
                className="h-10 w-10 shrink-0 rounded-full border border-[#2d2d2d]"
                aria-hidden
            />
        );
    }
    return (
        <Image
            src={src}
            alt=""
            width={28}
            height={28}
            className="h-10 w-10 shrink-0 object-contain"
            unoptimized
            aria-hidden
        />
    );
}

/**
 * Horizontal trust strip: icon + label per cell, grid lines (2×2 mobile, 4 col desktop).
 * @param {{ badges?: { id: string, label: string }[], className?: string }} props
 */
export default function MedViTrustBadgesRow({
    badges = defaultBadges,
    className = "",
}) {
    return (
        <div
            className={`border-y border-[#E2E2E1] bg-white px-5 sectionWidth:px-0 ${className}`}
        >
            <ul
                className="mx-auto grid  grid-cols-2 lg:grid-cols-4"
                role="list"
            >
                {badges.map((badge, i) => (
                    <li
                        key={badge.id}
                        className={`flex items-center justify-center gap-2.5 border-[#E2E2E1] px-3 py-7 sm:px-5 lg:py-8 ${
                            i % 2 === 0 ? "border-r" : ""
                        } ${i < 2 ? "border-b" : ""} lg:border-b-0 ${
                            i < 3 ? "lg:border-r" : ""
                        }`}
                    >
                        <BadgeIcon id={badge.id} />
                        <span className="poppins-font text-left text-[11px] font-[500] leading-snug text-[#2d2d2d] sm:text-lg">
                            {badge.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
