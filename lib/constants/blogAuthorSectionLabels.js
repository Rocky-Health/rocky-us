export const DEFAULT_AUTHOR_SECTION_LABEL = "Author Bio";

const AUTHOR_SECTION_LABEL_CONFIG = [
    {
        label: "Reviewed by",
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
