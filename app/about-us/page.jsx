"use client";

import Goal from "@/components/AboutUS/Goal";
import MemberContainer from "@/components/AboutUS/MemberContainer";
import Mission from "@/components/AboutUS/Mission";
import OurTeamBrief from "@/components/AboutUS/OurTeamBrief";
import TeamContainer from "@/components/AboutUS/TeamContainer";
import HomeFaqsSection from "@/components/HomePage/HomeFaqsSection";
import Section from "@/components/utils/Section";
import { useRef, useState, useEffect } from "react";

const leadershipTeam = [
  {
    name: "Dr. George Mankaryous",
    title: "M.D. CCFP",
    subtitle: "Chief Medical Officer",
    description:
      "Dr. Mankaryous is a licensed family doctor in both Canada and the UK, with a strong commitment to evidence-based medicine. He empowers patients by providing them with the information needed to make informed decisions about their health. Integrating a functional medicine approach, Dr. Mankaryous focuses on identifying and addressing the root causes of disease, offering a comprehensive and personalized care experience. His blend of scientific rigor and holistic care makes him a valuable asset to our leadership team.",
    imageSrc: "https://myrocky.b-cdn.net/team-members/george.jpg",
    CoverImage:
      "https://myrocky.b-cdn.net/team-members/DrGeorgeMankaryous.webp",
    index: 0,
  },
  {
    name: "Mina Rizk",
    title: "R.Ph. MPharm",
    subtitle: "Chief Operating Officer",
    description:
      "Mina is a licensed pharmacist in Ontario and British Columbia, with a Master’s degree in Pharmacy from the UK. He has extensive experience in community pharmacy, including owning and operating several pharmacies in Ontario. His background in both managing pharmacies and providing patient care brings a comprehensive understanding of the healthcare landscape, making him well-versed in the healthcare space and a valuable asset to our leadership team.",
    imageSrc: "https://myrocky.b-cdn.net/team-members/mina-rizk.png",
    CoverImage: "https://myrocky.b-cdn.net/team-members/MinaRizk.webp",
  },
  {
    name: "Aba Anton",
    title: "MPharm",
    subtitle: "Chief Executive Officer",
    description:
      "Aba earned his Master’s degree in Pharmacy from the UK and gained valuable experience which leverages his entrepreneurial background to drive innovation in healthcare. Focused on modernizing outdated practices, Aba is dedicated to bridging the gap between patient needs and accessibility. His commitment to improving healthcare delivery through strategic advancements makes him a valuable addition to our leadership team.",
    imageSrc: "https://myrocky.b-cdn.net/team-members/aba-aanton.jpg",
    CoverImage: "https://myrocky.b-cdn.net/team-members/AbaAnton.webp",
  },
];

const medicalTeam = [
  {
    name: "Dr. Mena Mirhom",
    title: "M.D. FAPA",
    image: "https://myrocky.b-cdn.net/team-members/Mena-Mirhom.webp",
    description:
      "Dr. Mirhom is a Columbia-trained, board-certified psychiatrist. He is an Assistant Professor of Psychiatry in Columbia University. He completed his adult psychiatry training in the Mount Sinai Health System and his fellowship in Columbia University Medical Center. He currently teaches public psychiatry fellows in Columbia University and is a renowned national speaker on mental health and wellness. He is also a consultant for the NBPA (National Basketball Player Association) to assist NBA players and staff with mental health needs.",
  },
  // {
  //   name: "Corey Wideman",
  //   title: "Nurse Practitioner",
  //   image: "https://myrocky.b-cdn.net/team-members/corey.webp",
  //   description:
  //     "Corey graduated from the Master of Nursing program at the University of Toronto in 2020. Since then, he has worked in community-based clinics where he provides primary healthcare services. He is passionate about improving healthcare accessibility by leveraging technology to provide care through virtual platforms.",
  // },
  // {
  //   name: "Tawanda Nyamukondiwa",
  //   title: "Nurse Practitioner",
  //   image: "https://myrocky.b-cdn.net/team-members/Tawanda.webp",
  //   description:
  //     "Tawanda Nyamukondiwa is a seasoned Nurse Practitioner with extensive experience and specialization in family medicine, health promotion, and occupational health. He is dedicated to delivering patient-centered care and is passionate about making a positive impact in patients' lives through a personal approach. By leveraging his diverse skills and rich experience, Tawanda ensures comprehensive care for patients of all ages.",
  // },
  // {
  //   name: "Josh Belanger",
  //   title: "Nurse Practitioner",
  //   image: "https://myrocky.b-cdn.net/team-members/johua_square_dark.webp",
  //   description:
  //     "Josh Belanger is a dedicated Primary Care Nurse Practitioner who specializes in providing comprehensive healthcare at a nurse practitioner-led clinic. In addition to his primary care duties, he offers vital support to rural Emergency Rooms, delivering critical care to patients with varying acuity levels. With over a decade of experience in emergency room and cardiac cath lab settings as a Registered Nurse, Josh is deeply committed to enhancing primary care accessibility and championing wellness initiatives by addressing systemic and social barriers.",
  // },
  // {
  //   name: "Pamela Bridgen",
  //   title: "Nurse Practitioner",
  //   image: "https://myrocky.b-cdn.net/team-members/pamela.webp",
  //   description:
  //     "Pamela Bridgen is a seasoned Nurse Practitioner with 15 years of experience in primary care, specializing in medical weight loss. Combining clinical expertise with compassionate care, she empowers patients to achieve their health goals through tailored treatment plans and lifestyle modifications. Her dedication to improving patient well-being extends beyond medical intervention, fostering long-term wellness and sustainable habits.",
  // },
  // {
  //   name: "Annivy",
  //   title: "Nurse Practitioner",
  //   image: "https://myrocky.b-cdn.net/team-members/annivy.jpeg",
  //   description: "...",
  // },
];

