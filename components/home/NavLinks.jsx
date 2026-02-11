"use client";
import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";

import { IoClose } from "react-icons/io5";
import { GiHamburgerMenu } from "react-icons/gi";
import MenuContainer from "@/components/Navbar/MenuContainer";
import NavHeader from "@/components/Navbar/NavHeader";
import { CiSearch } from "react-icons/ci";
import Link from "next/link";
import CartIcon from "@/components/Navbar/CartIcon";
import { IoIosCart } from "react-icons/io";

const Navlinks = ({ menuItems, userData, token, nameToShow, isOpen, setIsOpen }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Treatments");
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const menuScrollRef = useRef(null);

  // Reset menu state when component mounts (new page navigation)
  useEffect(() => {
    setSelectedTab("Treatments");
    setSelectedTreatment(null);
  }, []);

  // Sync menuVisible with isOpen prop
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setMenuVisible(true), 50);
    } else {
      setMenuVisible(false);
    }
  }, [isOpen]);

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
    }
  };

  

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      logger.log(document.body.style.overflow);
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";

      logger.log(document.body.style.overflow);
    }
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <div className="items-center gap-[24px] z-[1000] relative">
      <div className="flex gap-0 md:gap-2 ">
        <Link
          href="/cart"
          className="flex justify-center items-center px-4 py-2 rounded-full focus:outline-none z-50"
          aria-label="Cart"
        >
          <IoIosCart size={24} />
        </Link>
        <Link
          href="/login-register?viewshow=login"
          className="bg-white text-black flex justify-center items-center gap-2 px-6 md:px-8 py-2 rounded-full focus:outline-none z-50 border-solid border-[1px] border-[#E2E2E1]"
          aria-label="Toggle menu"
        >
          {/* {isOpen ? <IoClose size={24} /> : <GiHamburgerMenu size={24} />} */}
          Login
        </Link>
        <button
          onClick={handleToggle}
          className="bg-black hidden md:flex text-white  justify-center items-center gap-2 px-8 py-2 rounded-full focus:outline-none z-50"
          aria-label="Toggle menu"
        >
          {/* {isOpen ? <IoClose size={24} /> : <GiHamburgerMenu size={24} />} */}
          <CiSearch /> Find My Treatment
        </button>
        <button
          onClick={handleToggle}
          className="bg-white text-black flex justify-center items-center gap-2 px-4 py-2 rounded-full focus:outline-none z-50 md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <IoClose size={24} /> : <GiHamburgerMenu size={24} />}
        </button>
      </div>

      {isOpen && (
        <>
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-[999] transition-opacity duration-500 ease-in-out will-change-transform
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
              fixed top-0 right-0 w-full h-full md:w-[520px] bg-white shadow-lg z-[1000]
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
