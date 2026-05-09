"use client";

import CustomImage from "@/components/utils/CustomImage";
import { useState } from "react";
import { DM_OFFERS_FAQ_ITEMS } from "./dmOffersFaqData";

const AVATAR_BACKGROUNDS = [
    "from-rose-100 to-amber-100",
    "from-sky-100 to-indigo-100",
    "from-emerald-100 to-teal-100",
    "from-violet-100 to-pink-100",
    "from-orange-100 to-yellow-100",
    "from-cyan-100 to-blue-100",
];

function FaqAvatar({ initials, avatarSrc, bg }) {
    const [useInitials, setUseInitials] = useState(
        () => !avatarSrc || String(avatarSrc).trim() === "",
    );

    if (useInitials) {
        return (
            <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold tracking-tight text-neutral-800 md:text-sm ${bg}`}
                aria-hidden
            >
                {initials}
            </div>
        );
    }

    return (
        <div
            className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-neutral-200 ring-1 ring-neutral-200/80"
            aria-hidden
        >
            <img
                src={avatarSrc}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setUseInitials(true)}
            />
        </div>
    );
}

function FaqRow({ item, index }) {
    const [open, setOpen] = useState(false);
    const bg = AVATAR_BACKGROUNDS[index % AVATAR_BACKGROUNDS.length];

    return (
        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-4 text-left  md:px-5 md:py-5"
            >
                <FaqAvatar
                    initials={item.initials}
                    avatarSrc={item.avatarSrc}
                    bg={bg}
                />
                <span className="min-w-0 flex-1 font-poppins text-[15px] font-medium leading-snug text-neutral-900 md:text-base">
                    {item.question}
                </span>
                <span
                    className="w-6 shrink-0 text-center font-poppins text-2xl font-light leading-none text-neutral-500"
                    aria-hidden
                >
                    {open ? "−" : "+"}
                </span>
            </button>

            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
            >
                <div className="min-h-0 overflow-hidden">
                    <div className="border-t border-neutral-100 px-4 pb-5 pt-1 md:px-5">
                        <div className="flex items-start gap-2 pt-4 ps-4">
                            <div className=" p-3 bg-gray-200 rounded-full relative flex items-center justify-center">
                                <CustomImage
                                    src="/favicon.ico"
                                    alt="MyRocky Logo"
                                    fill
                                    className="w-20 aspect-square object-contain"
                                />
                            </div>
                            <div
                                className="faq-answer max-w-none text-start font-poppins text-sm leading-relaxed text-neutral-600 md:text-[15px] [&_strong]:font-semibold [&_strong]:text-neutral-800 [&_ol]:mb-3 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ul]:mb-3 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_li]:leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_a]:font-medium [&_a]:text-sky-800 [&_a]:underline [&_a]:hover:text-sky-900 [&_u]:underline [&_h4]:mt-4 [&_h4]:font-semibold [&_h4]:text-neutral-900"
                                dangerouslySetInnerHTML={{
                                    __html: item.answer,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DmOffersFaqAccordion({ items = DM_OFFERS_FAQ_ITEMS }) {
    return (
        <div className="mx-auto max-w-5xl px-1 md:px-0">
            <div className="space-y-3 ">
                {items.map((item, index) => (
                    <FaqRow
                        key={`${item.question}-${index}`}
                        item={item}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
}
