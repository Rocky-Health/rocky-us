import { useMemo } from "react";
import FaqItem from "@/components/FaqItem";

/** Fork of `@/components/FaqsSection` — layout only for `/ed-1`; rows use shared `FaqItem`. */
const Ed1FaqsSectionLayout = ({
  title,
  subtitle,
  faqs,
  name,
  nameWithLineBreak,
  isFirstCardOpen,
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
    <div className="w-full max-w-none mx-auto px-0 md:px-2 lg:px-4 py-7 md:py-12">
      <div className="mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 items-start">
        <div className="md:col-span-1 min-w-0">
          <h2 className="text-[60px] leading-[1.05] max-w-full tracking-[-0.02em] font-[550] mb-3 md:mb-4 headers-font">
            {title}
          </h2>
          {subtitle != null && subtitle !== "" && (
            <p className="text-[18px] leading-[25.2px] font-[400] mb-4 md:mb-6">
              {subtitle}
            </p>
          )}
          {name ? (
            <div className="text-[18px] leading-[25.2px] font-[400] text-gray-800">
              {nameWithLineBreak ? (
                <>
                  {nameWithLineBreak.firstLine}
                  <br />
                  {nameWithLineBreak.secondLine}
                </>
              ) : (
                name
              )}
            </div>
          ) : null}
        </div>

        <div className="self-start md:col-span-2 min-w-0">
          {groupedFaqs.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className={`mb-8 last:mb-0 ${
                section.title
                  ? "grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 items-start"
                  : ""
              }`}
            >
              {section.title && (
                <div className="md:col-span-1 min-w-0">
                  <h3 className="text-[20px] md:text-[24px] leading-[23px] md:leading-[27.6px] font-[450] md:pt-4 headers-font text-[#8B6F47]">
                    {section.title}
                  </h3>
                </div>
              )}
              <div
                className={`${section.title ? "self-start md:col-span-2" : ""}`}
              >
                {section.faqs.map((faq, index) => (
                  <FaqItem
                    key={`${sectionIndex}-${index}`}
                    question={faq.question}
                    answer={faq.answer}
                    isFirstCardOpen={
                      isFirstCardOpen && sectionIndex === 0 && index === 0
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

export default Ed1FaqsSectionLayout;
