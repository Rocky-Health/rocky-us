export const DEFAULT_AUTHOR_SECTION_LABEL = "Medically Reviewed By";

const AUTHOR_SECTION_LABEL_CONFIG = [
    {
        label: "Medically Reviewed By",
        authors: [
            "Dr. G. Mankaryous",
            "Dr. George Mankaryous",
        ],
    },
];

const normalizeText = (value = "") =>
    String(value)
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

const AUTHOR_SECTION_LABEL_OVERRIDES = AUTHOR_SECTION_LABEL_CONFIG.reduce(
    (overrides, config) => {
        config.authors.forEach((authorName) => {
            overrides[normalizeText(authorName)] = config.label;
        });
        return overrides;
    },
    {}
);

export const getAuthorSectionLabel = ({ authorName = "", postLabel } = {}) => {
    if (postLabel?.trim()) {
        return postLabel.trim();
    }

    const normalizedAuthorName = normalizeText(authorName);
    return (
        AUTHOR_SECTION_LABEL_OVERRIDES[normalizedAuthorName] ||
        DEFAULT_AUTHOR_SECTION_LABEL
    );
};
