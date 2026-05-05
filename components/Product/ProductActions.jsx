"use client";

import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import Link from "next/link";
import CartPopup from "../Cart/CartPopup";
import { addItemToCart } from "@/lib/cart/cartService";
import { addRequiredConsultation } from "@/utils/requiredConsultation";
import { analyticsService } from "@/utils/analytics/analyticsService";
import { formatPriceUI } from "@/utils/priceFormatter";
import {
  checkShippingRestriction,
  getUserState,
  isEdRestrictedProduct,
  isEdRestrictedSlug,
  isWlRestrictedProduct,
  isWlRestrictedSlug,
} from "@/utils/edShippingRestrictions";
import ProductNotAvailablePopup from "../Popups/ProductNotAvailablePopup";

const ProductActions = ({
  price = 90,
  selectedVariationPrice = null,
  productType = null,
  product = null,
  selectedVariation = null,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showRestrictionPopup, setShowRestrictionPopup] = useState(false);
  const [restrictedProductName, setRestrictedProductName] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserProfile(data);
          }
        }
      } catch (error) {
        logger.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Use the selectedVariationPrice if available, otherwise fall back to the default price
  const displayPrice =
    selectedVariationPrice !== null ? selectedVariationPrice : price;

  // Check if there's a sale price available
  const hasSalePrice =
    selectedVariation &&
    selectedVariation.sale_price &&
    Number(selectedVariation.sale_price) <
    Number(selectedVariation.regular_price);

  // If there's a sale price, use it, otherwise use the regular price
  const finalPrice = hasSalePrice
    ? Number(selectedVariation.sale_price)
    : displayPrice;


  const handleAddToCart = async () => {
    try {
      setIsLoading(true);

      if (!product || !product.id) {
        logger.error("No product ID available for adding to cart");
        return;
      }

      // Check for product shipping restrictions (ED or WL products)
      // Check both product name and slug
      const isRestrictedProduct =
        isEdRestrictedProduct(product.name) ||
        (product.slug && isEdRestrictedSlug(product.slug)) ||
        isWlRestrictedProduct(product.name) ||
        (product.slug && isWlRestrictedSlug(product.slug));

      logger.log(
        `[Product Restriction] Checking product - name: "${product.name}", slug: "${product.slug || 'N/A'}", isRestrictedProduct: ${isRestrictedProduct}`
      );

      if (isRestrictedProduct) {
        // Fetch user profile if not already loaded
        let profileData = userProfile;
        if (!profileData) {
          try {
            logger.log("[ED Restriction] Fetching user profile...");
            const response = await fetch("/api/profile");
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                profileData = data;
                setUserProfile(data);
                logger.log("[ED Restriction] User profile fetched:", {
                  shipping_state: data.shipping_state,
                  billing_state: data.billing_state,
                  province: data.province,
                });
              }
            }
          } catch (error) {
            logger.error("Error fetching user profile for restriction check:", error);
          }
        } else {
          logger.log("[ED Restriction] Using cached user profile:", {
            shipping_state: profileData.shipping_state,
            billing_state: profileData.billing_state,
            province: profileData.province,
          });
        }

        if (profileData) {
          const userState = getUserState(profileData);
          logger.log(
            `[Product Restriction] User state from profile: "${userState}"`
          );

          if (userState) {
            const isRestricted = checkShippingRestriction(userState, product);
            logger.log(
              `[Product Restriction] Check result for product "${product.name}" and state "${userState}": ${isRestricted}`
            );

            if (isRestricted) {
              logger.log(
                `[Product Restriction] BLOCKING: Product ${product.name} is restricted for state: ${userState}`
              );
              setIsLoading(false);
              setRestrictedProductName(product.name);
              setShowRestrictionPopup(true);
              return;
            }
          } else {
            logger.log(
              "[Product Restriction] No user state found in profile, allowing add to cart"
            );
          }
        } else {
          logger.log(
            "[Product Restriction] No user profile data available, allowing add to cart"
          );
        }
      }

      // --- FLOW DETECTION AND LOCALSTORAGE LOGIC ---
      const url = product.meta_data.find(
        (m) => m.key === "add_to_cart_url"
      )?.value;
      if (url && typeof window !== "undefined") {
        //const url = product.add_to_cart_url;
        logger.log("add to cart url", url);
        const flowMatch = url.match(
          /(ed-flow|hair-flow|wl-flow|smoking-flow|skincare-flow)=1/
        );
        if (flowMatch) {
          logger.log("flow match", flowMatch);
          const flowType = flowMatch[1];
          // Use selected variation ID if present, otherwise product ID
          const selectedId = selectedVariation?.variation_id || product.id;
          addRequiredConsultation(selectedId, flowType);
        }
      } else {
        logger.log("no add to cart url");
      }
      // --- END FLOW DETECTION AND LOCALSTORAGE LOGIC ---

      // Make sure we have the correct product image URL
      const productImageUrl =
        product.images && product.images.length > 0
          ? product.images[0].src
          : product.image || "";

      logger.log("Adding product to cart with details:", {
        id: product.id,
        name: product.name,
        price: finalPrice,
        image: productImageUrl,
      });

      // Prepare data for the cart addition with complete product details
      const cartData = {
        productId: product.id,
        quantity: 1,
        name: product.name || "Product",
        price: finalPrice,
        // Include product image if available - with fallback options
        image: productImageUrl,
        // Include product type
        product_type: product.type || "",
      };

      // Add variation information if selected
      if (selectedVariation) {
        logger.log("selectedVariation", selectedVariation);
        cartData.variationId =
          selectedVariation.variation_id || selectedVariation.id;

        // Add variation attributes for display
        if (selectedVariation.attributes) {
          cartData.variation = Object.entries(selectedVariation.attributes).map(
            ([name, value]) => ({
              name: name.replace("attribute_", "").replace("pa_", ""),
              value: value,
            })
          );
        }

        // Special handling for variable products where the variation ID should be used as product ID
        const isVariableProduct =
          product.type === "variable" ||
          product.type === "variable-subscription";

        // For variable products that aren't being converted to subscriptions,
        // use the variation ID as the product ID
        if (isVariableProduct && !cartData.convertToSub) {
          const varId = selectedVariation.variation_id || selectedVariation.id;
          logger.log(
            `Variable product detected, using variation ID ${varId} as productId for ${product.name || product.id
            }`
          );
          cartData.productId = varId;
        }
      }

      // Always set 'id' to the correct value for the API
      if (
        selectedVariation &&
        (product.type === "variable" ||
          product.type === "variable-subscription")
      ) {
        cartData.id = selectedVariation.variation_id || selectedVariation.id;
        logger.log(
          "variation id",
          selectedVariation.variation_id || selectedVariation.id
        );
      } else {
        cartData.id = product.id;
        logger.log("product id", product.id);
      }

      // Use the cart service instead of direct API call
      await addItemToCart(cartData);

      // Refresh the cart in the navbar
      document.getElementById("cart-refresher")?.click();

      // Track add_to_cart
      try {
        const productForTracking = {
          id: product.id,
          sku: product.sku,
          name: product.name,
          price: finalPrice,
          // Variant context for analytics
          variant_id:
            (selectedVariation &&
              (selectedVariation.variation_id || selectedVariation.id)) ||
            undefined,
          item_variant: selectedVariation?.attributes
            ? Object.entries(selectedVariation.attributes)
              .map(
                ([key, val]) =>
                  `${key
                    .replace(/^attribute_/, "")
                    .replace(/^pa_/, "")}: ${val}`
              )
              .join(", ")
            : "",
          // Pass through minimal attributes if variation selected
          attributes: selectedVariation?.attributes
            ? Object.entries(selectedVariation.attributes).map(
              ([key, val]) => ({
                name: key.replace(/^attribute_/, "").replace(/^pa_/, ""),
                options: [val],
              })
            )
            : [],
        };
        analyticsService.trackAddToCart(productForTracking, 1);
      } catch (e) {
        logger.warn("[Analytics] add_to_cart tracking skipped:", e);
      }

      // Show the cart popup on success
      setShowCartPopup(true);
    } catch (error) {
      logger.error("Error adding to cart:", error);
      alert("Error adding to cart: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Create button text with sale price if available
  const buttonText = `$${formatPriceUI(finalPrice)} Add to Cart`;

  // For displaying regular price strikethrough when on sale
  const regularPriceDisplay = hasSalePrice ? (
    <span className="text-gray-500 line-through text-sm ml-2">
      ${formatPriceUI(selectedVariation.regular_price)}
    </span>
  ) : null;

  return (
    <div>
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="w-full bg-black text-white py-[12px] px-4 text-base rounded-full hover:bg-gray-900 transition-colors duration-200 font-medium"
      >
        {isLoading ? "Adding to Cart..." : buttonText}
        {regularPriceDisplay}
      </button>

      <p className="text-gray-500 text-xs mt-2 text-center">
        *Only available if prescribed after an online consultation with a
        healthcare provider.
      </p>

      {/* Cart Popup */}
      <CartPopup
        isOpen={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        productType={productType}
      />

      {/* Product Not Available Popup */}
      <ProductNotAvailablePopup
        isOpen={showRestrictionPopup}
        onClose={() => setShowRestrictionPopup(false)}
        productName={restrictedProductName}
      />
    </div>
  );
};

export default ProductActions;
