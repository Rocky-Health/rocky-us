import BillingDetails from "./BillingDetails";
import ShippingAddress from "./ShippingAddress";
import OrderNotes from "./OrderNotes";
import SelectDelivery from "./SelectDelivery";
import Link from "next/link";
import { logger } from "@/utils/devLogger";

const BillingAndShipping = ({
  setFormData,
  formData,
  onProvinceChange,
  cartItems,
  isUpdatingShipping,
  onAgeValidation,
  onAgeValidationReset,
  variant = "default",
}) => {
  const isGlp2 = variant === "glp2";
  const handleBillingAddressChange = (e, fromAutocomplete = false) => {
    // Debug logging for STATE changes
    if (e.target.name === "state") {
      logger.log("=== BILLING STATE CHANGE ===");
      logger.log("New billing state:", e.target.value);
      logger.log(
        "Current shipping state BEFORE change:",
        formData.shipping_address?.state,
      );
      logger.log(
        "Ship to different address?:",
        formData.shipping_address?.ship_to_different_address,
      );
    }

    // Debug logging for address changes
    if (e.target.name === "address_1") {
      logger.log("=== BILLING ADDRESS_1 CHANGE ===");
      logger.log("Field name:", e.target.name);
      logger.log("Value length:", e.target.value?.length || 0);
      logger.log("From autocomplete:", fromAutocomplete);

      // Additional check: if value is very short and we have existing longer address, warn about potential issue
      const currentAddress = formData.billing_address?.address_1 || "";
      if (
        currentAddress.length > 5 &&
        e.target.value.length < 3 &&
        !fromAutocomplete
      ) {
        logger.warn("⚠️ WARNING: Short address value detected!");
        logger.warn("⚠️ Current address length:", currentAddress.length);
        logger.warn("⚠️ New value length:", e.target.value.length);
        logger.warn("⚠️ This might be user typing or a bug!");
      }

      logger.log("=== END BILLING ADDRESS_1 CHANGE ===");
    }

    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        billing_address: {
          ...prev.billing_address,
          [e.target.name]: e.target.value,
        },
      };

      // Debug log the updated form data for address_1 changes
      if (e.target.name === "address_1") {
        logger.log(
          "Updated billing_address_1 length in formData:",
          updatedFormData.billing_address.address_1?.length || 0,
        );
      }

      // Debug log for STATE changes
      if (e.target.name === "state") {
        logger.log(
          "AFTER setFormData - Shipping state:",
          updatedFormData.shipping_address?.state,
        );
        logger.log(
          "AFTER setFormData - Billing state:",
          updatedFormData.billing_address?.state,
        );

        // Clear empty address fields if state changed (not from autocomplete)
        if (!fromAutocomplete) {
          const fieldsToCheck = ["postcode", "city", "address_2", "address_1"];
          fieldsToCheck.forEach((field) => {
            // If field is empty or just whitespace, explicitly set it to empty string
            const fieldValue = prev.billing_address?.[field];
            if (fieldValue && typeof fieldValue === "string") {
              updatedFormData.billing_address[field] = "";
            }
          });
        }
      }

      return updatedFormData;
    });

    // Check for Quebec restriction when province changes
    // Call onProvinceChange to trigger update-customer API call with cleared empty fields
    // handleProvinceChange already handles clearing fields when shouldClearFields=true
    if (e.target.name === "state" && onProvinceChange) {
      // Pass shouldClearFields as false when coming from autocomplete
      onProvinceChange(e.target.value, "billing", !fromAutocomplete);
    }
  };

  const handleShippingAddressChange = (e, fromAutocomplete = false) => {
    // Debug logging for shipping STATE changes
    if (e.target.name === "state") {
      logger.log("=== SHIPPING STATE CHANGE ===");
      logger.log("New shipping state:", e.target.value);
      logger.log("From autocomplete:", fromAutocomplete);
    }

    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
          [e.target.name]: e.target.value,
        },
      };

      // Debug log for STATE changes
      if (e.target.name === "state") {
        logger.log(
          "AFTER setFormData - Shipping state:",
          updatedFormData.shipping_address?.state,
        );
        logger.log(
          "AFTER setFormData - Billing state:",
          updatedFormData.billing_address?.state,
        );

        // Clear empty address fields if state changed (not from autocomplete)
        if (!fromAutocomplete) {
          const fieldsToCheck = ["postcode", "city", "address_2", "address_1"];
          fieldsToCheck.forEach((field) => {
            // If field is empty or just whitespace, explicitly set it to empty string
            const fieldValue = prev.shipping_address?.[field];
            if (fieldValue && typeof fieldValue === "string") {
              updatedFormData.shipping_address[field] = "";
            }
          });
        }
      }

      return updatedFormData;
    });

    // Check for Quebec restriction when province changes
    if (e.target.name === "state" && onProvinceChange) {
      // Pass shouldClearFields as false when coming from autocomplete
      onProvinceChange(e.target.value, "shipping", !fromAutocomplete);
    }
  };
  const handleAnotherShippingAddressChange = (e) => {
    logger.log("=== SHIP TO DIFFERENT ADDRESS CHECKBOX ===");
    logger.log("Checkbox name:", e.target.name);
    logger.log("Checkbox checked:", e.target.checked);

    setFormData((prev) => {
      const updated = {
        ...prev,
        shipping_address: {
          ...prev.shipping_address,
          [e.target.name]: e.target.checked,
        },
      };
      logger.log(
        "Updated formData.shipping_address.ship_to_different_address:",
        updated.shipping_address.ship_to_different_address,
      );
      return updated;
    });
  };
  const handleOrderNotesChange = (e) => {
    setFormData((prev) => {
      return {
        ...prev,
        customer_note: e.target.value,
      };
    });
  };
  const handleSelectDeliveryChange = (e) => {
    setFormData((prev) => {
      return {
        ...prev,
        extensions: {
          ...prev.extensions,
          "checkout-fields-for-blocks": {
            ...prev.extensions["checkout-fields-for-blocks"],
            [e.target.name]: e.target.checked,
          },
        },
      };
    });
  };
  return (
    <div
      className={
        isGlp2
          ? "w-full h-full px-0 mt-6 md:mt-8 overflow-x-hidden"
          : "w-full lg:max-w-[640px] h-full justify-self-end px-4 mt-8 lg:mt-0 lg:pr-[80px] lg:pt-[50px] overflow-x-hidden"
      }
    >
      {!isGlp2 && (
        <div className="pb-[16px] md:pb-[32px]">
          <button
            onClick={() => (window.location.href = "/cart")}
            className="flex gap-[8px] items-center cursor-pointer w-fit"
          >
            <span className="w-[32px] h-[32px] md:w-[40px] md:h-[40px] rounded-full border border-[#E2E2E1] flex items-center justify-center">
              <svg
                width="20px"
                height="20px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path
                    d="M15 7L10 12L15 17"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></path>
                </g>
              </svg>
            </span>
            <p className="text-[14px] font-[500] text-[#212121] leading-[19.6px] md:pt-1">
              Back to Cart
            </p>
          </button>
        </div>
      )}
      {isGlp2 ? (
        <>
          <h1 className="text-[22px] md:text-[26px] text-[#251F20] pb-1 headers-font">
            Enter your shipping address
          </h1>
          <p className="text-sm text-[#616161] mb-5">Your privacy guaranteed</p>
        </>
      ) : (
        <>
          <h1 className="text-[24px] md:text-[32px] leading-[33.6px] md:leading-[44.8px] tracking-[-0.01em] md:tracking-[-0.02em] text-[#251F20] font-[450] pb-[16px] headers-font border-b border-[#E2E2E1] md:border-none">
            Checkout
          </h1>
          <h3 className="text-[16px] md:text-[20px] leading-[19.2px] md:leading-[24px] text-[#251F20] text-start my-[16px] md:mb-[40px] font-[500]">
            Billing details
          </h3>
        </>
      )}
      <div
        id="checkout-section-contact"
        data-hm-ignore
        className={
          isGlp2
            ? "p-4 md:p-6 w-full rounded-[16px] border border-solid border-[#E2E2E1] mb-4 bg-white"
            : "p-4 md:p-6 lg:w-[512px] rounded-[16px] border border-solid border-[#E2E2E1] mb-4"
        }
      >
        <BillingDetails
          formData={formData}
          setFormData={setFormData}
          handleBillingAddressChange={handleBillingAddressChange}
          isUpdatingShipping={isUpdatingShipping}
          onAgeValidation={onAgeValidation}
          onAgeValidationReset={onAgeValidationReset}
          cartItems={cartItems}
          onProvinceChange={onProvinceChange}
        />
        <ShippingAddress
          handleAnotherShippingAddressChange={
            handleAnotherShippingAddressChange
          }
          formData={formData}
          handleShippingAddressChange={handleShippingAddressChange}
          isUpdatingShipping={isUpdatingShipping}
        />
        <OrderNotes handleOrderNotesChange={handleOrderNotesChange} />
        <SelectDelivery
          formData={formData}
          handleSelectDeliveryChange={handleSelectDeliveryChange}
        />
      </div>
    </div>
  );
};

export default BillingAndShipping;
