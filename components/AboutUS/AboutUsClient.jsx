"use client";

import Goal from "@/components/AboutUS/Goal";
import MemberContainer from "@/components/AboutUS/MemberContainer";
import Mission from "@/components/AboutUS/Mission";
import OurTeamBrief from "@/components/AboutUS/OurTeamBrief";
import TeamContainer from "@/components/AboutUS/TeamContainer";
import HomeFaqsSection from "@/components/HomePage/HomeFaqsSection";
import Section from "@/components/utils/Section";
import { useRef, useState, useEffect } from "react";

// TK-438: interactive island for /about-us. The page (Server Component) passes
// the static team data in as props; this island owns the refs + scroll state.
export default function AboutUsClient({
    leadershipTeam = [],
    medicalTeam = [],
    pharmaceuticalTeam = [],
}) {
    const videoRef = useRef(null);
    const scrollRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    useEffect(() => {
        const container = scrollRef.current;

        const handleScroll = () => {
            if (!container) return;

            const scrollLeft = container.scrollLeft;
            const containerWidth = container.offsetWidth;
            const scrollWidth = container.scrollWidth;

            const cardCount = leadershipTeam.length;

            const totalScrollable = scrollWidth - containerWidth;
            const percentageScrolled = scrollLeft / totalScrollable;
            const estimatedIndex = Math.round(
                percentageScrolled * (cardCount - 1)
            );

            setActiveIndex(estimatedIndex);
        };

        container?.addEventListener("scroll", handleScroll);
        return () => container?.removeEventListener("scroll", handleScroll);
    }, [leadershipTeam.length]);

    return (
        <>
            <Mission videoRef={videoRef} />
            <Section bg="bg-[#F8F7F5]">
                <Goal />
            </Section>
            <Section>
                <OurTeamBrief />
                <TeamContainer
                    scrollRef={scrollRef}
                    teamMembers={leadershipTeam}
                    title="Leadership Team"
                />
            </Section>
            <Section>
                <MemberContainer
                    teamMembers={medicalTeam}
                    title="Medical advisory team"
                />
            </Section>

            <Section>
                <MemberContainer
                    teamMembers={pharmaceuticalTeam}
                    title="Pharmaceutical Advisory Team"
                />
            </Section>
            <Section bg="bg-[#F8F7F5]">
                <HomeFaqsSection />
            </Section>
        </>
    );
}
