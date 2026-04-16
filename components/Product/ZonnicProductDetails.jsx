"use client";

import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import Image from "next/image";
import { ProductImage } from "@/components/Product";
import { useAddItemToCart } from "@/lib/cart/cartHooks";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/utils/priceFormatter";
import CartPopup from "../Cart/CartPopup";
import { addRequiredConsultation } from "@/utils/requiredConsultation";
import {
  isQuebecProvince,
  getQuebecRestrictionMessage,
} from "@/utils/zonnicQuebecValidation";
import { checkAgeRestriction } from "@/utils/ageValidation";
import QuebecRestrictionPopup from "../Popups/QuebecRestrictionPopup";
import AgeRestrictionPopup from "../Popups/AgeRestrictionPopup";

const ZonnicProductDetails = ({ product, variations, isLoading }) => {
  const router = useRouter();
  const addItemToCart = useAddItemToCart();
  logger.log("ZonnicProductDetails product:", product);

  // Extract flavors from product attributes
  const flavors = product?.attributes?.find(
    (attr) => attr.slug === "pa_flavors",
  )?.options || ["Mint", "Peppermint", "Spearmint"];

  // State management
  const [variationPrice, setVariationPrice] = useState("");
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [subscriptionTypes, setSubscriptionTypes] = useState([]);
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [selectedFlavor, setSelectedFlavor] = useState(flavors[0]);
  const [availablePacks, setAvailablePacks] = useState([]);
  const [selectedPacks, setSelectedPacks] = useState(null);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [showQuebecPopup, setShowQuebecPopup] = useState(false);
  const [showAgePopup, setShowAgePopup] = useState(false);

  // Initialize subscription types and frequency once on mount
  useEffect(() => {
    const types = ["Monthly Supply", "Quarterly Supply"];
    setSubscriptionTypes(types);
    setSelectedFrequency(types[0]);
  }, []);

  // Update available packs when frequency or flavor changes or product data loads
  useEffect(() => {
    if (product?.variations_data && selectedFrequency && selectedFlavor) {
      const freqKey = selectedFrequency.toLowerCase().replace(/\s+/g, "-");
      const flavorKey = selectedFlavor.toLowerCase().replace(/\s+/g, "-");

      // Filter variations by selected frequency and flavor
      const packs = product.variations_data
        .filter((v) => {
          if (!v.attributes) return false;
          const frequencyMatch =
            v.attributes["attribute_pa_subscription-type"] === freqKey;
          const flavorAttr =
            v.attributes["attribute_flavors"] ||
            v.attributes["attribute_pa_flavors"];
          const flavorMatch = !flavorAttr || flavorAttr === flavorKey;
          return frequencyMatch && flavorMatch;
        })
        .map((v) => {
          const packValue = v.attributes["attribute_zonnic-packs"];
          const displayLabel = packValue.replace(/-/g, " ");
          return {
            value: packValue,
            label: displayLabel,
            price: v.display_price,
            variationId: v.variation_id,
            variation: v,
          };
        });

      // Remove duplicate packs by value, keep the first occurrence
      const uniquePacksMap = new Map();
      packs.forEach((pack) => {
        if (!uniquePacksMap.has(pack.value)) {
          uniquePacksMap.set(pack.value, pack);
        }
      });
      const uniquePacks = Array.from(uniquePacksMap.values());

      // Sort packs by quantity
      const sortedPacks = [...uniquePacks].sort((a, b) => {
        const aMatch = a.label.match(/^(\d+)/);
        const bMatch = b.label.match(/^(\d+)/);
        const aNum = aMatch ? parseInt(aMatch[1]) : 0;
        const bNum = bMatch ? parseInt(bMatch[1]) : 0;
        return aNum - bNum;
      });

      setAvailablePacks(sortedPacks);

      if (sortedPacks.length > 0) {
        setSelectedPacks(sortedPacks[0].value);
        setSelectedVariation(sortedPacks[0].variation);
        setVariationPrice(sortedPacks[0].price);
      } else {
        setSelectedPacks(null);
        setSelectedVariation(null);
        setVariationPrice("");
      }
    }
  }, [product, selectedFrequency, selectedFlavor]);

  // Handle frequency change
  const handleFrequencyChange = (frequency) => {
    setSelectedFrequency(frequency);
    setSelectedPacks(null);
    setSelectedVariation(null);
    setVariationPrice("");
  };

  // Handle flavor change
  const handleFlavorChange = (flavor) => {
    setSelectedFlavor(flavor);
    setSelectedPacks(null);
    setSelectedVariation(null);
    setVariationPrice("");
  };

  // Handle pack selection
  const handlePackSelection = (pack) => {
    setSelectedPacks(pack.value);
    setVariationPrice(pack.price);
    setSelectedVariation(pack.variation);
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!selectedVariation) return;

    try {
      setAddToCartLoading(true);

      if (!product || !product.id) {
        logger.error("No product ID available for adding to cart");
        return;
      }

      // Check if user is logged in and get their profile data
      let userProvince = null;
      let userDateOfBirth = null;
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const profileData = await response.json();
          if (profileData.success) {
            userProvince = profileData.province;
            userDateOfBirth = profileData.date_of_birth;
          }
        }
      } catch (error) {
        logger.log(
          "Could not fetch user profile, proceeding with cart addition",
        );
      }

      // Check Quebec restriction for logged-in users
      if (userProvince && isQuebecProvince(userProvince)) {
        setShowQuebecPopup(true);
        setAddToCartLoading(false);
        return;
      }

      // Check age restriction for logged-in users (must be 19+ for Zonnic)
      if (userDateOfBirth) {
        logger.log("User date of birth:", userDateOfBirth);
        const ageCheck = checkAgeRestriction(userDateOfBirth, 19);
        logger.log("Age validation result:", ageCheck);

        if (ageCheck.blocked) {
          logger.log("User is too young, showing age popup");
          setShowAgePopup(true);
          setAddToCartLoading(false);
          return;
        } else {
          logger.log("User meets age requirement:", ageCheck.age);
        }
      } else {
        logger.log("No date of birth found for user");
      }

      // --- FLOW DETECTION AND LOCALSTORAGE LOGIC ---
      const selectedId = selectedVariation?.variation_id || product.id;
      addRequiredConsultation(selectedId, "smoking-flow");
      // --- END FLOW DETECTION AND LOCALSTORAGE LOGIC ---

      // Make sure we have the correct product image URL
      const productImageUrl =
        product.images && product.images.length > 0
          ? product.images[0].src
          : product.image || "";

      // Prepare data for the cart addition with complete product details
      const cartData = {
        productId: product.id,
        quantity: 1,
        name: product.name || "ZONNIC Nicotine Pouches",
        price: variationPrice,
        image: productImageUrl,
        product_type: product.type || "",
        flavor: selectedFlavor,
      };

      // Extract the variation ID from the selected variation
      const variationId =
        selectedVariation.variation_id ||
        selectedVariation.variationId ||
        (selectedVariation.variation &&
          selectedVariation.variation.variation_id);

      if (variationId) {
        cartData.variationId = variationId;

        // Add variation attributes for display if available
        if (selectedVariation.attributes) {
          cartData.variation = Object.entries(selectedVariation.attributes).map(
            ([name, value]) => ({
              name: name.replace("attribute_", "").replace("pa_", ""),
              value: value,
            }),
          );
        }

        // For variable products like Zonnic, use the variation ID as the product ID
        const isVariableProduct =
          product.type === "variable" ||
          product.type === "variable-subscription";

        if (isVariableProduct) {
          cartData.productId = variationId;
        }
      }

      logger.log("Adding to cart with data:", cartData);

      await addItemToCart(cartData);

      // Refresh the cart in the navbar
      document.getElementById("cart-refresher")?.click();

      // Show cart popup
      setShowCartPopup(true);
    } catch (error) {
      logger.error("Error adding item to cart:", error);
    } finally {
      setAddToCartLoading(false);
    }
  };

  // Handle popup actions
  const handleContinueShopping = () => {
    setShowCartPopup(false);
  };

  const handleProceedToCheckout = () => {
    router.push("/checkout");
  };

  const handleCloseQuebecPopup = () => {
    setShowQuebecPopup(false);
  };

  const handleCloseAgePopup = () => {
    setShowAgePopup(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <ProductImage
              src={
                product?.images?.[0]?.src ||
                product?.imageUrl ||
                "https://myrocky.b-cdn.net/WP%20Images/zonnic/zonnic-product-1.png"
              }
              alt={product?.name || "ZONNIC Nicotine Pouches"}
              priority
            />
          </div>
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col">
          {/* Product Header */}
          <div className="mb-6">
            <p className="text-2xl font-semibold headers-font mb-1">
              {product?.name || "ZONNIC Nicotine Pouches"}
            </p>
            <p className="text-xl font-medium mb-4">{selectedFlavor}</p>
            <div
              className="text-gray-800 mb-5"
              dangerouslySetInnerHTML={{
                __html:
                  product?.description ||
                  "ZONNIC nicotine pouches offer convenient Nicotine Replacement therapy to help control cravings and ease withdrawal symptoms. Designed to support smoking cessation, they provide a nicotine alternative, reducing cravings and cigarette use.",
              }}
            />
            <p className="text-sm text-[#212121] mt-5 font-[400]">
              <span className="font-[500]">Package contains: 24 x 4mg</span>{" "}
              nicotine pouches
            </p>
          </div>

          {/* Flavor Selection */}
          <div className="mb-6">
            <h2 className="text-base font-medium mb-2">Select your flavor:</h2>
            <div className="grid grid-cols-3 gap-2">
              {flavors.map((flavor) => (
                <button
                  key={flavor}
                  className={`w-full py-1 px-3 text-sm rounded-[8px] border-2 transition-all duration-200 ${
                    selectedFlavor === flavor
                      ? "border-[#AE7E56] text-[#AE7E56]"
                      : "border-[#CECECE] hover:border-gray-400"
                  }`}
                  onClick={() => handleFlavorChange(flavor)}
                >
                  {flavor}
                </button>
              ))}
            </div>
          </div>

          {/* Product Options */}
          <div>
            <h2 className="text-base font-medium mb-3">Delivery Frequency:</h2>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {subscriptionTypes.map((type) => (
                <button
                  key={type}
                  className={`border rounded-[8px] py-1 px-3 text-sm text-center font-medium transition-all duration-200 ${
                    selectedFrequency === type
                      ? " border-[#AE7E56] text-[#AE7E56]"
                      : "border-[#CECECE] hover:border-gray-400"
                  }`}
                  onClick={() => handleFrequencyChange(type)}
                >
                  {type}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mb-6">
              {selectedFrequency === "Monthly Supply"
                ? "Delivered monthly • Cancel Anytime • Free Shipping"
                : selectedFrequency === "Quarterly Supply"
                  ? "Delivered quarterly • Cancel Anytime • Free Shipping"
                  : null}
            </p>

            {/* Packs Selection */}
            <div className="space-y-2 mb-6">
              <h2 className="text-base font-medium">How many packs?</h2>
              <div className="grid grid-cols-3 gap-2">
                {availablePacks.length === 0 && (
                  <span className="col-span-3 text-gray-400 text-center">
                    No packs available for this frequency and flavor.
                  </span>
                )}
                {availablePacks.map((pack) => (
                  <button
                    key={pack.value + "-" + pack.variationId}
                    className={`w-full py-1 px-3 text-sm rounded-[8px] border-2 transition-all duration-200 ${
                      selectedPacks === pack.value
                        ? "border-[#AE7E56] text-[#AE7E56]"
                        : "border-[#CECECE] hover:border-gray-400"
                    }`}
                    onClick={() => handlePackSelection(pack)}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                      <span>{pack.label}</span>
                      <span>${formatPrice(pack.price)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              className="w-full bg-black text-white py-3 px-6 rounded-full font-medium text-lg mb-6"
              onClick={handleAddToCart}
              disabled={!selectedVariation || addToCartLoading}
            >
              {addToCartLoading
                ? "Adding to Cart..."
                : `Add to Cart - $${formatPrice(variationPrice)}`}
            </button>

            {/* Warning notice */}
            <div className="bg-[#f8f6f0] rounded-md p-4 mb-6">
              <p className="text-sm">
                <span className="font-bold">WARNING: </span>
                This product contains nicotine. Nicotine is highly addictive.
                This product is intended for smoking cessation only. Do not use
                if you are under 19 years of age.
              </p>
            </div>

            {/* Ontario Logo */}
            <div className="border border-gray-300 rounded-md p-4 flex justify-center">
              <img
                src="https://myrocky.b-cdn.net/WP%20Images/zonnic/ontario.png"
                alt="Ontario College of Pharmacists"
                className="h-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cart Popup */}
      <CartPopup
        isOpen={showCartPopup}
        onClose={handleContinueShopping}
        productType={product?.type || null}
      />

      {/* Quebec Restriction Popup */}
      <QuebecRestrictionPopup
        isOpen={showQuebecPopup}
        onClose={handleCloseQuebecPopup}
        message={getQuebecRestrictionMessage()}
      />

      {/* Age Restriction Popup */}
      <AgeRestrictionPopup
        isOpen={showAgePopup}
        onClose={handleCloseAgePopup}
        message="Sorry, you must be at least 19 years old to purchase this product."
      />
    </div>
  );
};

export default ZonnicProductDetails;
