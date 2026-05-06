"use client";
import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";

import { IoClose } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import SearchIcon from "./SearchIcon";
import MenuContainer from "./MenuContainer";
import NavHeader from "./NavHeader";

const Navlinks = ({ menuItems, userData, token, nameToShow }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [selectedTab, setSelectedTab] = useState("Treatments");
    const [selectedTreatment, setSelectedTreatment] = useState(null);
    const menuScrollRef = useRef(null);

    // Reset menu state when component mounts (new page navigation)
    useEffect(() => {
        setSelectedTab("Treatments");
        setSelectedTreatment(null);
    }, []);

    const handleToggle = () => {
        if (isOpen) {
            setMenuVisible(false);
            setTimeout(() => {
                setIsOpen(false);
                // Reset menu state when closing
                setSelectedTab("Treatments");
                setSelectedTreatment(null);
            }, 500);
        } else {
            setIsOpen(true);
            setTimeout(() => setMenuVisible(true), 50);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";

            logger.log(document.body.style.overflow);
        } else {
            // Clear inline overflow so the document uses normal scrolling. Setting
            // "auto" here was switching the scroll container and breaking position:sticky
            // on headers after closing the menu (e.g. minimal-layout landing pages).
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";

            logger.log(document.body.style.overflow);
        }
        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <div className="items-center gap-[24px] z-50 relative">
            <button
                onClick={handleToggle}
                className="text-black focus:outline-none z-50"
                aria-label="Toggle menu"
            >
                {isOpen ? <IoClose size={24} /> : <GiHamburgerMenu size={24} />}
            </button>
            {isOpen && (
                <>
                    <div
                        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-500 ease-in-out will-change-transform
               ${
                   isOpen
                       ? menuVisible
                           ? "opacity-100 visible"
                           : "opacity-0"
                       : "opacity-0 invisible"
               }`}
                        onClick={handleToggle}
                    ></div>
                    <div
                        className={`
              fixed top-0 right-0 w-full h-full md:w-[520px] bg-white shadow-lg z-50
              transition-transform duration-500 ease-in-out transform
              ${
                  isOpen
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
                                token={token}
                                nameToShow={nameToShow}
                                setSelectedTreatment={setSelectedTreatment}
                            />
                            {/* Only show search and popular treatments if not in detail view */}

                            {/* Pass selectedTreatment and setSelectedTreatment to MenuContainer */}
                            <MenuContainer
                                menuItems={menuItems}
                                onClose={handleToggle}
                                selectedTreatment={selectedTreatment}
                                setSelectedTreatment={setSelectedTreatment}
                                selectedTab={selectedTab}
                                setSelectedTab={setSelectedTab}
                                userData={userData}
                                menuScrollRef={menuScrollRef}
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Navlinks;
