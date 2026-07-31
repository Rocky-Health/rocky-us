import React from "react";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "MyRocky Podcast — Expert Insights on Health",
  description:
    "MyRocky Podcast — Expert Insights on Health",
  path: "/podcast",
});

export default function PodcastLayout({ children }) {
  return <>{children}</>;
}
