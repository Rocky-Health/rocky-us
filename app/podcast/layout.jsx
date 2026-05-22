import React from "react";

export const metadata = {
  title: "MyRocky | Expert Insights on Health & Wellness",
  description:
    "Explore our collection of informative podcasts covering health, wellness, and lifestyle topics. Listen to expert discussions and stay updated with the latest trends.",
  openGraph: {
    title: "MyRocky | Expert Insights on Health & Wellness",
    description:
      "Explore our collection of informative podcasts covering health, wellness, and lifestyle topics. Listen to expert discussions and stay updated with the latest trends.",
    images:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp",
  },
  twitter: {
    card: "MyRocky | Expert Insights on Health & Wellness",
    title: "MyRocky | Expert Insights on Health & Wellness",
    description:
      "Explore our collection of informative podcasts covering health, wellness, and lifestyle topics. Listen to expert discussions and stay updated with the latest trends.",
    images:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp",
  },
};

export default function PodcastLayout({ children }) {
  return <>{children}</>;
}
