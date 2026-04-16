"use client";
import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";
import { VARIATION_TYPES } from "@/lib/constants/productTypes";
import {
  isForcedSubscriptionProduct,
  formatSubscriptionOptions,
} from "@/lib/utils/subscriptionUtils";
import { formatPrice } from "@/utils/priceFormatter";

const VariationButton = ({ selected, onClick, children, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-1 px-3 text-sm rounded-[8px] border-2 transition-all duration-200 ${
      disabled
        ? "border-[#CECECE] text-gray-400 cursor-not-allowed"
        : selected
          ? "border-[#AE7E56] text-[#AE7E56]"
          : "border-[#CECECE] hover:border-gray-400"
    }`}
  >
    {children}
  </button>
);

const SubscriptionOption = ({ option, selected, onSelect }) => {
  // Check if this is a hair product option
  const isHairOption = option.isHairProduct === true;

  if (isHairOption) {
    // For hair products, we need to show custom frequency label
    // Instead of "One Time Purchase", show the appropriate frequency
    // We'll format the label to "every X months for Y months" based on the attributes
    let frequencyLabel = option.originalLabel || "every 3 months for 24 months";

    return (
      <div
        className={`flex justify-between items-center p-3 rounded-lg border-2 transition-all duration-200 ${
          selected
            ? "border-[#A55255]"
            : "border-[#CECECE] hover:border-gray-400"
        }`}
      >
        <span className="font-medium text-sm mx-auto whitespace-nowrap">
          {frequencyLabel}
        </span>
      </div>
    );
  }

  // Unified design for all Lidocaine subscription options (and regular options)
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
        selected ? "border-[#AE7E56]" : "border-gray-300 text-gray-500"
      }`}
      onClick={() => onSelect(option)}
      style={{ cursor: "pointer" }}
    >
      <label className="flex items-center gap-2 cursor-pointer mb-0">
        <input
          type="radio"
          name="subscription-type"
          value={option.id}
          checked={selected}
          onChange={() => onSelect(option)}
          className="w-4 h-4"
        />
        <span
          className={`font-semibold ${
            selected ? "text-[#AE7E56]" : "text-black"
          }`}
        >
          {option.label.replace(/-/g, " ")}
        </span>
      </label>
      <span className="subscription-price text-black font-semibold">
        ${formatPrice(option.price)}
      </span>
    </div>
  );
};

