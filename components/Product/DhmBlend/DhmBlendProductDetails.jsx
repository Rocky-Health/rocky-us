"use client";

import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import { ProductImage } from "@/components/Product";
import { useAddItemToCart } from "@/lib/cart/cartHooks";
import { useRouter } from "next/navigation";
import { OptionButton } from "@/components/Product/UI";
import CartPopup from "../../Cart/CartPopup";
import { formatPriceUI } from "@/utils/priceFormatter";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const DhmBlendProductDetails = ({ product, variations, isLoading }) => {
  const router = useRouter();
  const addItemToCart = useAddItemToCart();

  // State management for variations and selections
  const [variationPrice, setVariationPrice] = useState("");
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [availablePacks, setAvailablePacks] = useState([]);
  const [selectedPacks, setSelectedPacks] = useState(null);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState("");
  const [frequencyOptions, setFrequencyOptions] = useState([]);

  // Initialize product data on load
  useEffect(() => {
    if (!isLoading && product) {
      logger.log("Product loaded:", product);

      // Extract distinct frequency options from variations
      if (product.variations_data && product.variations_data.length > 0) {
        const uniqueFrequencies = new Set();

        product.variations_data.forEach((variation) => {
          if (variation.attributes) {
            // Look for subscription type attribute with various possible keys
            const subscriptionType =
              variation.attributes["attribute_subscription-type"] ||
              variation.attributes["attribute_pa_subscription-type"];

            if (subscriptionType) {
              uniqueFrequencies.add(subscriptionType);
            }
          }
        });

        if (uniqueFrequencies.size > 0) {
          const frequencies = Array.from(uniqueFrequencies);
          logger.log("Found frequency options:", frequencies);
          setFrequencyOptions(frequencies);

          // Select the first frequency by default
          if (frequencies.length > 0) {
            setSelectedFrequency(frequencies[0]);
          }
        } else {
          // Fallback to one-time purchase if no frequencies found
          setFrequencyOptions(["one-time-purchase"]);
          setSelectedFrequency("one-time-purchase");
        }
      }
    }
  }, [product, isLoading]);

  // When frequency changes, update available packs
  useEffect(() => {
    if (!isLoading && product?.variations_data && selectedFrequency) {
      logger.log("Filtering variations for frequency:", selectedFrequency);

      // Filter variations by selected frequency
      const filteredVariations = product.variations_data.filter((variation) => {
        if (!variation.attributes) return false;

        const subscriptionType =
          variation.attributes["attribute_subscription-type"] ||
          variation.attributes["attribute_pa_subscription-type"];

        return (
          subscriptionType &&
          subscriptionType.toLowerCase() === selectedFrequency.toLowerCase()
        );
      });

      logger.log(
        `Found ${filteredVariations.length} variations matching frequency: ${selectedFrequency}`,
      );

      // Since variations don't have attribute_dhm-packs, we need to match them to product options
      // by their position and prices
      let packOptions = [];

      if (product.attributes) {
        // Find DHM Packs attribute
        const packAttribute = product.attributes.find(
          (attr) =>
            attr.name === "DHM Packs" ||
            attr.slug === "DHM Packs" ||
            attr.slug === "dhm-packs" ||
            attr.slug === "pa_dhm-packs",
        );

        if (packAttribute && Array.isArray(packAttribute.options)) {
          // Get all pack options from product attributes
          const packValues = packAttribute.options;
          logger.log("DHM pack options from attributes:", packValues);

          // Sort variations by price (low to high)
          filteredVariations.sort(
            (a, b) => parseFloat(a.display_price) - parseFloat(b.display_price),
          );

          // Match each pack option with the corresponding variation by position/price
          // 10-pack is cheapest, 30-pack is middle, 60-pack is most expensive
          packOptions = packValues
            .map((packValue, index) => {
              // Find the variation with matching index after sorting by price
              const matchingVariation =
                filteredVariations.length > index
                  ? filteredVariations[index]
                  : null;

              if (!matchingVariation) {
                logger.log(`No variation found for pack: ${packValue}`);
                return null;
              }

              logger.log(
                `Matched ${packValue} with variation ID ${matchingVariation.variation_id}, price: ${matchingVariation.display_price}`,
              );

              return {
                value: packValue,
                label: packValue,
                price: matchingVariation.display_price,
                variationId: matchingVariation.variation_id,
                variation: matchingVariation,
              };
            })
            .filter(Boolean);
        }
      }

      if (packOptions.length === 0 && filteredVariations.length > 0) {
        // Fallback: If we couldn't match by attributes, create pack options based on the variations
        logger.log("Creating pack options directly from variations by price");

        // DHM has 10-pack, 30-pack, and 60-pack options
        const packNames = ["10-pack", "30-pack", "60-pack"];

        // Sort variations by price (low to high)
        filteredVariations.sort(
          (a, b) => parseFloat(a.display_price) - parseFloat(b.display_price),
        );

        packOptions = filteredVariations.map((variation, index) => {
          const packLabel =
            index < packNames.length ? packNames[index] : `Pack ${index + 1}`;

          return {
            value: packLabel,
            label: packLabel,
            price: variation.display_price,
            variationId: variation.variation_id,
            variation: variation,
          };
        });
      }

      logger.log("Final pack options:", packOptions);
      setAvailablePacks(packOptions);

      // Select first pack by default
      if (packOptions.length > 0) {
        handlePackSelection(packOptions[0]);
      } else {
        setSelectedPacks(null);
        setSelectedVariation(null);
        setVariationPrice("");
      }
    }
  }, [product, selectedFrequency, isLoading]);

  // Handle frequency selection
  const handleFrequencyChange = (frequency) => {
    logger.log("Changing frequency to:", frequency);
    setSelectedFrequency(frequency);
    setSelectedPacks(null);
    setSelectedVariation(null);
    setVariationPrice("");
  };

  // Handle pack selection - follows the PHP code pattern
  const handlePackSelection = (pack) => {
    logger.log("Selected pack:", pack);
    setSelectedPacks(pack.value);
    setVariationPrice(pack.price);
    setSelectedVariation({
      variationId: pack.variationId,
      variation: pack.variation,
    });
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!selectedVariation) return;

    try {
      setIsAddingToCart(true);

      if (!product || !product.id) {
        logger.error("No product ID available for adding to cart");
        return;
      }

      // Get product image URL
      const productImageUrl =
        product.images && product.images.length > 0
          ? product.images[0].src
          : product.image || "";

      // Extract variation ID exactly as in the PHP code
      const variationId = selectedVariation.variationId;

      // Prepare cart data with complete product details
      const cartData = {
        productId: product.id,
        quantity: 1,
        name: product.name || "DHM Blend",
        price: variationPrice,
        image: productImageUrl,
        product_type: product.type || "",
        variationId: variationId,
      };

      // Add variation details if available
      if (variationId && selectedVariation.variation?.attributes) {
        cartData.variation = Object.entries(
          selectedVariation.variation.attributes,
        ).map(([name, value]) => ({
          name: name.replace("attribute_", "").replace("pa_", ""),
          value: value,
        }));

        // For variable products, use variation ID as the product ID
        if (
          product.type === "variable" ||
          product.type === "variable-subscription"
        ) {
          logger.log(
            `Variable product detected, using variation ID ${variationId} as productId`,
          );
          cartData.productId = variationId;
        }
      }

      // Attribute values carry dose/strength, so log the ids only.
      logger.log("Adding to cart with data:", {
        productId: cartData.productId,
        variationId: cartData.variationId,
        quantity: cartData.quantity,
        attributeKeys: Object.keys(cartData.attributes || {}),
      });
      await addItemToCart(cartData);

      // Refresh the cart in the navbar
      document.getElementById("cart-refresher")?.click();

      // Show cart popup
      setShowCartPopup(true);
    } catch (error) {
      logger.error("Error adding item to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Return JSX component
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
        {/* Product Image Section */}
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <ProductImage
              src={
                product?.images?.[0]?.src ||
                product?.imageUrl ||
                "https://mycdn.myrocky.com/wp-content/uploads/20241231155604/DHMBlendPP.jpg"
              }
              alt={product?.name || "DHM Blend"}
              priority
            />
          </div>
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col">
          {/* Product Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold headers-font mb-1">
              {product?.name || "DHM Blend"}
            </h1>
            <p className="text-lg mb-4">The smarter way to recover!</p>
            <div
              className="text-gray-800 mb-5"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(
                  product?.description ||
                  "Science-backed formula with DHM, L-Cysteine, Milk Thistle, Prickly Pear, and Vitamin B Complex. DHM Blend is authorized for sale by FDA-Approved.",
                ),
              }}
            />
          </div>

          {/* Product Options */}
          <div className="space-y-6">
            {/* Frequency Selection - Following PHP pattern */}
            {frequencyOptions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-base font-medium">Frequency:</h3>
                <div className="grid grid-cols-1 gap-2">
                  {frequencyOptions.map((frequency) => (
                    <OptionButton
                      key={frequency}
                      selected={selectedFrequency === frequency}
                      onClick={() => handleFrequencyChange(frequency)}
                      className="py-[10px] px-4"
                      data-frequency={frequency}
                    >
                      {frequency === "one-time-purchase"
                        ? "One-time Purchase"
                        : frequency.replace(/-/g, " ")}
                    </OptionButton>
                  ))}
                </div>
                <p className="text-sm text-gray-600">Free Shipping</p>
              </div>
            )}

            {/* Packs Selection - Following PHP pattern */}
            <div
              className={`space-y-2 ${
                availablePacks.length === 0 ? "hidden" : ""
              }`}
            >
              <h3 className="text-base font-medium">How many packs?</h3>
              <div className="grid grid-cols-3 gap-2">
                {availablePacks.length === 0 && (
                  <span className="col-span-3 text-gray-400 text-center">
                    No packs available for this frequency.
                  </span>
                )}
                {availablePacks.map((pack) => (
                  <OptionButton
                    key={pack.value}
                    selected={selectedPacks === pack.value}
                    onClick={() => handlePackSelection(pack)}
                    className="py-[10px]"
                    data-pills={pack.value}
                    data-price={pack.price}
                    data-variation-id={pack.variationId}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span>{pack.label}</span>
                    </div>
                  </OptionButton>
                ))}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              className="w-full bg-black text-white py-3 px-6 rounded-full font-medium text-lg mb-6"
              onClick={handleAddToCart}
              disabled={!selectedVariation || isAddingToCart}
            >
              {isAddingToCart
                ? "Adding to Cart..."
                : `Add to Cart - $${formatPriceUI(variationPrice)}`}
            </button>

            {/* Ontario Logo */}
            <div className="border border-gray-300 rounded-lg py-2 px-4 flex justify-center">
              <img
                src="/OCP-IMGS.webp"
                alt="Logos"
                className="max-w-[240px] max-h-[40px] lg:max-w-[320px] lg:max-h-[48px]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cart Popup */}
      <CartPopup
        isOpen={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        productType={product?.type || null}
      />
    </div>
  );
};

export default DhmBlendProductDetails;
