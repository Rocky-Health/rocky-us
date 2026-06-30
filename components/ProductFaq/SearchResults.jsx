import React from "react";
import SearchResultSkeleton from "./SearchResultSkeleton";
import HighlightedFAQItem from "./HighlightedFAQItem";

const SearchResults = ({ results, searchTerm, isLoading }) => {
  if (isLoading) {
    return <SearchResultSkeleton />;
  }

  if (results.length === 0 && searchTerm) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">No results found</h2>
        <p className="text-[#6B6967] break-words">
          We couldn't find any matches for "{searchTerm}". Please try another
          search term.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[32px] font-semibold font-[fellix] mb-6 md:mb-10 leading-[140%]">
        Search Results
      </h2>

      {results.map((result, index) => (
        <div key={index} className="mb-12 last:mb-0">
          <h3 className="text-lg md:text-xl font-medium font-fellix-bold mb-4 leading-[140%] text-[#AE7E56]">
            {result.productName}
          </h3>

          <div>
            {result.faqs.map((faq, faqIndex) => (
              <HighlightedFAQItem
                key={faqIndex}
                question={faq.question}
                answer={faq.answer}
                highlight={searchTerm}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
