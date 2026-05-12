const CHECK_BG = "bg-[#AE7E56]";

const STAT_ITEMS = [
    {
        key: "s1",
        text: "6x more weight loss than exercise and diet alone",
    },
    {
        key: "s2",
        text: "Lose an average of 18% of your body weight",
    },
    {
        key: "s3",
        text: "93% kept the weight off for good",
    },
];

function CheckIcon() {
    return (
        <span
            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${CHECK_BG}`}
            aria-hidden
        >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path
                    d="M1 4l2.5 2.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
}

export default function MedViChangeStatsRow() {
    return (
        <div className="w-full sm:pt-16 pt-10 sm:px-10 px-6">
            <ul className="flex flex-col sm:gap-4 gap-2 md:gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
                {STAT_ITEMS.map(({ key, text }) => (
                    <li
                        key={key}
                        className="flex items-center gap-3 lg:flex-1 lg:max-w-fit"
                    >
                        <CheckIcon />
                        <span className="subheaders-font font-normal text-[#2d2d2d] text-sm md:text-[16px] leading-snug">
                            {text}
                        </span>
                    </li>
                ))}
            </ul>
            <p className="sm:mt-4 mt-2 text-left text-[10px] text-[#8a8a8a] leading-relaxed max-w-2xl">
                * Data based on MyRocky patients over their first 6 months of
                treatment
            </p>
        </div>
    );
}
