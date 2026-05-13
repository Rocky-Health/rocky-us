"use client";

import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import Loader from "@/components/Loader";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import MoreQuestions from "@/components/MoreQuestions";
import Section from "@/components/utils/Section";
import TermsNav from "./TermsNav";

export default function SimpleTermsContent() {
  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTerms() {
      try {
        const response = await fetch("/api/terms-of-use", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setTermsData(data);
      } catch (err) {
        logger.error("Error fetching terms:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTerms();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Section>
        <div className="mb-10 md:mb-14">
          <h1 className="text-[40px] md:text-[60px] leading-[115%] font-[550] tracking-[-0.01em] md:tracking-[-0.02em] mb-3 md:mb-4 headers-font">
            Terms &amp; Conditions
          </h1>
          <p className="text-[18px] opacity-85 md:text-[18px] leading-[140%] font-[400]">
            Content temporarily unavailable
          </p>
        </div>
        <div className="wordpress-content max-w-none">
          <p>
            We apologize, but our terms content is temporarily unavailable.
            Please try refreshing the page or contact us at{" "}
            <a
              href="mailto:contact@myrocky.com"
              className="text-blue-600 underline"
            >
              contact@myrocky.com
            </a>{" "}
            if the issue persists.
          </p>
        </div>
      </Section>
    );
  }

  // Get last modified date
  const lastModified = termsData?.modified
    ? new Date(termsData.modified).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "January 14, 2022";

  // Extract Professional Disclosure section
  const professionalDisclosure = termsData?.sections?.find(
    (section) => section.key === "professional_disclosure"
  );

  // Get remaining sections (excluding Professional Disclosure)
  const remainingSections =
    termsData?.sections?.filter(
      (section) => section.key !== "professional_disclosure"
    ) || [];

  return (
    <Section>
      <div className="mb-10 md:mb-14">
        <h1 className="text-[40px] md:text-[60px] leading-[115%] font-[550] tracking-[-0.01em] md:tracking-[-0.02em] mb-3 md:mb-4 headers-font">
          Terms &amp; Conditions
        </h1>
        <p className="text-[18px] opacity-85 md:text-[18px] leading-[140%] font-[400]">
          Last updated: {lastModified}
        </p>
      </div>

      {/* Professional Disclosure Section */}
      {professionalDisclosure && (
        <div className="mb-10 md:mb-14">
          <div
            className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9] wordpress-content max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(professionalDisclosure.content) }}
          />
        </div>
      )}

      {/* Main content with navigation */}
      <div className="flex flex-col-reverse md:flex-row gap-10 md:gap-[120px]">
        <div className="md:w-[784px]">
          {/* Render remaining sections from API */}
          <div className="space-y-10 md:space-y-14">
            {remainingSections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="terms-section mb-10 md:mb-14"
              >
                <div
                  className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9] wordpress-content max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation sidebar */}
        <TermsNav sections={remainingSections} />
      </div>

      {/* Fallback: render raw content if no sections */}
      {(!termsData?.sections || termsData.sections.length === 0) &&
        termsData?.rawContent && (
          <div className="terms-fallback">
            <div
              className="text-[16px] md:text-[18px] leading-[160%] font-[400] text-[#000000D9] wordpress-content max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(termsData.rawContent) }}
            />
          </div>
        )}

      <div className="mt-16">
        {/* Mobile: Show "More Consultation" */}
        <div className="block md:hidden">
          <MoreQuestions buttonText="More Consultation" />
        </div>

        {/* Desktop: Show "Contact Us" */}
        <div className="hidden md:block">
          <MoreQuestions buttonText="Contact Us" />
        </div>
      </div>
    </Section>
  );
}