// Special component for forced subscription products
const ForcedSubscriptionOptions = ({ options, selected, onSelect }) => {
  return (
    <div className="space-y-4" id="subscriptions">
      <h3 className="text-base font-medium">Select subscription</h3>
      <div className="flex flex-col space-y-2">
        {Array.isArray(options) &&
          options.map((option) => (
            <div
              key={option.id}
              className={`flex justify-between items-center p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                selected?.id === option.id
                  ? "border-[#A55255]"
                  : "border-[#CECECE] hover:border-gray-400"
              }`}
              onClick={() => onSelect(option)}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  value={option.id}
                  id={`convert_to_sub_${option.id}`}
                  name="convert_to_sub_forced_subscription"
                  checked={selected?.id === option.id}
                  onChange={() => onSelect(option)}
                  className="w-4 h-4"
                />
                <p className="font-medium text-sm whitespace-nowrap">
                  {option.label}
                </p>
              </div>

              {/* Display price information */}
              <div
                id="cart-button-price"
                className="subscription-price font-semibold"
              >
                ${formatPrice(option.price)}
                {option.sale_price &&
                  Number(option.sale_price) < Number(option.regular_price) && (
                    <span className="text-gray-400 line-through text-sm ml-2">
                      ${formatPrice(option.regular_price)}
                    </span>
                  )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const FrequencyOptions = ({ options, selected, onSelect }) => (
  <div className="space-y-2">
    <h3 className="text-base font-medium">Select frequency</h3>
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <VariationButton
          key={option.value}
          selected={selected === option.value}
          onClick={() => onSelect(option)}
        >
          {option.label}
        </VariationButton>
      ))}
    </div>
  </div>
);

const QuantityOptions = ({ options, selected, onSelect }) => (
  <div className="space-y-2">
    <h3 className="text-base font-medium">How many pills?</h3>
    <div className="grid grid-cols-4 gap-2">
      {[...options]
        .sort((a, b) => {
          // Sort by numeric value, extracting number from label
          const aNum = parseInt(a.label.split(" ")[0]);
          const bNum = parseInt(b.label.split(" ")[0]);
          return aNum - bNum; // Ascending order (4, 8, 12)
        })
        .map((option) => (
          <VariationButton
            key={option.value}
            selected={selected?.value === option.value}
            onClick={() => onSelect(option)}
          >
            {option.label.split(" ")[0]} tabs
          </VariationButton>
        ))}
    </div>
  </div>
);

const ProductVariations = ({
  type,
  variations,
  onVariationChange,
  productType,
  product,
}) => {
  // Use refs to track initialization state
  const didInit = useRef(false);
  const didNotifyParent = useRef(false);

  // Simplified state - initialized with null
  const [selectedFrequency, setSelectedFrequency] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  // Check if this is a forced subscription product
  const isForcedSubscription = product
    ? isForcedSubscriptionProduct(product)
    : false;

  // Format subscription options if needed
  const subscriptionOptions = isForcedSubscription
    ? formatSubscriptionOptions(
        product,
        Array.isArray(variations) ? variations : [],
      )
    : variations;

  // Helper function to sort quantities
  const sortQuantities = (quantities) => {
    if (!quantities || !Array.isArray(quantities)) return [];

    return [...quantities].sort((a, b) => {
      const aNum = parseInt(a.label.split(" ")[0]);
      const bNum = parseInt(b.label.split(" ")[0]);
      return aNum - bNum; // Ascending order (4, 8, 12)
    });
  };

  // Initialize on first render only
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    try {
      // Handle subscription type
      if (
        (type === VARIATION_TYPES.SUBSCRIPTION ||
          type === VARIATION_TYPES.HAIR) &&
        Array.isArray(subscriptionOptions) &&
        subscriptionOptions.length > 0
      ) {
        setSelectedSubscription(subscriptionOptions[0]);
      }
      // Handle frequency/quantity type
      else if (
        type === VARIATION_TYPES.QUANTITY &&
        subscriptionOptions?.frequency &&
        subscriptionOptions.frequency.length > 0
      ) {
        const firstFreq = subscriptionOptions.frequency[0];
        setSelectedFrequency(firstFreq);

        if (
          subscriptionOptions.quantities &&
          subscriptionOptions.quantities[firstFreq.value]?.length > 0
        ) {
          // Sort quantities and select the first one (lowest)
          const sortedQuantities = sortQuantities(
            subscriptionOptions.quantities[firstFreq.value],
          );
          setSelectedQuantity(sortedQuantities[0]);
        }
      }
    } catch (e) {
      logger.error("Error initializing variations:", e);
    }
  }, []);

  // Notify parent after state is set and stable
  useEffect(() => {
    if (didNotifyParent.current) return;

    // Only proceed if we have valid data to send
    let hasValidData = false;
    let dataToSend = {};

    if (
      (type === VARIATION_TYPES.SUBSCRIPTION ||
        type === VARIATION_TYPES.HAIR) &&
      selectedSubscription
    ) {
      dataToSend = { subscription: selectedSubscription };
      hasValidData = true;
    } else if (
      type === VARIATION_TYPES.QUANTITY &&
      selectedFrequency &&
      selectedQuantity
    ) {
      dataToSend = {
        frequency: selectedFrequency,
        quantity: selectedQuantity,
      };
      hasValidData = true;
    }

    if (
      hasValidData &&
      onVariationChange &&
      typeof onVariationChange === "function"
    ) {
      // Mark as notified to prevent multiple notifications
      didNotifyParent.current = true;
      onVariationChange(dataToSend);
    }
  }, [
    selectedFrequency,
    selectedQuantity,
    selectedSubscription,
    onVariationChange,
    type,
  ]);

  // Safe handlers with proper error checking
  const handleFrequencySelect = (frequency) => {
    if (!frequency) return;

    setSelectedFrequency(frequency);

    // Reset notification flag to allow updated data to be sent
    didNotifyParent.current = false;

    // Reset quantity when frequency changes
    if (
      variations?.quantities &&
      variations.quantities[frequency.value]?.length > 0
    ) {
      // Sort quantities and select the first one (lowest)
      const sortedQuantities = sortQuantities(
        variations.quantities[frequency.value],
      );
      setSelectedQuantity(sortedQuantities[0]);
    } else {
      setSelectedQuantity(null);
    }
  };

  const handleQuantitySelect = (quantity) => {
    if (!quantity) return;
    setSelectedQuantity(quantity);

    // Reset notification flag to allow updated data to be sent
    didNotifyParent.current = false;
  };

  const handleSubscriptionSelect = (subscription) => {
    if (!subscription) return;
    setSelectedSubscription(subscription);

    // Reset notification flag to allow updated data to be sent
    didNotifyParent.current = false;
  };

  // Check if a variation has a sale price
  const hasSalePrice = (option) => {
    return (
      option.sale_price &&
      option.regular_price &&
      Number(option.sale_price) < Number(option.regular_price)
    );
  };

  // Get the display price for a variation (sale price if available, otherwise regular price)
  const getDisplayPrice = (option) => {
    if (hasSalePrice(option)) {
      return option.sale_price;
    }
    return option.price || 0;
  };

  // Special render for forced subscription products
  if (
    isForcedSubscription &&
    (type === VARIATION_TYPES.SUBSCRIPTION || type === VARIATION_TYPES.HAIR)
  ) {
    return (
      <ForcedSubscriptionOptions
        options={subscriptionOptions}
        selected={selectedSubscription}
        onSelect={handleSubscriptionSelect}
      />
    );
  }

  // Render logic for hair products
  if (
    type === VARIATION_TYPES.HAIR ||
    (type === VARIATION_TYPES.SUBSCRIPTION &&
      subscriptionOptions?.some((v) => v.isHairProduct))
  ) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-medium">Select frequency</h3>
        <div className="flex flex-col space-y-2">
          {Array.isArray(subscriptionOptions) &&
            subscriptionOptions.map((option) => (
              <div
                key={option.id}
                className={`flex justify-between items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                  selectedSubscription?.id === option.id
                    ? "border-[#A55255]"
                    : "border-[#CECECE] hover:border-gray-400"
                }`}
                onClick={() => handleSubscriptionSelect(option)}
              >
                <span className="font-medium text-sm whitespace-nowrap">
                  {option.originalLabel ||
                    option.label ||
                    "every 3 months for 24 months"}
                </span>

                {/* Display price information for hair products */}
                {option.price && (
                  <div className="subscription-price font-semibold">
                    $
                    {formatPrice(
                      hasSalePrice(option) ? option.sale_price : option.price,
                    )}
                    {hasSalePrice(option) && (
                      <span className="text-gray-400 line-through text-sm ml-2">
                        ${formatPrice(option.regular_price)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Render logic for subscription type
  if (type === VARIATION_TYPES.SUBSCRIPTION) {
    // Check if this is a lidocaine product by checking the first option's label
    const isLidocaineProduct =
      Array.isArray(subscriptionOptions) &&
      subscriptionOptions.length > 0 &&
      (subscriptionOptions[0].label === "One Time Purchase" ||
        subscriptionOptions.some(
          (option) =>
            option.label.includes("(30g)") || option.label.includes("(90g)"),
        ));

    return (
      <div className="space-y-4">
        <h3 className="text-base font-medium">Please choose one</h3>

        {isLidocaineProduct ? (
          // Vertical layout for lidocaine products (one per row)
          <div className="flex flex-col space-y-2">
            {subscriptionOptions.map((option) => (
              <SubscriptionOption
                key={option.id}
                option={option}
                selected={selectedSubscription?.id === option.id}
                onSelect={handleSubscriptionSelect}
              />
            ))}
          </div>
        ) : (
          // Vertical layout for regular products
          Array.isArray(subscriptionOptions) &&
          subscriptionOptions.map((option) => (
            <SubscriptionOption
              key={option.id}
              option={option}
              selected={selectedSubscription?.id === option.id}
              onSelect={handleSubscriptionSelect}
            />
          ))
        )}
      </div>
    );
  }

  // Render logic for quantity/frequency type
  return (
    <div className="space-y-6">
      {variations?.frequency && (
        <FrequencyOptions
          options={variations.frequency}
          selected={selectedFrequency?.value}
          onSelect={handleFrequencySelect}
        />
      )}

      {selectedFrequency &&
        variations?.quantities &&
        variations.quantities[selectedFrequency.value] && (
          <QuantityOptions
            options={variations.quantities[selectedFrequency.value]}
            selected={selectedQuantity}
            onSelect={handleQuantitySelect}
          />
        )}
    </div>
  );
};

export default ProductVariations;
