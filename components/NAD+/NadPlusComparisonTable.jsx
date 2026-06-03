"use client";

import {
    FaCheckCircle,
    FaExclamationCircle,
    FaRegTimesCircle,
} from "react-icons/fa";
import { HiMinus } from "react-icons/hi";
import CustomImage from "@/components/utils/CustomImage";

const ROCKY_HIGHLIGHT_GRADIENT = {
    background:
        "linear-gradient(348.23deg, #AE7E56 -6.68%, #F7EBE4 51.89%, #EFE2D7 88.25%)",
};

function ComparisonStatusIcon({ status }) {
    switch (status) {
        case "check":
            return (
                <FaCheckCircle
                    className="size-5 shrink-0 text-[#AE7E56]"
                    aria-hidden
                />
            );
        case "x":
            return (
                <FaRegTimesCircle
                    className="size-5 shrink-0 text-gray-700"
                    aria-hidden
                />
            );
        case "warning":
            return (
                <FaExclamationCircle
                    className="size-5 shrink-0 text-[#8B6144]"
                    aria-hidden
                />
            );
        case "dash":
            return (
                <HiMinus
                    className="size-5 shrink-0 text-gray-700"
                    aria-hidden
                />
            );
        default:
            return null;
    }
}

function ComparisonCellContent({ cell }) {
    if (cell.status === "none") {
        return (
            <p className="font-poppins text-[11px] font-medium leading-snug text-gray-900 sm:text-xs md:text-sm">
                {cell.text}
            </p>
        );
    }

    return (
        <div className="flex items-start gap-2">
            <ComparisonStatusIcon status={cell.status} />
            <p className="font-poppins text-[11px] font-medium leading-snug text-gray-900 sm:text-xs md:text-sm">
                {cell.text}
            </p>
        </div>
    );
}

export default function NadPlusComparisonTable({
    header,
    criteria,
    columns,
}) {
    return (
        <div className="mx-auto w-full max-w-6xl">
            <div className="mb-6 md:mb-8 lg:hidden">
                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {header.title}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-center text-sm font-light leading-relaxed text-gray-600">
                    {header.disclaimer}
                </p>
            </div>

            <div className="flex flex-row overflow-x-auto scrollbar-hide lg:overflow-x-visible">
                {/* Criteria column */}
                <div className="w-[38%] min-w-[140px] shrink-0 lg:w-[28%]">
                    <div className="flex min-h-[120px] items-end border-b border-[#E2E2E1] pb-4 lg:min-h-[200px]">
                        <div className="hidden lg:block">
                            <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 xl:text-4xl">
                                {header.title}
                            </h2>
                            <p className="mt-3 text-sm font-light leading-relaxed text-gray-600">
                                {header.disclaimer}
                            </p>
                        </div>
                    </div>
                    {criteria.map((label) => (
                        <div
                            key={label}
                            className="flex min-h-[72px] items-center border-b border-[#E2E2E1] py-3 pr-2 lg:min-h-[88px] lg:py-4"
                        >
                            <span className="font-poppins text-[11px] font-semibold leading-snug text-gray-900 sm:text-xs md:text-sm">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Product columns */}
                {columns.map((column) => {
                    const highlighted = column.highlight;

                    return (
                        <div
                            key={column.id}
                            className={`w-[31%] min-w-[118px] shrink-0 lg:w-[24%] ${
                                highlighted
                                    ? "overflow-hidden rounded-xl border border-[#E2E2E1]"
                                    : ""
                            }`}
                            style={highlighted ? ROCKY_HIGHLIGHT_GRADIENT : undefined}
                        >
                            <div className="flex min-h-[120px] flex-col items-center justify-end gap-2 border-b border-[#E2E2E1] px-2 pb-4 pt-3 lg:min-h-[200px] lg:px-3">
                                <CustomImage
                                    src={column.image}
                                    alt={column.imageAlt}
                                    width={80}
                                    height={100}
                                    className="h-14 w-auto object-contain sm:h-16 lg:h-24"
                                />
                                <p className="text-center font-poppins text-[10px] font-semibold leading-tight text-gray-900 sm:text-xs lg:text-sm">
                                    {column.title}
                                    <br />
                                    <span className="font-normal text-gray-700">
                                        {column.subtitle}
                                    </span>
                                </p>
                            </div>

                            {column.cells.map((cell, index) => (
                                <div
                                    key={`${column.id}-${index}`}
                                    className="flex min-h-[72px] items-center border-b border-[#E2E2E1] px-2 py-3 lg:min-h-[88px] lg:px-3 lg:py-4"
                                >
                                    <ComparisonCellContent cell={cell} />
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
