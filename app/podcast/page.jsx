import React, { Suspense } from "react";
import PodcastsContent from "@/components/Podcast/PodcastsContent";
import PodcastEpisodes from "@/components/Podcast/PodcastEpisodes";
import PodcastSubscribe from "@/components/Podcast/PodcastSubscribe";
import BlogSection from "@/components/Podcast/BlogSection";
import MoreQuestions from "@/components/MoreQuestions";
import { BlogSectionFallback } from "@/components/Podcast/BlogSectionFallback";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

const Podcasts = () => {
    notFound();
    return (
        <>
            <PodcastsContent />
            <PodcastEpisodes />
            <PodcastSubscribe />
            <Suspense fallback={<BlogSectionFallback />}>
                <BlogSection />
            </Suspense>
            <div className="max-w-[1184px] mx-auto pb-14 md:pb-24 px-5 sectionWidth:px-0">
                <MoreQuestions />
            </div>
        </>
    );
};

export default Podcasts;
