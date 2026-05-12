"use client";

import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import { FaCheckCircle, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CustomImage from "@/components/utils/CustomImage";
import CollapsibleDiv from "@/components/Supplements/CollapsibleDiv";
import { useAddItemToCart } from "@/lib/cart/cartHooks";
import CartPopup from "@/components/Cart/CartPopup";
import { formatPriceUI } from "@/utils/priceFormatter";

const SupplementsProductDetails = ({ product, variations, isLoading }) => {
    const addItemToCart = useAddItemToCart();

    // State management
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [variationPrice, setVariationPrice] = useState(product?.price || 30);
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [selectedFrequency, setSelectedFrequency] = useState("subscribe");
    const [selectedDeliveryOption, setSelectedDeliveryOption] =
        useState("each-30-days");
    const [availableVariations, setAvailableVariations] = useState([]);
    const [current, setCurrent] = useState(0);
    const [openCollapsibleIndex, setOpenCollapsibleIndex] = useState(0); // Track which collapsible is open

    // Dynamic product data
    const productName = product?.name || "Essential Night Boost";
    const productDescription =
        product?.short_description ||
        product?.description ||
        "Night Boost gives you a natural sleep aid.";

    // Use actual product images or fallback
    const sliderImages =
        product?.images?.length > 0
            ? product.images.map((img) => img.src)
            : [
                  "/supplements/product.png",
                  "/supplements/product.png",
                  "/supplements/product.png",
                  "/supplements/product.png",
              ];

    // Initialize variations and pricing from actual product data
    useEffect(() => {
        if (product?.variations_data && product.variations_data.length > 0) {
            setAvailableVariations(product.variations_data);

            // Find monthly subscription as default (the actual monthly-supply variation)
            const monthlyVariation =
                product.variations_data.find(
                    (v) =>
                        v.attributes?.attribute_capsules === "60-capsules" &&
                        v.attributes?.["attribute_pa_subscription-type"] ===
                            "monthly-supply"
                ) || product.variations_data[0];

            setSelectedVariation(monthlyVariation);
            setVariationPrice(monthlyVariation.display_price || 30);

            // Set default frequency based on available variations
            if (
                monthlyVariation.attributes?.[
                    "attribute_pa_subscription-type"
                ] === "monthly-supply"
            ) {
                setSelectedFrequency("subscribe");
            } else if (
                monthlyVariation.attributes?.attribute_capsules ===
                "180-capsules"
            ) {
                setSelectedFrequency("oneTime");
            }
        } else if (product?.price) {
            setVariationPrice(product.price);
        }
    }, [product]);

    const prevSlide = () => {
        setCurrent((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrent((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
    };

    // Handle frequency selection based on actual variations
    const handleFrequencyChange = (frequency) => {
        setSelectedFrequency(frequency);

        if (frequency === "oneTime") {
            // For one-time purchase, use the one-time variation
            if (oneTimeVariation) {
                setSelectedVariation(oneTimeVariation);
                setVariationPrice(oneTimeVariation.display_price);
            } else if (product?.price) {
                // Fallback to product price if no one-time variation exists
                setSelectedVariation(null);
                setVariationPrice(product.price);
            }
        } else if (
            frequency === "subscribe" &&
            availableVariations.length > 0
        ) {
            // For subscription, use the correct variation based on subscription type
            let targetVariation;

            if (selectedDeliveryOption === "each-30-days") {
                targetVariation = monthlyVariation;
            } else if (selectedDeliveryOption === "each-90-days") {
                targetVariation = quarterlyVariation;
            }

            if (targetVariation) {
                setSelectedVariation(targetVariation);
                setVariationPrice(targetVariation.display_price);
            }
        }
    };

    // Handle delivery option change
    const handleDeliveryOptionChange = (option) => {
        setSelectedDeliveryOption(option);

        if (
            selectedFrequency === "subscribe" &&
            availableVariations.length > 0
        ) {
            let targetVariation;

            if (option === "each-30-days") {
                targetVariation = monthlyVariation;
            } else if (option === "each-90-days") {
                targetVariation = quarterlyVariation;
            }

            if (targetVariation) {
                setSelectedVariation(targetVariation);
                setVariationPrice(targetVariation.display_price);
            }
        }
    };

    // Handle add to cart
    const handleAddToCart = async () => {
        if (!product?.id) return;

        setIsAddingToCart(true);
        try {
            // Determine which variation to use based on frequency and delivery option
            let currentActiveVariation = null;

            if (selectedFrequency === "subscribe") {
                if (selectedDeliveryOption === "each-90-days") {
                    currentActiveVariation = quarterlyVariation;
                } else {
                    currentActiveVariation = monthlyVariation;
                }
            } else if (selectedFrequency === "oneTime") {
                currentActiveVariation = oneTimeVariation;
            }

            // Use variation_id for both subscriptions and one-time purchases (since both are variations now)
            const itemId = currentActiveVariation?.variation_id || product.id;

            const cartItem = {
                productId: itemId,
                quantity: 1,
                name: product.name,
                price: variationPrice,
                image:
                    product.images?.[0]?.src ||
                    product.image ||
                    sliderImages[0],
                product_type:
                    selectedFrequency === "subscribe"
                        ? "variable-subscription"
                        : "simple",
            };

            // Add variationId for both subscriptions and one-time purchases (since both use variations now)
            if (currentActiveVariation?.variation_id) {
                cartItem.variationId = currentActiveVariation.variation_id;
            }

            await addItemToCart(cartItem);

            // Refresh the cart in the navbar
            document.getElementById("cart-refresher")?.click();

            setShowCartPopup(true);
        } catch (error) {
            logger.error("Error adding to cart:", error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    // Calculate price per serving (2 capsules per serving)
    const calculatePricePerServing = (totalPrice, totalCapsules) => {
        if (!totalPrice || !totalCapsules) return 0;
        return (totalPrice / totalCapsules) * 2;
    };

    // Extract key benefits from metadata
    const getKeyBenefits = () => {
        if (!product?.meta_data) return [];

        const benefits = [];
        const metaData = product.meta_data;

        // Look for benefit fields in metadata
        for (let i = 1; i <= 4; i++) {
            const benefitKey = `key_benefits_0_benefit_${i}`;
            const benefitMeta = metaData.find(
                (meta) => meta.key === benefitKey
            );
            if (benefitMeta && benefitMeta.value && benefitMeta.value.trim()) {
                benefits.push(benefitMeta.value);
            }
        }

        // Fallback to default benefits if none found
        if (benefits.length === 0) {
            return [
                "Sleep deeper and wake up refreshed",
                "Ease your body into calm",
                "Help your body relax",
            ];
        }

        return benefits;
    };

    // Extract common questions from metadata
    const getCommonQuestions = () => {
        if (!product?.meta_data) return [];

        const metaData = product.meta_data;
        const questions = [];

        // Extract what is product
        const whatIsProduct = metaData.find(
            (meta) => meta.key === "common_questions_0_what_is_product"
        );
        if (whatIsProduct && whatIsProduct.value) {
            questions.push({
                title: `What is ${productName}?`,
                description: whatIsProduct.value,
            });
        }

        // Extract why product
        const whyProduct = metaData.find(
            (meta) => meta.key === "common_questions_0_why_product"
        );
        if (whyProduct && whyProduct.value) {
            questions.push({
                title: `Why ${productName}?`,
                description: whyProduct.value,
            });
        }

        // Extract how to take product
        const howToTake = metaData.find(
            (meta) => meta.key === "common_questions_0_how_to_take_product"
        );
        if (howToTake && howToTake.value) {
            questions.push({
                title: `How to take ${productName}?`,
                description: howToTake.value,
            });
        }

        // Fallback questions if none found
        if (questions.length === 0) {
            return [
                {
                    title: "What is Night Boost?",
                    description:
                        "Night boost is a natural sleep support supplement made with gentle, effective ingredients like L-theanine, magnesium bisglycinate, GABA, glycine, and inositol—formulated to help your body relax and ease into a deep, restful sleep.",
                },
                {
                    title: "Why Night Boost?",
                    description:
                        "Night boost is a natural sleep support supplement made with gentle, effective ingredients like L-theanine, magnesium bisglycinate, GABA, glycine, and inositol—formulated to help your body relax and ease into a deep, restful sleep.",
                },
                {
                    title: "How to take Night Boost?",
                    description:
                        "Night boost is a natural sleep support supplement made with gentle, effective ingredients like L-theanine, magnesium bisglycinate, GABA, glycine, and inositol—formulated to help your body relax and ease into a deep, restful sleep.",
                },
            ];
        }

        return questions;
    };

    const keyBenefits = getKeyBenefits();
    const commonQuestions = getCommonQuestions();

    // Get current variation details
    const currentVariation = selectedVariation || availableVariations[0];

    // More explicit variation detection based on actual data structure
    const monthlyVariation = availableVariations.find(
        (v) =>
            (v.attributes?.attribute_capsules === "60-capsules" ||
                v.attributes?.["attribute_pa_tabs-frequency"] ===
                    "60-capsules") &&
            v.attributes?.["attribute_pa_subscription-type"] ===
                "monthly-supply"
    );
    const quarterlyVariation = availableVariations.find(
        (v) =>
            (v.attributes?.attribute_capsules === "180-capsules" ||
                v.attributes?.["attribute_pa_tabs-frequency"] ===
                    "180-capsules") &&
            v.attributes?.["attribute_pa_subscription-type"] ===
                "quarterly-supply"
    );
    const oneTimeVariation = availableVariations.find(
        (v) =>
            v.attributes?.["attribute_pa_subscription-type"] ===
            "one-time-purchase"
    );

    // Calculate pricing using actual server data
    const monthlyPrice = monthlyVariation?.display_price;
    const quarterlyPrice = quarterlyVariation?.display_price;

    // Use product.price for one-time purchase (no calculation needed)
    const oneTimePrice = oneTimeVariation?.display_price || product?.price;

    // Get current subscription price based on delivery option
    const currentSubscriptionPrice =
        selectedDeliveryOption === "each-90-days" && quarterlyPrice
            ? quarterlyPrice
            : monthlyPrice;

    // Calculate discount information
    const getDiscountInfo = () => {
        let regularPrice, currentPrice, discountPercentage;

        if (selectedDeliveryOption === "each-90-days" && quarterlyVariation) {
            regularPrice = quarterlyVariation.display_regular_price;
            currentPrice = quarterlyPrice;
        } else if (monthlyVariation) {
            regularPrice = monthlyVariation.display_regular_price;
            currentPrice = monthlyPrice;
        }

        if (regularPrice && currentPrice && regularPrice > currentPrice) {
            discountPercentage = Math.round(
                ((regularPrice - currentPrice) / regularPrice) * 100
            );
            return {
                hasDiscount: true,
                percentage: discountPercentage,
                regularPrice,
                currentPrice,
            };
        }

        return { hasDiscount: false };
    };

    const discountInfo = getDiscountInfo();

    return (
        <>
            <div className="max-w-[1200px] mx-auto lg:pb-[48px] border-b-[3px] border-b-[#EFEFEF]">
                {/* Desktop Version */}
                <div className="hidden lg:flex flex-col mt-[40px] lg:flex-row items-start justify-between gap-12  mx-auto">
                    {/* Left Side: Slider */}
                    <div className="w-full lg:w-[70%] ">
                        <div className="bg-[#F5F4F3] rounded-lg relative w-[768px] h-[700px]">
                            {/* BestSeller Label */}
                            <div className="absolute top-[20px] left-[20px] w-[82px] h-[26px] bg-[#FAEDA7] border-[2px] border-[#F5F4F3] rounded-md text-center items-center flex justify-center">
                                <p className="font-[POPPINS] font-medium text-[12px] leading-[100%] tracking-[0px]">
                                    Best Seller
                                </p>
                            </div>

                            {/* 
                We need to check here if this product is not Essential Night Boost or Essential Gut Relief
              */}

                            {productName == "Essential Mood Balance" && (
                                <div className="absolute top-[50px] left-[20px] w-[175px] h-[26px] bg-[#E8E8E8]  rounded-md text-center items-center flex justify-center">
                                    <p className="font-[POPPINS] font-medium text-[12px] leading-[100%] tracking-[0px]">
                                        Reduces Stress & Anxiety
                                    </p>
                                </div>
                            )}

                            {productName == "Essential Gut Relief" && (
                                <div className="absolute top-[50px] left-[20px] w-[151px] h-[26px] bg-[#E8E8E8]  rounded-md text-center items-center flex justify-center">
                                    <p className="font-[POPPINS] font-medium text-[12px] leading-[100%] tracking-[0px]">
                                        Relieves Bloating Fast
                                    </p>
                                </div>
                            )}

                            {/* Main Image */}
                            <div className="flex justify-center items-center overflow-x-auto snap-x snap-mandatory touch-pan-x scroll-smooth whitespace-nowrap scrollbar-hide  ">
                                <CustomImage
                                    className="my-[48px]"
                                    src={sliderImages[current]}
                                    height="476"
                                    width="476"
                                    alt={`${productName} - Image ${
                                        current + 1
                                    }`}
                                />
                            </div>
                            {/* Navigation */}

                            <div className="flex justify-center items-center gap-4">
                                <div>
                                    <div
                                        onClick={prevSlide}
                                        className="bg-white rounded-full p-2 cursor-pointer"
                                    >
                                        <FaArrowLeft />
                                    </div>
                                </div>

                                {sliderImages.map((thumbnail, index) => (
                                    <div
                                        key={index}
                                        className="w-[80px] h-[80px] bg-white rounded-lg flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-blue-500 transition"
                                        onClick={() => setCurrent(index)}
                                    >
                                        <CustomImage
                                            src={thumbnail}
                                            height="1000"
                                            width="1000"
                                            alt={`${productName} thumbnail ${
                                                index + 1
                                            }`}
                                        />
                                    </div>
                                ))}

                                <div>
                                    <div
                                        onClick={nextSlide}
                                        className="bg-white rounded-full p-2 cursor-pointer"
                                    >
                                        <FaArrowRight />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <div className="flex justify-left items-center gap-[8px] mt-[8px]">
              <div className="bg-[#F5F4F3] rounded-[10px]">
                <p className="font-[Poppins] font-medium leading-[100%] text-[14px] tracking-[0px] px-[10] py-[2.5px]">
                  Made in US
                </p>
              </div>
              <div className="bg-[#F5F4F3] rounded-[10px]">
                <p className="font-[Poppins] font-medium leading-[100%] text-[14px] tracking-[0px] px-[10] py-[2.5px]">
                  Non GMO - no fillers or chemicals
                </p>
              </div>
              <div className="bg-[#F5F4F3] rounded-[10px]">
                <p className="font-[Poppins] font-medium leading-[100%] text-[14px] tracking-[0px] px-[10] py-[2.5px]">
                  Third-party tested for purity and potency
                </p>
              </div>
            </div> */}
                    </div>

                    {/* Right Side: Details */}
                    <div className="w-full lg:w-[40%] p-2">
                        <h1 className="text-[32px] lg:text-[40px] font-[550] leading-[115%] tracking-[-2%] mb-[6px] headers-font">
                            {productName}
                        </h1>
                        <h2 className="text-[13px] lg:text-[16px] font-medium leading-[115%] tracking-[-2%] mb-[16px]">
                            {(
                                currentVariation?.attributes
                                    ?.attribute_capsules ||
                                currentVariation?.attributes?.[
                                    "attribute_pa_tabs-frequency"
                                ]
                            )?.replace("-", " ") || "60 capsules"}
                        </h2>
                        <p className="text-[14px] font-[POPPINS] font-normal text-[#212121] mb-[24px]">
                            {productDescription.replace(/<[^>]*>/g, "")}
                        </p>
                        <ul className="mb-[24px]">
                            {keyBenefits.map((benefit, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-2 mb-[8px]"
                                >
                                    <FaCheckCircle className="text-[#AE7E56] w-[18px] h-[18px]" />
                                    <span className="font-[POPPINS] leading-[130%] text-[14px] font-normal">
                                        {benefit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {/* Frequency Options */}
                        <p className="text-[14px] font-[POPPINS] font-medium leading-[140%] tracking-[0px] mb-[8px]">
                            Frequency:
                        </p>
                        <div className="">
                            {/* Monthly Supply Subscription Option */}
                            {monthlyVariation && monthlyPrice && (
                                <div
                                    className={` p-[16px] border-[1px]  border-b-0 rounded-t-2xl border-[#D9D9D5] ${
                                        selectedFrequency === "subscribe"
                                            ? "bg-[#F5F4EF]"
                                            : ""
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-[8px]">
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <input
                                                    type="radio"
                                                    id="subscribe"
                                                    name="subscribe"
                                                    value="subscribe"
                                                    checked={
                                                        selectedFrequency ===
                                                        "subscribe"
                                                    }
                                                    onChange={() =>
                                                        handleFrequencyChange(
                                                            "subscribe"
                                                        )
                                                    }
                                                    className="sr-only"
                                                />
                                                <label
                                                    htmlFor="subscribe"
                                                    className="cursor-pointer"
                                                >
                                                    {selectedFrequency ===
                                                    "subscribe" ? (
                                                        <FaCheckCircle className="w-[20px] h-[20px] text-[#AE7E56]" />
                                                    ) : (
                                                        <div className="w-[20px] h-[20px] rounded-full border-2 border-gray-300 bg-white hover:border-[#AE7E56] transition-all duration-200"></div>
                                                    )}
                                                </label>
                                            </div>
                                            <label
                                                htmlFor="subscribe"
                                                className="text-[16px] subheaders-font font-[550] leading-[100%] tracking-[0px] cursor-pointer"
                                            >
                                                Subscribe & Save
                                            </label>

                                            {/* Discount Label */}
                                            {discountInfo.hasDiscount && (
                                                <span className="flex justify-center items-center bg-white border-[1px] border-[#D9D9D9] rounded-xl leading-[100%] h-[8px] p-[8px] font-[POPPINS] font-medium text-[12px]">
                                                    {discountInfo.percentage}%
                                                    Off
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-end">
                                            {/* Price Before - Only show if there's actually a discount */}
                                            {selectedDeliveryOption ===
                                                "each-90-days" && quarterlyPrice
                                                ? quarterlyVariation?.display_regular_price &&
                                                  quarterlyVariation.display_regular_price !==
                                                      quarterlyPrice && (
                                                      <span className="font-[450] text-[16px] mr-[4px] line-through">
                                                          $
                                                          {formatPriceUI(
                                                              quarterlyVariation.display_regular_price
                                                          )}
                                                      </span>
                                                  )
                                                : monthlyPrice &&
                                                  monthlyVariation?.display_regular_price &&
                                                  monthlyVariation.display_regular_price !==
                                                      monthlyPrice && (
                                                      <span className="font-[450] text-[16px] mr-[4px] line-through">
                                                          $
                                                          {formatPriceUI(
                                                              monthlyVariation.display_regular_price
                                                          )}
                                                      </span>
                                                  )}
                                            {/* Current Price */}
                                            <span className="font-[550] text-[16px]">
                                                $
                                                {formatPriceUI(
                                                    selectedDeliveryOption ===
                                                        "each-90-days" &&
                                                        quarterlyPrice
                                                        ? quarterlyPrice
                                                        : monthlyPrice
                                                )}
                                            </span>
                                            {/* Serving Charge */}
                                            <p className="text-[12px] font-[POPPINS] font-normal leading-[100%] tracking-[0px]">
                                                {selectedDeliveryOption ===
                                                    "each-90-days" &&
                                                quarterlyPrice
                                                    ? `${formatPriceUI(
                                                          calculatePricePerServing(
                                                              quarterlyPrice,
                                                              180
                                                          )
                                                      )}/Serving`
                                                    : monthlyPrice &&
                                                      `${formatPriceUI(
                                                          calculatePricePerServing(
                                                              monthlyPrice,
                                                              60
                                                          )
                                                      )}/Serving`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Select Options - Monthly and Quarterly */}
                                    {selectedFrequency === "subscribe" && (
                                        <>
                                            <select
                                                className="h-[32px] mb-[4px] w-full bg-white border-[1px] border-[#D9D9D5] rounded-2xl px-4 py-1 text-[12px] font-[POPPINS] font-normal leading-[100%] tracking-[0px]"
                                                value={selectedDeliveryOption}
                                                onChange={(e) =>
                                                    handleDeliveryOptionChange(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option
                                                    value="each-30-days"
                                                    className="text-[12px]"
                                                >
                                                    Delivery every 30 days (Most
                                                    popular)
                                                </option>
                                                {quarterlyVariation &&
                                                    quarterlyPrice && (
                                                        <option
                                                            value="each-90-days"
                                                            className="text-[12px]"
                                                        >
                                                            Delivery every 90
                                                            days (3 months)
                                                        </option>
                                                    )}
                                            </select>

                                            <p className="text-[10px] pl-[16px] pt-[4px] font-[POPPINS] font-normal leading-[100%] tracking-[0px]">
                                                Pause, skip, or cancel at any
                                                time
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* One-Time Purchase Option */}
                            {monthlyPrice && oneTimePrice && (
                                <div
                                    className={`p-[16px] border-[1px] rounded-b-2xl border-[#D9D9D5] ${
                                        selectedFrequency === "oneTime"
                                            ? "bg-[#F5F4EF]"
                                            : ""
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-[8px]">
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <input
                                                    type="radio"
                                                    id="oneTime"
                                                    name="subscribe"
                                                    value="oneTime"
                                                    checked={
                                                        selectedFrequency ===
                                                        "oneTime"
                                                    }
                                                    onChange={() =>
                                                        handleFrequencyChange(
                                                            "oneTime"
                                                        )
                                                    }
                                                    className="sr-only"
                                                />
                                                <label
                                                    htmlFor="oneTime"
                                                    className="cursor-pointer"
                                                >
                                                    {selectedFrequency ===
                                                    "oneTime" ? (
                                                        <FaCheckCircle className="w-[20px] h-[20px] text-[#AE7E56]" />
                                                    ) : (
                                                        <div className="w-[20px] h-[20px] rounded-full border-2 border-gray-300 bg-white hover:border-[#AE7E56] transition-all duration-200"></div>
                                                    )}
                                                </label>
                                            </div>
                                            <label
                                                htmlFor="oneTime"
                                                className="text-[16px] headers-font font-[550] leading-[100%] tracking-[0px] cursor-pointer"
                                            >
                                                One-Time Purchase
                                            </label>
                                        </div>
                                        <div className="text-end">
                                            {/* Current Price */}
                                            <span className="font-[550] text-[16px] pl-1 text-right">
                                                ${formatPriceUI(oneTimePrice)}
                                            </span>
                                            {/* Serving Charge */}
                                            <p className="text-[12px] font-[POPPINS] font-normal leading-[100%] tracking-[0px]">
                                                $
                                                {formatPriceUI(
                                                    calculatePricePerServing(
                                                        oneTimePrice,
                                                        60
                                                    )
                                                )}
                                                /Serving
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={isAddingToCart}
                            className="bg-black mb-[40px] rounded-full px-6 mt-[24px] h-[48px] text-white font-[POPPINS] flex justify-between items-center w-full hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            <span className="text-[16px] leading-[130%] font-semibold">
                                {isAddingToCart ? "Adding..." : "Add to Cart"}
                            </span>
                            <div>
                                {selectedFrequency === "subscribe" &&
                                    (selectedDeliveryOption ===
                                        "each-90-days" && quarterlyPrice
                                        ? quarterlyVariation?.display_regular_price &&
                                          quarterlyVariation.display_regular_price !==
                                              quarterlyPrice && (
                                              <span className="font-[400] text-[16px] mr-[4px] line-through">
                                                  $
                                                  {formatPriceUI(
                                                      quarterlyVariation.display_regular_price
                                                  )}
                                              </span>
                                          )
                                        : monthlyPrice &&
                                          monthlyVariation?.display_regular_price &&
                                          monthlyVariation.display_regular_price !==
                                              monthlyPrice && (
                                              <span className="font-[400] text-[16px] mr-[4px] line-through">
                                                  $
                                                  {formatPriceUI(
                                                      monthlyVariation.display_regular_price
                                                  )}
                                              </span>
                                          ))}
                                <span className="font-[600] text-[16px]">
                                    ${formatPriceUI(variationPrice)}
                                </span>
                            </div>
                        </button>

                        {/* Collapsible Div */}
                        <div>
                            {commonQuestions.map((question, index) => (
                                <CollapsibleDiv
                                    key={index}
                                    show={index === openCollapsibleIndex}
                                    title={question.title}
                                    description={question.description}
                                    onToggle={(show) =>
                                        setOpenCollapsibleIndex(
                                            show ? index : null
                                        )
                                    }
                                />
                            ))}
                        </div>

                        <div className="border-[1px] border-[#D9D9D5] rounded-[16px] p-[26px] mt-[24px]">
                            <CustomImage
                                src="/supplements/LogosHS.png"
                                height="1000"
                                width="1000"
                                alt="Trust badges"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Version */}
                <div className="flex lg:hidden flex-col mt-[40px] lg:flex-row items-start justify-between gap-6">
                    {/* Left Side: Slider */}
                    <div className="w-full lg:w-[63%]">
                        <div className="px-[20px]">
                            <h1 className="text-[32px] headers-font lg:text-[40px] font-[550] leading-[115%] tracking-[-2%] mb-[6px]">
                                {productName}
                            </h1>
                            <h2 className="text-[14px] lg:text-[16px] font-normal leading-[100%] tracking-[0px] font-P mb-[16px]">
                                {(
                                    currentVariation?.attributes
                                        ?.attribute_capsules ||
                                    currentVariation?.attributes?.[
                                        "attribute_pa_tabs-frequency"
                                    ]
                                )?.replace("-", " ") || "60 capsules"}
                            </h2>
                            <p className="text-[14px]  font-[POPPINS] font-normal text-[#212121] mb-[24px]">
                                {productDescription.replace(/<[^>]*>/g, "")}
                            </p>
                        </div>
                        <div className="bg-[#F5F4F3] w-[100%] h-[300px] rounded-lg relative p-6">
                            {/* BestSeller Label */}
                            <div className="absolute top-[20px] left-[20px] w-[82px] h-[26px] bg-[#FAEDA7] border-[2px] border-[#F5F4F3] rounded-md text-center items-center flex justify-center z-10">
                                <p className="font-[POPPINS] font-medium text-[12px] leading-[100%] tracking-[0px]">
                                    Best Seller
                                </p>
                            </div>
                            {/* Mobile Main Image */}
                            <div className="flex overflow-x-auto snap-x snap-mandatory touch-pan-x scroll-smooth whitespace-nowrap scrollbar-hide  justify-center items-center">
                                <CustomImage
                                    src={sliderImages[current]}
                                    height="260"
                                    width="260"
                                    alt={`${productName} - Image ${
                                        current + 1
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center items-center gap-4">
                            {sliderImages.map((thumbnail, index) => (
                                <div
                                    key={index}
                                    className="w-[80px] h-[80px] bg-white rounded-lg flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-blue-500 transition"
                                    onClick={() => setCurrent(index)}
                                >
                                    <CustomImage
                                        src={thumbnail}
                                        height="1000"
                                        width="1000"
                                        alt={`${productName} thumbnail  ${
                                            index + 1
                                        }`}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap gap-[8px] mt-[8px]">
                            <div className="bg-[#F5F4F3] rounded-[10px]">
                                <p className="font-[Poppins] font-medium leading-[100%] text-[14px] tracking-[0px] px-3 py-1">
                                    Made in US
                                </p>
                            </div>
                            <div className="bg-[#F5F4F3] rounded-[10px] w-fit">
                                <p className="font-[Poppins] font-medium leading-[100%] text-[14px] tracking-[0px] px-3 py-1">
                                    Non GMO - no fillers or chemicals
                                </p>
                            </div>
                            <div className="bg-[#F5F4F3] rounded-[10px] w-fit">
                                <p className="font-[Poppins] font-medium leading-[100%] text-[14px] tracking-[0px] px-3 py-1">
                                    Third-party tested for purity and potency
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Details */}
                    <div className="w-full lg:w-[40%] p-2 px-[20px]">
                        <ul className="mb-[24px]">
                            {keyBenefits.map((benefit, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-2 mb-[8px]"
                                >
                                    <FaCheckCircle className="text-[#AE7E56] text-[18px] w-[18px] h-[18px]" />
                                    <span className="font-[POPPINS] leading-[130%] text-[14px] font-normal">
                                        {benefit}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        {/* Mobile Frequency Options */}
                        <p className="text-[14px] font-[POPPINS] font-medium leading-[140%] tracking-[0px] mb-[8px]">
                            Frequency:
                        </p>
                        <div className="">
                            {/* Mobile Subscribe & Save */}
                            {monthlyVariation && monthlyPrice && (
                                <div className="bg-[#F5F4EF] p-[16px] border-[1px] border-b-0 rounded-t-2xl border-[#D9D9D5]">
                                    <div className="flex justify-between items-start mb-[8px]">
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <input
                                                    type="radio"
                                                    id="subscribe-mobile"
                                                    name="subscribe-mobile"
                                                    value="subscribe"
                                                    checked={
                                                        selectedFrequency ===
                                                        "subscribe"
                                                    }
                                                    onChange={() =>
                                                        handleFrequencyChange(
                                                            "subscribe"
                                                        )
                                                    }
                                                    className="sr-only"
                                                />
                                                <label
                                                    htmlFor="subscribe-mobile"
                                                    className="cursor-pointer"
                                                >
                                                    {selectedFrequency ===
                                                    "subscribe" ? (
                                                        <FaCheckCircle className="w-[20px] h-[20px] text-[#AE7E56]" />
                                                    ) : (
                                                        <div className="w-[20px] h-[20px] rounded-full border-2 border-gray-300 bg-white hover:border-[#AE7E56] transition-all duration-200"></div>
                                                    )}
                                                </label>
                                            </div>
                                            <label
                                                htmlFor="subscribe-mobile"
                                                className="text-[16px] subheaders-font font-[550] leading-[100%] tracking-[0px] cursor-pointer"
                                            >
                                                Subscribe & Save
                                                <span className="block leading-[100%] mt-[2px] font-[POPPINS] font-medium text-[12px]">
                                                    <b>
                                                        {discountInfo.hasDiscount
                                                            ? `${discountInfo.percentage}% off`
                                                            : ""}
                                                    </b>{" "}
                                                    first order
                                                </span>
                                            </label>
                                        </div>
                                        <div className="text-end">
                                            {/* Price Before - Only show if there's actually a discount */}
                                            {selectedDeliveryOption ===
                                                "each-90-days" && quarterlyPrice
                                                ? quarterlyVariation?.display_regular_price &&
                                                  quarterlyVariation.display_regular_price !==
                                                      quarterlyPrice && (
                                                      <span className="font-[450] text-[16px] mr-[4px] line-through">
                                                          $
                                                          {formatPriceUI(
                                                              quarterlyVariation.display_regular_price
                                                          )}
                                                      </span>
                                                  )
                                                : monthlyPrice &&
                                                  monthlyVariation?.display_regular_price &&
                                                  monthlyVariation.display_regular_price !==
                                                      monthlyPrice && (
                                                      <span className="font-[450] text-[16px] mr-[4px] line-through">
                                                          $
                                                          {formatPriceUI(
                                                              monthlyVariation.display_regular_price
                                                          )}
                                                      </span>
                                                  )}
                                            {/* Current Price */}
                                            <span className="font-[550] text-[16px]">
                                                $
                                                {formatPriceUI(
                                                    selectedDeliveryOption ===
                                                        "each-90-days" &&
                                                        quarterlyPrice
                                                        ? quarterlyPrice
                                                        : monthlyPrice
                                                )}
                                            </span>
                                            {/* Serving Charge */}
                                            <p className="text-[12px] font-[POPPINS] font-normal leading-[100%] tracking-[0px]">
                                                {selectedDeliveryOption ===
                                                    "each-90-days" &&
                                                quarterlyPrice
                                                    ? `${formatPriceUI(
                                                          calculatePricePerServing(
                                                              quarterlyPrice,
                                                              180
                                                          )
                                                      )}/Serving`
                                                    : monthlyPrice &&
                                                      `${formatPriceUI(
                                                          calculatePricePerServing(
                                                              monthlyPrice,
                                                              60
                                                          )
                                                      )}/Serving`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Mobile Select Options */}
                                    {selectedFrequency === "subscribe" && (
                                        <>
                                            <select
                                                className="h-[32px] mb-[4px] w-full bg-white border-[1px] border-[#D9D9D5] rounded-full px-4 text-[12px] font-[POPPINS] font-normal leading-[100%] tracking-[0px]"
                                                value={selectedDeliveryOption}
                                                onChange={(e) =>
                                                    handleDeliveryOptionChange(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="each-30-days">
                                                    Delivery every 30 days (Most
                                                    popular)
                                                </option>
                                                {quarterlyVariation &&
                                                    quarterlyPrice && (
                                                        <option value="each-90-days">
                                                            Delivery every 90
                                                            days (3 months)
                                                        </option>
                                                    )}
                                            </select>

                                            <p className="text-[10px] pl-[16px] pt-[4px] px-2 font-[POPPINS] font-normal leading-[100%] tracking-[0px]">
                                                Pause, skip, or cancel at any
                                                time
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Mobile One-Time Purchase */}
                            {monthlyPrice && oneTimePrice && (
                                <div className="p-[16px] border-[1px] rounded-b-2xl border-[#D9D9D5]">
                                    <div className="flex justify-between items-start mb-[8px]">
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <input
                                                    type="radio"
                                                    id="oneTime-mobile"
                                                    name="subscribe-mobile"
                                                    value="oneTime"
                                                    checked={
                                                        selectedFrequency ===
                                                        "oneTime"
                                                    }
                                                    onChange={() =>
                                                        handleFrequencyChange(
                                                            "oneTime"
                                                        )
                                                    }
                                                    className="sr-only"
                                                />
                                                <label
                                                    htmlFor="oneTime-mobile"
                                                    className="cursor-pointer"
                                                >
                                                    {selectedFrequency ===
                                                    "oneTime" ? (
                                                        <FaCheckCircle className="w-[20px] h-[20px] text-[#AE7E56]" />
                                                    ) : (
                                                        <div className="w-[20px] h-[20px] rounded-full border-2 border-gray-300 bg-white hover:border-[#AE7E56] transition-all duration-200"></div>
                                                    )}
                                                </label>
                                            </div>
                                            <label
                                                htmlFor="oneTime-mobile"
                                                className="text-[16px] subheaders-font font-[550] leading-[100%] tracking-[0px] cursor-pointer"
                                            >
                                                One-Time Purchase
                                            </label>
                                        </div>
                                        <div className="text-end">
                                            {/* Current Price */}
                                            <span className="font-[550] text-[16px] pl-1 text-right">
                                                ${formatPriceUI(oneTimePrice)}
                                            </span>
                                            {/* Serving Charge */}
                                            <p className="text-[12px] font-[POPPINS] font-normal leading-[100%] tracking-[0px]">
                                                $
                                                {formatPriceUI(
                                                    calculatePricePerServing(
                                                        oneTimePrice,
                                                        60
                                                    )
                                                )}
                                                /Serving
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={isAddingToCart}
                            className="bg-black rounded-full px-6 mt-[24px] mb-[40px] h-[48px] text-white font-[POPPINS] flex justify-between items-center w-full"
                        >
                            <span className="text-[16px] leading-[130%] font-semibold">
                                {isAddingToCart ? "Adding..." : "Add to Cart"}
                            </span>
                            <div>
                                {selectedFrequency === "subscribe" &&
                                    (selectedDeliveryOption ===
                                        "each-90-days" && quarterlyPrice
                                        ? quarterlyVariation?.display_regular_price &&
                                          quarterlyVariation.display_regular_price !==
                                              quarterlyPrice && (
                                              <span className="font-[400] text-[16px] mr-[4px] line-through">
                                                  $
                                                  {formatPriceUI(
                                                      quarterlyVariation.display_regular_price
                                                  )}
                                              </span>
                                          )
                                        : monthlyPrice &&
                                          monthlyVariation?.display_regular_price &&
                                          monthlyVariation.display_regular_price !==
                                              monthlyPrice && (
                                              <span className="font-[400] text-[16px] mr-[4px] line-through">
                                                  $
                                                  {formatPriceUI(
                                                      monthlyVariation.display_regular_price
                                                  )}
                                              </span>
                                          ))}
                                <span className="font-[600] text-[16px]">
                                    ${formatPriceUI(variationPrice)}
                                </span>
                            </div>
                        </button>

                        {/* Mobile Collapsible Div */}
                        <div>
                            {commonQuestions.map((question, index) => (
                                <CollapsibleDiv
                                    key={index}
                                    show={index === openCollapsibleIndex}
                                    title={question.title}
                                    description={question.description}
                                    onToggle={(show) =>
                                        setOpenCollapsibleIndex(
                                            show ? index : null
                                        )
                                    }
                                />
                            ))}
                        </div>

                        <div className="border-[1px] border-[#D9D9D5] rounded-lg p-6 mt-[24px]">
                            <CustomImage
                                src="/supplements/LogosHS.png"
                                height="1000"
                                width="1000"
                                alt="Trust badges"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Cart Popup */}
            {showCartPopup && (
                <CartPopup
                    isOpen={showCartPopup}
                    onClose={() => setShowCartPopup(false)}
                />
            )}
        </>
    );
};

export default SupplementsProductDetails;
