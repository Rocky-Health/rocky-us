"use client";
import { useState } from "react";
import { logger } from "@/utils/devLogger";
import Link from "next/link";
import Script from "next/script";
import CustomContainImage from "../utils/CustomContainImage";
import CustomImage from "../utils/CustomImage";
import { FaCircleExclamation, FaFacebookF } from "react-icons/fa6";
import { FaCheckCircle, FaInstagram, FaTwitter } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";

const products = [
    { href: "/product/sildenafil-viagra/", text: "Sildenafil" },
    { href: "/product/tadalafil-cialis/", text: "Tadalafil" },
    { href: "/product/finasteride-minoxidil-topical-foam/", text: "Hair Foam" },
    { href: "/product/ozempic/", text: "Ozempic" },
    // { href: "/product/testosterone-support/", text: "Testosterone Support" },
    // { href: "/product/lidocaine-spray/", text: "Lido Spray" },
];

const Footer = ({ className }) => {
    const [isProductsOpen, setIsProductsOpen] = useState(false);
    const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isLocationsOpen, setIsLocationsOpen] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [overlayMessage, setOverlayMessage] = useState(null);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        logger.log("Email:", email);
        if (!email) {
            setOverlayMessage({
                type: "error",
                text: "Please enter an email address",
            });
            return;
        }

        setIsLoading(true);
        setOverlayMessage(null);

        try {
            const response = await fetch(`/api/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            logger.log("Response data:", data);

            if (response.ok && data.success) {
                setIsSubscribed(true);
                setOverlayMessage({
                    type: "success",
                    text: "Thank you for subscribing!",
                });
                e.target.reset();
            } else {
                // Customize message for specific Attentive error
                const errorText = data.error.includes("No valid creative found")
                    ? "Subscription is currently unavailable. Please try again later."
                    : data.error || "Subscription failed. Please try again.";
                setOverlayMessage({ type: "error", text: errorText });
            }
        } catch (error) {
            logger.error("Subscription error:", error);
            setOverlayMessage({
                type: "error",
                text: "An error occurred. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const closeOverlay = () => {
        setOverlayMessage(null);
    };

    return (
        <>
            <footer
                className={`bg-black text-[#efe7df] p-4 ${className || ""} footer-main`}
            >
                <div className="max-w-[600px] mx-auto">
                    {/* Logo */}
                    <div className="mx-auto relative rounded-2xl overflow-hidden w-[150px] h-[50px] flex justify-center mt-8 mb-4">
                        <CustomImage
                            src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-white.webp"
                            alt="Rocky Logo"
                            fill
                        />
                    </div>

                    {/* Popular Products */}
                    <p
                        className="text-lg cursor-pointer flex items-center justify-between px-4 py-2 relative"
                        onClick={() => setIsProductsOpen(!isProductsOpen)}
                    >
                        Popular Products
                        <span
                            className={`inline-block w-3.5 h-3.5 ml-2 transform transition-transform ${
                                isProductsOpen ? "rotate-180" : ""
                            }`}
                        >
                            <IoIosArrowDown />
                        </span>
                    </p>
                    <div
                        className={`flex flex-col gap-4 px-4 pb-4 border-b-2 border-[#faebd724] ${
                            isProductsOpen ? "block" : "hidden"
                        }`}
                    >
                        {products.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="pl-4 hover:underline"
                                prefetch={true}
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>

                    {/* Learn More */}
                    <p
                        className="text-lg cursor-pointer flex items-center justify-between px-4 py-2 mt-4 relative"
                        onClick={() => setIsLearnMoreOpen(!isLearnMoreOpen)}
                    >
                        Learn More
                        <span
                            className={`inline-block w-3.5 h-3.5 ml-2 transform transition-transform ${
                                isLearnMoreOpen ? "rotate-180" : ""
                            }`}
                        >
                            <IoIosArrowDown />
                        </span>
                    </p>
                    <div
                        className={`flex flex-wrap justify-between gap-4 px-4 pb-4 border-b-2 border-[#faebd724] ${
                            isLearnMoreOpen ? "block" : "hidden"
                        }`}
                    >
                        {[
                            { href: "/how-it-works/", text: "How It Works" },
                            { href: "/faqs/", text: "FAQs" },
                            { href: "/product-faq/", text: "Product FAQs" },
                            { href: "/about-us/", text: "About Us" },
                            { href: "/blog/", text: "Blog" },
                            // { href: "/podcast/", text: "Podcast" },
                            // { href: "/blog/category/hair-loss", text: "Hair Loss" },
                            // { href: "/blog/category/lifestyle", text: "Lifestyle" },
                            // { href: "/blog/category/mental-health", text: "Mental Health" },
                            // { href: "/blog/category/sexual-health", text: "Sexual Health" },
                            // { href: "/blog/category/weight-loss", text: "Weight Loss" },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="hover:underline min-w-fit"
                                prefetch={true}
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>

                    {/* Contact */}
                    <p
                        className="text-lg cursor-pointer flex items-center justify-between px-4 py-2 mt-4 relative"
                        onClick={() => setIsContactOpen(!isContactOpen)}
                    >
                        Contact
                        <span
                            className={`inline-block w-3.5 h-3.5 ml-2 transform transition-transform ${
                                isContactOpen ? "rotate-180" : ""
                            }`}
                        >
                            <IoIosArrowDown />
                        </span>
                    </p>
                    <div
                        className={`flex flex-wrap justify-between gap-4 px-4 pb-4 border-b-2 border-[#faebd724] ${
                            isContactOpen ? "block" : "hidden"
                        }`}
                    >
                        {[
                            { href: "/contact-us/", text: "Contact Us" },
                            {
                                href: "/terms-of-use/",
                                text: "Terms & Conditions",
                            },
                            {
                                href: "/privacy-policy/",
                                text: "Privacy Policy",
                            },
                            {
                                href: "/service-coverage/",
                                text: "Service Coverage",
                            },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="hover:underline min-w-fit"
                                prefetch={true}
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>

                    {/* Subscription Form */}
                    <form
                        onSubmit={handleSubscribe}
                        className="flex justify-center items-center w-full mt-4"
                    >
                        <div className="relative w-full max-w-[300px]">
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                className="border border-[#814b00] bg-black text-[#efe7df] rounded-lg p-2 h-[46px] w-full pr-[100px] placeholder:text-sm"
                                required
                                disabled={isLoading}
                                suppressHydrationWarning
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-0 bg-[#814b00] text-[#efe7df] rounded-lg p-2 h-[46px] w-fit font-bold"
                                disabled={isLoading}
                                suppressHydrationWarning
                            >
                                {isLoading ? "Subscribing..." : "Subscribe"}
                            </button>
                        </div>
                    </form>

                    {/* Overlay Message */}
                    {overlayMessage && (
                        <div className="fixed inset-0 bg-black/30 z-[999] flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl w-full max-w-[300px] text-center p-4 pt-6 pb-6">
                                <div className="flex justify-center mx-auto mb-2">
                                    {overlayMessage.type === "success" ? (
                                        <FaCheckCircle className="fill-[#814b00] text-3xl" />
                                    ) : (
                                        <FaCircleExclamation className="fill-red-500 text-3xl" />
                                    )}
                                </div>

                                <p className="text-black">
                                    {overlayMessage.text}
                                </p>
                                <button
                                    aria-label="Close"
                                    onClick={closeOverlay}
                                    className="mt-4 px-8 py-2 bg-[#814b00] text-white rounded-lg font-bold"
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Contact Section */}
                    <div className="grid grid-cols-2 md:grid-cols-[3fr_1fr] gap-4 mt-8 mb-4">
                        <div className="flex flex-col justify-center items-center md:items-start">
                            <h1 className="text-[#efe7df] text-[16px]">
                                Have a question?
                            </h1>
                            <Link
                                href="mailto:contact@myrocky.com"
                                className="underline text-[14px]"
                                prefetch={false}
                            >
                                contact@myrocky.com
                            </Link>
                        </div>
                        <div className="flex flex-col items-center md:items-end">
                            <h4 className="text-[#efe7df] text-[16px]">
                                Press inquiries?
                            </h4>
                            <Link
                                href="mailto:social@myrocky.com"
                                className="underline text-[14px]"
                                prefetch={false}
                            >
                                social@myrocky.com
                            </Link>
                        </div>
                        {/* <div className="flex flex-col items-center justify-center md:items-start">
              <h4 className="text-[#efe7df] text-[16px] text-center md:text-start">
                Where can you find us?
              </h4>
              <p
                className="underline cursor-pointer flex items-center justify-center gap-2 text-[16px]"
                onClick={() => setIsLocationsOpen(!isLocationsOpen)}
              >
                See locations
                <span
                  className={`inline-block w-3.5 h-3.5 ml-2 transform transition-transform ${
                    isLocationsOpen ? "rotate-180" : ""
                  }`}
                >
                  <IoIosArrowDown />
                </span>
              </p>
            </div> */}
                        <div className="flex flex-col items-center md:items-start">
                            <h4 className="text-[#efe7df] mb-2 text-[16px]">
                                Social Media
                            </h4>
                            <div className="flex gap-4">
                                <Link
                                    href="https://www.facebook.com/people/Rocky-Health-Inc/100084461297628/"
                                    target="_blank"
                                    prefetch={false}
                                >
                                    <FaFacebookF />
                                </Link>
                                <Link
                                    href="https://www.instagram.com/myrocky/"
                                    target="_blank"
                                    prefetch={false}
                                >
                                    <FaInstagram />
                                </Link>
                                <Link
                                    href="https://twitter.com/myrockyca"
                                    target="_blank"
                                    prefetch={false}
                                >
                                    <FaTwitter />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Locations */}
                    <div
                        className={`flex justify-between text-[14px] ${
                            isLocationsOpen ? "block" : "hidden"
                        }`}
                    >
                        <div>
                            <p>Rocky Pharmacy (308582)</p>
                            <p>15 - 5270 Solar Dr</p>
                            <p>Mississauga, ON</p>
                            <p>L4W 5M8</p>
                        </div>
                        <div>
                            <p>M. Rizk</p>
                            <p>+1 (416) 900-1444</p>
                            <p>Mon-Fri 6pm-8pm EST</p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* LegitScript Section */}
            <div className="bg-white flex justify-between items-center p-4 max-w-[1200px] mx-auto flex-col md:flex-row gap-2">
                <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="relative rounded-2xl overflow-hidden w-[73px] h-[79px]">
                        <CustomImage
                            src="https://static.legitscript.com/seals/44796030.png"
                            alt="LegitScript approved"
                            fill
                        />
                    </div>
                    <p className="text-[0.7rem] text-center">
                        ©{new Date().getFullYear()} Rocky Health Inc. All rights
                        reserved. Rocky Health Pharmacy Inc. & Rocky Health
                        Clinic Inc. are subsidiaries of Rocky Health Inc.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="relative overflow-hidden w-[30px] h-[30px]">
                        <CustomContainImage
                            src="https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/webp-images/apleepay.png"
                            alt="ApplePay"
                            fill
                        />
                    </div>
                    <div className="relative overflow-hidden w-[30px] h-[30px]">
                        <CustomContainImage
                            src="https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/webp-images/visa.webp"
                            alt="VISA"
                            fill
                        />
                    </div>
                    <div className="relative overflow-hidden w-[30px] h-[30px]">
                        <CustomContainImage
                            src="https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/webp-images/mastercard.webp"
                            alt="MasterCard"
                            fill
                        />
                    </div>
                </div>
            </div>

            {/* BugHerd Script */}
            <Script
                src="https://www.bugherd.com/sidebarv2.js?apikey=muxxd3bcs3sxge7xsyrezg"
                strategy="afterInteractive"
            />
        </>
    );
};

export default Footer;
