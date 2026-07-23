"use client";

import Section from "@/components/utils/Section";
import { useState, useMemo } from "react";
import { useSearch } from "@/components/utils/UseSearch";
import CoverSection from "@/components/FAQS/CoverSection";
import CategoryContainer from "@/components/FAQS/CategoryContainer";
import FAQSContainer from "@/components/FAQS/FAQSContainer";
import MoreQuestionContainer from "@/components/FAQS/MoreQuestionContainer";
import SearchResult from "@/components/FAQS/SearchResult";

const FaqsButton = ["all", "hair loss", "weight loss", "sexual health"];

// Interactive island for /faqs. Static FAQ content is passed in as props from
// the Server Component page so the route can pre-render as static HTML.
export default function FaqsClient({
    homeFaqs = [],
    hairLossFaqs = [],
    wlFaqs = [],
    sexualHealthFaqs = [],
}) {
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Get all FAQs data
    const allFaqs = useMemo(() => {
        return [
            ...homeFaqs.map((faq) => ({ ...faq, category: "all" })),
            ...hairLossFaqs.map((faq) => ({ ...faq, category: "hair loss" })),
            ...wlFaqs.map((faq) => ({ ...faq, category: "weight loss" })),
            ...sexualHealthFaqs.map((faq) => ({
                ...faq,
                category: "sexual health",
            })),
        ];
    }, [homeFaqs, hairLossFaqs, wlFaqs, sexualHealthFaqs]);

    const {
        searchValue,
        setSearchValue,
        debouncedValue,
        isSearching,
        handleSearch,
        highlightText,
    } = useSearch();

    // Filter FAQs based on search or category
    const displayedFaqs = useMemo(() => {
        // If searching (with 3+ characters), search across all FAQs
        if (debouncedValue && debouncedValue.trim().length >= 3) {
            const searchTerm = debouncedValue.toLowerCase().trim();
            return allFaqs
                .filter((faq) => {
                    return (
                        faq.question.toLowerCase().includes(searchTerm) ||
                        faq.answer.toLowerCase().includes(searchTerm)
                    );
                })
                .map((faq) => ({
                    ...faq,
                    // Highlight the matched text
                    question: highlightText(faq.question, searchTerm),
                    answer: highlightText(faq.answer, searchTerm),
                }));
        }

        // Otherwise, filter by category
        switch (selectedCategory) {
            case "weight loss":
                return wlFaqs;
            case "hair loss":
                return hairLossFaqs;
            case "sexual health":
                return sexualHealthFaqs;
            case "all":
            default:
                return homeFaqs;
        }
    }, [
        debouncedValue,
        selectedCategory,
        allFaqs,
        highlightText,
        homeFaqs,
        hairLossFaqs,
        wlFaqs,
        sexualHealthFaqs,
    ]);

    const showCategoryFilters =
        !debouncedValue || debouncedValue.trim().length < 3;

    return (
        <>
            <CoverSection
                setSearchValue={setSearchValue}
                searchValue={searchValue}
                handleSearch={handleSearch}
            />
            <Section>
                {/* Show search status if searching */}
                <SearchResult
                    debouncedValue={debouncedValue}
                    isSearching={isSearching}
                    searchValue={searchValue}
                    displayedFaqs={displayedFaqs}
                />

                {/* Only show category filters when not searching */}
                {showCategoryFilters && (
                    <CategoryContainer
                        FaqsButton={FaqsButton}
                        setSelectedCategory={setSelectedCategory}
                        selectedCategory={selectedCategory}
                    />
                )}

                {/* Display FAQs or loading skeleton */}
                <FAQSContainer
                    debouncedValue={debouncedValue}
                    isSearching={isSearching}
                    searchValue={searchValue}
                    displayedFaqs={displayedFaqs}
                />

                <MoreQuestionContainer
                    debouncedValue={debouncedValue}
                    displayedFaqs={displayedFaqs}
                />
            </Section>
        </>
    );
}
