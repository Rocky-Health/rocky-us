import { useMemo } from "react";
import FaqItem from "@/components/FaqItem";
import HomeHeading from "./HomeHeading";

const FaqsSection = ({
    title,
    subtitle,
    faqs,
    name,
    nameWithLineBreak,
    isFirstCardOpen,
    blackText = "",
    accentText = "",
    accentColor = "",
}) => {
    const groupedFaqs = useMemo(() => {
        if (!faqs || faqs.length === 0) return [];

        const hasSections = faqs.some((faq) => faq.section);

        if (!hasSections) {
            return [{ title: null, faqs }];
        }

        const sections = {};
        faqs.forEach((faq) => {
            const sectionTitle = faq.section || "Other";
            if (!sections[sectionTitle]) {
                sections[sectionTitle] = [];
            }
            sections[sectionTitle].push(faq);
        });

        return Object.entries(sections).map(([title, sectionFaqs]) => ({
            title,
            faqs: sectionFaqs,
        }));
    }, [faqs]);

    return (
        <div className="max-w-[1184px] mx-auto px-5 md:px-0 py-7 md:py-12">
            <div
                className={`mx-auto grid md:grid-cols-3 gap-[24px] lg:gap-[93px] items-start`}
            >
                <div className="md:col-span-1">
                    {blackText || accentText ? (
                        <HomeHeading
                            blackText={blackText || title}
                            accentText={accentText || ""}
                            accentColor={accentColor || "#AE7E56"}
                        />
                    ) : (
                        <h2 className="text-[32px] md:text-[48px] leading-[36.8px] md:leading-[55.2px]  tracking-[-0.01em] md:tracking-[-0.02em] font-[550] mb-3 md:mb-4 headers-font">
                            {title}
                        </h2>
                    )}
                    <p className="text-[18px] md:text-[20px] leading-[25.2px] md:leading-[28px] font-[400]  md:mb-[80px]">
                        {subtitle}
                    </p>
                </div>

                <div
                    className={`md:col-span-2 ${
                        name && !groupedFaqs.some((section) => section.title)
                            ? "self-start"
                            : ""
                    }`}
                >
                    {groupedFaqs.map((section, sectionIndex) => (
                        <div
                            key={sectionIndex}
                            className={`mb-8 last:mb-0 ${
                                section.title
                                    ? "grid md:grid-cols-2 lg:grid-cols-3 gap-[24px] lg:gap-[174px] items-start"
                                    : ""
                            }`}
                        >
                            {section.title && (
                                <div>
                                    <h3 className="text-[20px] md:text-[24px] leading-[23px] md:leading-[27.6px] font-[450] md:pt-4 headers-font text-[#8B6F47]">
                                        {section.title}
                                    </h3>
                                </div>
                            )}
                            <div
                                className={`${section.title ? "self-start lg:col-span-2" : ""}`}
                            >
                                {section.faqs.map((faq, index) => (
                                    <FaqItem
                                        key={`${sectionIndex}-${index}`}
                                        question={faq.question}
                                        answer={faq.answer}
                                        isFirstCardOpen={
                                            isFirstCardOpen &&
                                            sectionIndex === 0 &&
                                            index === 0
                                        }
                                        index={index}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FaqsSection;
