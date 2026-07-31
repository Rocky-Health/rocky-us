"use client";
import MobilePodcastSlider from "./MobilePodcastSlider";
import DesktopPodcastGrid from "./DesktopPodcastGrid";
import { episodes } from "@/lib/constants/episodes";
import SectionContainer from "./SectionContainer";
import SectionHeader from "./SectionHeader";
import CategorySorting from "./CategorySorting";
import { useState } from "react";

const PodcastEpisodes = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest to Oldest");
  const categories = [
    "All",
    "Hair Loss",
    "Life style",
    "Mental Health",
    "Sexual Health",
  ];

  return (
    <SectionContainer>
      <SectionHeader
        title="Popular Health Podcast Episodes"
        subtitle="Stay informed, stay healthy."
      />

      <CategorySorting
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Mobile Slider */}
      <MobilePodcastSlider
        episodes={
          selectedCategory === "All"
            ? episodes
            : episodes.filter((ep) => ep.category === selectedCategory)
        }
        sortBy={sortBy}
      />

      {/* Desktop Grid */}
      <DesktopPodcastGrid
        episodes={
          selectedCategory === "All"
            ? episodes
            : episodes.filter((ep) => ep.category === selectedCategory)
        }
        sortBy={sortBy}
      />
    </SectionContainer>
  );
};

export default PodcastEpisodes;
