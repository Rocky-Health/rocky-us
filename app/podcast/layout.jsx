import React from "react";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "MyRocky Podcast — Expert Insights on Men's Health",
  description:
    "Conversations with clinicians and specialists on men's health, longevity, mental wellness, and the science behind MyRocky's treatments.",
  path: "/podcast",
});

export default function PodcastLayout({ children }) {
  return <>{children}</>;
}
