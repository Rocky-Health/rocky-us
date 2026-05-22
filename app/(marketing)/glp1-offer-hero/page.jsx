import Section from "@/components/utils/Section";
import GLP1HeroSection from "@/components/GLP1Offer/GLP1HeroSection";
import Glp2OfferPromoBar from "@/components/GLP1Offer/Glp2OfferPromoBar";
import Glp2OfferHeader from "@/components/GLP1Offer/Glp2OfferHeader";
import GLP1ProductTiers from "@/components/GLP1Offer/GLP1ProductTiers";
import GLP1StatsSection from "@/components/GLP1Offer/GLP1StatsSection";
import GLP1TestimonialsShowcase from "@/components/GLP1Offer/GLP1TestimonialsShowcase";
import GLP1WeightCalculator from "@/components/GLP1Offer/GLP1WeightCalculator";
import GLP1ChangeStats from "@/components/GLP1Offer/GLP1ChangeStats";
import GLP1MetabolismSection from "@/components/GLP1Offer/GLP1MetabolismSection";
import GLP1WhyItWorks from "@/components/GLP1Offer/GLP1WhyItWorks";
import GLP1ThreeStepProcess from "@/components/GLP1Offer/GLP1ThreeStepProcess";
import GLP1SupportSection from "@/components/GLP1Offer/GLP1SupportSection";
import GLP1ExtendedTestimonials from "@/components/GLP1Offer/GLP1ExtendedTestimonials";
import GLP1FaqsSection from "@/components/GLP1Offer/GLP1FaqsSection";
import GLP1MoneyBackCTA from "@/components/GLP1Offer/GLP1MoneyBackCTA";
import GLP1GoalSelector from "@/components/GLP1Offer/GLP1GoalSelector";
import GLP1SafetyDisclaimer from "@/components/GLP1Offer/GLP1SafetyDisclaimer";
import RockyInTheNews from "@/components/RockyInTheNews";

export const metadata = {
  title: "GLP-1 Weight Loss Program | MyRocky",
  description:
    "Lose 1-2lbs per week with GLP-1 medication. 100% online medical review, free delivery, and money-back guarantee. Starting at $149/mo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GLP1OfferHeroPage() {
  const ctaHref = "/wl-pre-consultation-2";

  return (
    <main>
      {/* Promo banner + custom header (replaces global Navbar) — same as glp2-offer-hero */}
      <Glp2OfferPromoBar />
      <Glp2OfferHeader ctaHref={ctaHref} />

      {/* 1. Hero Section */}
      <section className="bg-[#F4F3EF]">
        <GLP1HeroSection ctaHref={ctaHref} hideProudPartner />
      </section>

      {/* MyRocky In The News */}
      <Section bg="bg-white !pb-0">
        <RockyInTheNews />
      </Section>

      {/* 2. Product Tiers — "Trusted by experts, priced for you" */}
      <Section bg="bg-white pt-10 md:pt-12">
        <GLP1ProductTiers ctaHref={ctaHref} />
      </Section>

      {/* 3. "The results speak for themselves" — split layout */}
      <Section>
        <GLP1StatsSection ctaHref={ctaHref} />
      </Section>

      {/* 4. Testimonials Showcase — "350,000+ Patients Agree" */}
      <Section>
        <GLP1TestimonialsShowcase />
      </Section>

      {/* 5. Weight Loss Calculator */}
      <Section bg="bg-white">
        <GLP1WeightCalculator ctaHref={ctaHref} />
      </Section>

      {/* 6. "The change we've all been waiting for" — 3 stats */}
      <Section>
        <GLP1ChangeStats />
      </Section>

      {/* 7. "We will fix your broken metabolism" */}
      <Section bg="bg-white">
        <GLP1MetabolismSection ctaHref={ctaHref} />
      </Section>

      {/* 8. "Why are so many patients signing up? It works." */}
      <Section>
        <GLP1WhyItWorks />
      </Section>

      {/* 9. 3-Step Process — vertical timeline */}
      <Section bg="bg-white">
        <GLP1ThreeStepProcess ctaHref={ctaHref} />
      </Section>

      {/* 10. "Unlimited 24/7 support included" */}
      <Section>
        <GLP1SupportSection />
      </Section>

      {/* 11. Extended Testimonials — "There's a reason people are raving" */}
      <Section bg="bg-white">
        <GLP1ExtendedTestimonials />
      </Section>

      {/* 12. FAQ */}
      <Section>
        <GLP1FaqsSection />
      </Section>

      {/* 13. Money-Back Guarantee */}
      <GLP1MoneyBackCTA ctaHref={ctaHref} />

      {/* 14. "What's your weight loss goal?" + Trust Badges */}
      <Section bg="bg-white">
        <GLP1GoalSelector ctaHref={ctaHref} />
      </Section>

      {/* 15. Safety Disclaimer */}
      <GLP1SafetyDisclaimer />
    </main>
  );
}
