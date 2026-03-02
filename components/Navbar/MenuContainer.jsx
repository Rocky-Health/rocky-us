import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";
import TreatmentDetail from "./TreatmentDetail";
import Link from "next/link";
import CustomImage from "../utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";
import SearchIcon from "./SearchIcon";

const MenuContainer = ({
  menuItems,
  selectedTreatment,
  setSelectedTreatment,
  selectedTab,
  setSelectedTab,
  onClose,
  userData,
  menuScrollRef,
}) => {
  const [tabVisible, setTabVisible] = useState(true);
  const [treatmentVisible, setTreatmentVisible] = useState(false); // State for TreatmentDetail visibility

  useEffect(() => {
    setTabVisible(true);
    // Sync treatment visibility with selectedTreatment
    if (selectedTreatment) {
      setTimeout(() => setTreatmentVisible(true), 50); // Delay for slide-in
    } else {
      setTreatmentVisible(false);
    }
  }, [selectedTreatment]);

  // Smooth scroll to top when selectedTreatment changes
  useEffect(() => {
    if (menuScrollRef.current && treatmentVisible) {
      menuScrollRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [treatmentVisible, menuScrollRef]);

  // Most Popular Treatments: first 3 from menuItems
  const mostPopular = menuItems.slice(0, 3);
  // Medications: gather all, flatten, and dedupe for 'Most Popular'
  const standardMeds = menuItems.flatMap((t) => t.medications || []);
  // Add ZONNIC & DHM Blend from treatments if they exist
  const extraMeds = menuItems.flatMap((item) => {
    if (item.category === "Smoking Cessation" || item.category === "Recovery") {
      return item.treatments || [];
    }
    return [];
  });
  logger.log("extraMeds", extraMeds);
  const allMedications = [...standardMeds, ...extraMeds];
  logger.log("allMedications", allMedications);

  const mostPopularMeds = allMedications.filter(
    (med) => med.type === "most-popular"
  );
  // Supplements: gather all, flatten
  const allSupplements = menuItems.flatMap((t) => t.supplements || []);
  // Footer links
  const meetRockyLinks = [
    { text: "About Us", link: "/about-us" },
    { text: "Contact Us", link: "/contact-us" },
    { text: "Reviews", link: "/reviews" },
    { text: "Blogs", link: "/blog" },
  ];

  const renderTabContent = () => {
    if (selectedTab === "Treatments") {
      return (
        <ul
          className={`px-2 bg-white py-4 mb-3 transition-opacity duration-300 ease-in-out ${
            tabVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.link ? (
                <Link
                  href={item.link}
                  onClick={onClose}
                  className="w-full text-left px-[16px] md:px-[32px] py-4 md:py-[24px] rounded hover:bg-[#F5F4EF] hover:rounded-[16px] 
                  flex items-center justify-between"
                >
                  <span className="font-medium text-base md:text-xl tracking-normal align-middle">
                    {item.category}
                  </span>
                  <FaArrowRight />
                </Link>
              ) : (
                <button
                  onClick={() => setSelectedTreatment(item)}
                  className="w-full text-left px-[16px] md:px-[32px] py-4 md:py-[24px] rounded hover:bg-[#F5F4EF] hover:rounded-[16px] 
                  flex items-center justify-between"
                >
                  <span className="font-medium text-base md:text-xl tracking-normal align-middle">
                    {item.category}
                  </span>
                  <FaArrowRight />
                </button>
              )}
            </li>
          ))}
        </ul>
      );
    }
    if (selectedTab === "Medications") {
      return (
        <div
          className={`px-2 bg-white py-4 mb-3 transition-opacity duration-300 ease-in-out ${
            tabVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="mb-2">
            <span className="px-[16px] md:px-[32px] font-medium text-xs tracking-normal align-middle uppercase text-[#00000099]">
              Most Popular
            </span>
            <ul>
              {mostPopularMeds.map((med, i) => (
                <li key={i}>
                  <Link
                    href={med.link}
                    onClick={onClose}
                    className="px-[16px] md:px-[32px] flex items-center gap-2 py-4 rounded-[16px] hover:bg-[#F5F4EF] text-sm font-medium"
                  >
                    {med.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <span className="px-[16px] md:px-[32px] font-medium text-xs tracking-normal align-middle uppercase text-[#00000099]">
            All
          </span>
          <ul className="mt-1">
            {allMedications.map((med, i) => (
              <li key={i}>
                <Link
                  href={med.link}
                  onClick={onClose}
                  className="px-[16px] md:px-[32px] flex items-center gap-2 py-4 rounded-[16px] hover:bg-[#F5F4EF] text-sm font-medium"
                >
                  {med.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    if (selectedTab === "Supplements") {
      return (
        <ul
          className={`px-2 bg-white py-4 mb-3 transition-opacity duration-300 ease-in-out ${
            tabVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {menuItems.map((item, idx) =>
            item.supplements && item.supplements.length > 0 ? (
              <div key={idx}>
                {item.supplements.map((sup, i) => (
                  <li key={i}>
                    <Link
                      href={sup.link}
                      onClick={onClose}
                      className="px-[16px] md:px-[32px] flex items-center gap-2 py-4 rounded-[16px] hover:bg-[#F5F4EF] text-sm font-medium"
                    >
                      {sup.text}
                    </Link>
                  </li>
                ))}
              </div>
            ) : null
          )}
        </ul>
      );
    }
  };

  const renderMainContent = () => (
    <>
      {/* Most Popular Treatments */}
      <div className="py-4 mb-2  bg-white px-2">
        <div className=" bg-white pb-6 px-[16px] md:px-[32px]">
          {/* <SearchIcon onClose={onClose} /> */}
        </div>
        <h3 className="px-[16px] md:px-[32px] text-[#00000099] mb-4 uppercase font-medium text-xs md:text-sm tracking-normal align-middle">
          Most Popular Treatments
        </h3>
        <ul className="space-y-4 py-4">
          {mostPopular.map((item, index) => (
            <li
              key={index}
              className="flex items-center justify-between cursor-pointer px-[16px] md:px-[32px] hover:bg-[#F5F4EF] hover:rounded-[16px]"
              onClick={() => setSelectedTreatment(item)}
            >
              <div className="flex flex-col gap-2">
                <p className="font-medium text-base md:text-xl tracking-normal align-middle leading-[115%]">
                  {item.category}
                </p>
                <p className="text-[#00000080] font-normal text-sm md:text-base tracking-normal align-middle leading-[140%]">
                  {item.description}
                </p>
              </div>
              <div className="relative overflow-hidden rounded-[16px] w-[64px] h-[64px] md:w-[80px] md:h-[80px]">
                <CustomImage src={item.image} alt={item.category} fill />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Tabs */}
      <div className="flex gap-[24px] pt-4 px-[24px] md:px-10 bg-white relative">
        <div className="absolute bottom-0 left-[24px] md:left-10 w-[calc(100%-48px)] md:w-[420px] h-[1px] bg-[#E2E2E1]"></div>
        {["Treatments", "Medications"].map((tab) => (
          <button
            key={tab}
            className={`py-4 transition-colors duration-150 font-medium text-xs md:text-sm tracking-normal align-middle z-10 uppercase ${
              selectedTab === tab
                ? "border-b-2 border-black text-black"
                : "text-[#00000099]"
            }`}
            onClick={() => {
              setTabVisible(false);
              setTimeout(() => {
                setSelectedTab(tab);
                setSelectedTreatment(null);
                setTabVisible(true);
              }, 300);
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Footer */}
      <div className="pt-4 pb-10 px-2 bg-white">
        <p className="font-medium px-[16px] md:px-[32px] text-xs md:text-sm tracking-normal align-middle uppercase py-4 text-[#00000099]">
          Meet MyRocky
        </p>
        <ul>
          {meetRockyLinks.map((item, idx) => (
            <li key={idx}>
              <Link
                prefetch={true}
                onClick={onClose}
                href={item.link}
                className="
                  w-full text-left px-[16px] md:px-[32px] py-4 md:py-[24px] rounded hover:bg-[#F5F4EF] hover:rounded-[16px]   
                  flex items-center justify-between text-black font-medium text-base md:text-xl tracking-normal align-middle
                "
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-full relative">
      <div
        ref={menuScrollRef}
        className="flex-1 relative overflow-y-auto overflow-x-hidden touch-pan-y"
      >
        {/* Main Menu Content with Slide Animation */}
        <div
          className={`
            absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out transform overflow-x-hidden
            ${selectedTreatment ? "translate-x-[-100%]" : "translate-x-0"}
          `}
        >
          {renderMainContent()}
        </div>

        {/* TreatmentDetail with Slide Animation */}
        {selectedTreatment && (
          <div
            className={`
              absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out transform overflow-x-hidden
              ${treatmentVisible ? "translate-x-0" : "translate-x-full"}
            `}
          >
            <TreatmentDetail
              treatment={selectedTreatment}
              onBack={() => {
                setTreatmentVisible(false);
                setTimeout(() => setSelectedTreatment(null), 500); // Delay to allow slide-out
              }}
              onClose={onClose}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuContainer;
