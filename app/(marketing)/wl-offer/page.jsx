import React from 'react'
import Section from '@/components/utils/Section'
import WlFaqsSection from '@/components/BodyOptimization/WlFaqsSection'
import MoneyBack from '@/components/WlOffer/MoneyBack'  
import DoctorTrustedSolutions from '@/components/WlOffer/DoctorTrustedSolutions'
import NewWlProducts from '@/components/WlOffer/NewWlProducts'
import UnmatchedResults from '@/components/WlOffer/UnmatchedResults'
import ExclusiveFeatures from '@/components/WlOffer/ExclusiveFeatures'
import MemberResults from '@/components/WlOffer/MemberResults'
import ComprehensiveProgram from '@/components/WlOffer/ComprehensiveProgram'
import KeyFeatures from '@/components/WlOffer/KeyFeatures'
import HowItWorks from '@/components/WlOffer/HowItWorks'
import WlOfferHero from '@/components/WlOffer/WlOfferHero'


const page = () => {
  const consultationHref = "/wl-offer-pre-consultation/";
  return (
      <main>
          <WlOfferHero consultationHref={consultationHref} />
          <Section bg={"  md:pt-[96px] border-b border-[rgba(216,216,215,1)]"}>
        <NewWlProducts CardBtnColor="bg-[forestgreen]" consultationHref={consultationHref} />
      </Section>
      <Section bg={"pb-[0px] md:pb-[20px] "}>
        <ComprehensiveProgram consultationHref={consultationHref} />
      </Section>
      <section className="bg-[#F0EEEA] py-14 md:py-24 w-full overflow-hidden">
        <MemberResults consultationHref={consultationHref} />
      </section>
      <Section >
        <ExclusiveFeatures />
      </Section>
    
      
      <Section bg={"bg-[#F0EEEA]"}>
        <UnmatchedResults consultationHref={consultationHref} />
      </Section>
      <Section>
        <DoctorTrustedSolutions />
      </Section>
      
      <Section bg={"bg-[#F0EEEA]"}>
        <HowItWorks consultationHref={consultationHref} />
      </Section>
      <Section bg={"bg-[#F0EEEA]"}>
        <MoneyBack />
      </Section>
          <Section>
        <WlFaqsSection moreQTitle="Convenient, researched, trusted." />
      </Section>

      <section className="bg-[#F0EEEA] ">
        <KeyFeatures />
      </section>
     
    </main>
  )
}

export default page