const pharmaceuticalTeam = [
  {
    name: "Matthew Michael",
    title: "R.Ph. PharmD MBA",
    image: "https://myrocky.b-cdn.net/team-members/matthew.webp",
    description:
      "Matthew earned a Doctor of Pharmacy and MBA in Healthcare Management from Boston. He is a licensed pharmacist in Ontario. His background in corporate and community pharmacy and healthcare administration brings a unique blend of expertise to our team. His dedication to innovative healthcare solutions along with his management skills & expertise continue to drive our mission forward.",
  },
  {
    name: "Mariam Mirhom",
    title: "R.Ph. PharmD",
    image: "https://myrocky.b-cdn.net/team-members/Mariam_dark.webp",
    description:
      "Mariam is a Doctorate of Pharmacy Graduate minoring in Pharmaceutical Sales & Marketing. She has worked closely with patients in several hospitals including DENT Neurology, Rochester General, & Albany Medical Centre. Mariam continues her work in pharmaceutical research while simultaneously providing the best possible healthcare for her patients.",
  },
  {
    name: "Perihan Koussa",
    title: "R.Ph. PharmD",
    image: "https://myrocky.b-cdn.net/team-members/Peri.webp",
    description:
      "Peri graduated with a Doctorate of Pharmacy from MCPHS University in Boston. She is licensed in Ontario and practices as a retail pharmacist. She is passionate about mental health and volunteers weekly at the Center for Addiction and Mental Health (CAMH) in Toronto. She also has startup experience interning at PillPack. Peri brings forth extensive knowledge in various areas of pharmacy.",
  },
  // {
  //   name: "Mario Saad",
  //   title: "Fulfilment Coordinator",
  //   image: "https://myrocky.b-cdn.net/team-members/mario.webp",
  //   description:
  //     "Mario is our Fulfillment Coordinator, bringing a keen eye for detail and a commitment to efficiency from his background in police college. With a strong foundation in organization and logistics, he ensures that our telehealth services are delivered seamlessly to our clients. His unique perspective helps our team maintain the highest standards of service and reliability.",
  // },
  // {
  //   name: "Roudy Abdelsalam",
  //   title: "Logistics & Marketing Coordinator",
  //   image: "https://myrocky.b-cdn.net/team-members/Roudy.webp",
  //   description:
  //     "Roudy excels as a Logistics and Marketing Coordinator, merging her advertising and marketing experience with strong organizational skills. Her market insight and consumer knowledge help her create effective promotional strategies, while her logistical expertise ensures smooth operations. By blending creative marketing with efficient logistics, Roudy enhances brand visibility and optimizes workflows, driving success and growth.",
  // },
];

export default function AboutUs() {
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
      const estimatedIndex = Math.round(percentageScrolled * (cardCount - 1));

      setActiveIndex(estimatedIndex);
    };

    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

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
