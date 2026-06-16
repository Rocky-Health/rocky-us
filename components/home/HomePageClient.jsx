"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

import HeroSection from "@/components/home/HeroSection";
import Section from "@/components/utils/Section";

import HowRockyWorks from "./HowRockyWorks";
import DoctorTrustedSolutions from "./DoctorTrustedSolutions";
import MenuContainer from "@/components/Navbar/MenuContainer";
import NavHeader from "@/components/Navbar/NavHeader";

import MoreQuestions from "./MoreQuestions";
import RockyInTheNews from "@/components/BodyOptimization/bo3/NewRockyInTheNews";

// Below-fold sections — split into separate JS chunks loaded after initial paint.
// Placeholders reserve approximate vertical space to keep CLS near zero.
const Placeholder = ({ minHeight }) => (
  <div aria-hidden="true" style={{ minHeight }} />
);
const ReviewsSection = dynamic(() => import("./ReviewsSection"), {
  loading: () => <Placeholder minHeight="640px" />,
});
const TeamSection = dynamic(() => import("@/components/TeamSection"), {
  loading: () => <Placeholder minHeight="520px" />,
});
const RockyBlog = dynamic(() => import("@/components/RockyBlog"), {
  loading: () => <Placeholder minHeight="365px" />,
});
const FaqsSection = dynamic(() => import("./FaqsSection"), {
  loading: () => <Placeholder minHeight="480px" />,
});

// Resolve the menu greeting from cookies on the client. Was read via cookies()
// in app/page.jsx, which forced the homepage dynamic. Cookies are not httpOnly
// and the menu only opens after hydration → behavior-identical, page now static.
const readUserFromCookies = () => {
  const get = (key) => {
    const m = document.cookie.match(new RegExp("(?:^|; )" + key + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : undefined;
  };
  const displayName = get("displayName");
  const userName = get("userName");
  const userEmail = get("userEmail");
  let nameToShow;
  if (displayName) nameToShow = displayName;
  else if (userName) nameToShow = userName.split(" ")[0];
  else if (userEmail)
    nameToShow =
      userEmail.length > 15 ? userEmail.substring(0, 12) + "..." : userEmail;
  else nameToShow = "Guest";
  return { token: get("authToken"), nameToShow };
};

const HomePageClient = ({ menuItems, faqs }) => {
  const [user, setUser] = useState({ token: undefined, nameToShow: "Guest" });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Treatments");
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const menuScrollRef = useRef(null);

  const handleToggle = () => {
    if (isMenuOpen) {
      setMenuVisible(false);
      setTimeout(() => {
        setIsMenuOpen(false);
        setSelectedTab("Treatments");
        setSelectedTreatment(null);
      }, 500);
    } else {
      setIsMenuOpen(true);
      setTimeout(() => setMenuVisible(true), 50);
    }
  };

  useEffect(() => {
    setUser(readUserFromCookies());
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const howRockyWorksCards = [
    {
      image: "/home/01.webp",
    },
    {
      image: "/home/5.webp",
    },
    {
      image: "/home/4.webp",
    },
  ];

  return (
    <>
      <HeroSection onOpenMenu={handleToggle} />

      {/* Menu Overlay */}
      {isMenuOpen && (
        <>
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-[10000] transition-opacity duration-500 ease-in-out will-change-transform
               opacity-100 visible
               ${
                 isMenuOpen
                   ? menuVisible
                     ? "opacity-100 visible"
                     : "opacity-0"
                   : "opacity-0 invisible"
               }`}
            onClick={handleToggle}
          ></div>
          <div
            className={`
              fixed top-0 right-0 w-full h-full md:w-[520px] bg-white shadow-lg z-[10001]
              transition-transform duration-500 ease-in-out transform
              ${
                isMenuOpen
                  ? menuVisible
                    ? "translate-x-0"
                    : "translate-x-full"
                  : "translate-x-full"
              }
            `}
          >
            <div className="h-full flex flex-col ">
              <NavHeader
                menuScrollRef={menuScrollRef}
                selectedTreatment={selectedTreatment}
                handleToggle={handleToggle}
                token={user.token}
                nameToShow={user.nameToShow}
                setSelectedTreatment={setSelectedTreatment}
              />
              <MenuContainer
                menuItems={menuItems}
                onClose={handleToggle}
                selectedTreatment={selectedTreatment}
                setSelectedTreatment={setSelectedTreatment}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                userData={null}
                menuScrollRef={menuScrollRef}
              />
            </div>
          </div>
        </>
      )}

      <Section bg={"bg-[#F5F4EF]"}>
        <HowRockyWorks cards={howRockyWorksCards} />
      </Section>

      <Section>
        <DoctorTrustedSolutions />
      </Section>
      <RockyInTheNews />
      <Section bg={"bg-[#F5F4EF]"}>
        <ReviewsSection />
      </Section>
      <Section>
        <TeamSection />
      </Section>
      <RockyBlog />
      <Section>
        <FaqsSection
          faqs={faqs}
          blackText="Your Questions,"
          accentText="Answered"
          subtitle="Frequently asked questions"
        />
        <div className="showElement">
          <MoreQuestions
            bg="bg-[#F0EEEA] !w-[100%]"
            buttonWidth="md:w-[172px] w-[100%]"
            link="/faqs/"
          />
        </div>
      </Section>
    </>
  );
};

export default HomePageClient;
