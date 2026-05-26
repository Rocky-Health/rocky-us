import MoreQuestions from "@/components/MoreQuestions";
import React from "react";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "ED Medication Services Across US",
  description:
    "Access ED medications online with discreet delivery across the US. Professional consultation and prescription services for Viagra and Cialis.",
  path: "/service-across-canada",
  vertical: "ed",
});

export default function ServiceLayout({ children }) {
  return (
    <>
      {children}
      <div className="max-w-[1184px] mx-auto px-5 pb-8 md:pb-12 md:px-0">
        <MoreQuestions
          title="Your path to better health begins here."
          buttonText="Get Started For Free"
          link="/faqs"
        />
      </div>
    </>
  );
}
