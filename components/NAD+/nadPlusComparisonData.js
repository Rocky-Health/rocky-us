export const NAD_PLUS_PRODUCT_BOTTLE_IMAGE = "/nad+/NAD+ product bottle.png";

export const NAD_PLUS_COMPARISON_HEADER = {
    title: "Not all NAD+ is the same",
    disclaimer:
        "Be wary of cheap research peptides, or medication with low to no absorption such as supplements. We only offer real high-potency Dr Prescribed NAD+ Injections you can trust.",
};

export const NAD_PLUS_COMPARISON_CRITERIA = [
    "Legally prescribed for human use",
    "Purity & transparency",
    "Absorption rate",
    "Medical oversight",
    "Results timeline",
    "Safety & compliance",
    "Monthly cost",
];

/** @typedef {'check' | 'x' | 'warning' | 'dash' | 'none'} ComparisonStatus */

/**
 * @typedef {{ status: ComparisonStatus, text: string }} ComparisonCell
 */

export const NAD_PLUS_COMPARISON_COLUMNS = [
    {
        id: "myrocky",
        title: "MyRocky NAD+ Injections",
        subtitle: "(500-1000mg)",
        image: NAD_PLUS_PRODUCT_BOTTLE_IMAGE,
        imageAlt: "MyRocky NAD+ product bottle",
        highlight: true,
        cells: [
            { status: "check", text: "Yes — Rx from licensed provider" },
            { status: "check", text: "Clinical-grade, US pharmacy sourced" },
            { status: "check", text: "~100% bioavailability (injection)" },
            { status: "check", text: "Includes consult & dosage guidance" },
            { status: "check", text: "Fast — feel energy & clarity in days" },
            { status: "check", text: "HIPAA-compliant & pharmacy-verified" },
            { status: "check", text: "Starting at $99/mo" },
        ],
    },
    {
        id: "research-peptides",
        title: 'Research Peptides "NAD+"',
        subtitle: "(500-1000mg)",
        image: "/nad+/compare-comp1.jpg",
        imageAlt: "Research peptides NAD+ vials",
        highlight: false,
        cells: [
            { status: "x", text: "Not approved for human use" },
            { status: "x", text: "Often unverified; inconsistent dosage" },
            { status: "x", text: "Injection form, but questionable purity" },
            { status: "x", text: "None" },
            { status: "x", text: "Unpredictable" },
            { status: "x", text: "Risk of contamination & legal issues" },
            { status: "x", text: "Varies — Low Price = Risky" },
        ],
    },
    {
        id: "oral-supplements",
        title: "Oral NAD+ Supplements",
        subtitle: "(175-250mg)",
        image: "/nad+/compare-comp2.jpg",
        imageAlt: "Oral NAD+ supplement bottle",
        highlight: false,
        cells: [
            { status: "check", text: "Yes — Over the counter" },
            { status: "warning", text: "Variable quality & under-dosed" },
            { status: "dash", text: "Low — ~10-15% absorbed" },
            { status: "x", text: "None" },
            { status: "warning", text: "Slow or negligible" },
            { status: "warning", text: "Often lacks 3rd-party testing" },
            { status: "none", text: "$40-$100/mo" },
        ],
    },
];
