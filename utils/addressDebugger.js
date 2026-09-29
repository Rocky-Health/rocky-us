import { logger } from "@/utils/devLogger";

/**
 * Debug utility for troubleshooting address data issues
 */
export const debugAddressData = () => {
  if (typeof window === "undefined") {
    logger.log("❌ Window not available (server-side)");
    return;
  }

  logger.log("🔍 === ADDRESS DATA DEBUG ===");
  
  try {
    // Check localStorage
    const billingStored = localStorage.getItem("checkout_billing_address");
    const shippingStored = localStorage.getItem("checkout_shipping_address");
    
    logger.log("📦 localStorage billing_address present:", Boolean(billingStored));
    logger.log("📦 localStorage shipping_address present:", Boolean(shippingStored));
    
    if (billingStored) {
      try {
        const parsed = JSON.parse(billingStored);
        logger.log("✅ Parsed billing address fields:", Object.keys(parsed));
        logger.log("🏠 Billing address_1 length:", parsed.address_1?.length || 0);
      } catch (e) {
        logger.log("❌ Error parsing billing address:", e);
      }
    }
    
    if (shippingStored) {
      try {
        const parsed = JSON.parse(shippingStored);
        logger.log("✅ Parsed shipping address fields:", Object.keys(parsed));
        logger.log("🏠 Shipping address_1 length:", parsed.address_1?.length || 0);
      } catch (e) {
        logger.log("❌ Error parsing shipping address:", e);
      }
    }
    
    // Check cookies
    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split("=");
      acc[name] = value;
      return acc;
    }, {});
    
    logger.log("🍪 Relevant cookies:", {
      displayName: cookies.displayName ? decodeURIComponent(cookies.displayName) : "Not found",
      userName: cookies.userName ? decodeURIComponent(cookies.userName) : "Not found",
      authToken: cookies.authToken ? "Present" : "Not found",
      userId: cookies.userId ? "Present" : "Not found",
    });
    
  } catch (error) {
    logger.log("❌ Error in address debug:", error);
  }
  
  logger.log("🔍 === END ADDRESS DEBUG ===");
};

/**
 * Clear all address data from localStorage
 */
export const clearAddressData = () => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem("checkout_billing_address");
    localStorage.removeItem("checkout_shipping_address");
    logger.log("🧹 Cleared all address data from localStorage");
  } catch (error) {
    logger.log("❌ Error clearing address data:", error);
  }
};

/**
 * Manually set test address data
 */
export const setTestAddressData = () => {
  if (typeof window === "undefined") return;
  
  const testBilling = {
    first_name: "John",
    last_name: "Doe", 
    address_1: "123 Main Street",
    address_2: "Apt 4B",
    city: "New York",
    state: "NY",
    postcode: "10001",
    country: "US",
    email: "john.doe@example.com",
    phone: "555-123-4567",
    date_of_birth: "1990-01-15"
  };
  
  try {
    localStorage.setItem("checkout_billing_address", JSON.stringify(testBilling));
    localStorage.setItem("checkout_shipping_address", JSON.stringify(testBilling));
    logger.log("✅ Set test address data");
    debugAddressData();
  } catch (error) {
    logger.log("❌ Error setting test address data:", error);
  }
};

/**
 * Test address input to simulate the "Po Box Av" issue
 */
export const testAddressTruncation = () => {
  if (typeof window === "undefined") return;
  
  const testAddress = "Po Box Av";
  logger.log("🧪 Testing address truncation with:", `"${testAddress}"`);
  
  // Simulate form input
  const addressInput = document.querySelector('input[name="address_1"]');
  if (addressInput) {
    addressInput.value = testAddress;
    addressInput.dispatchEvent(new Event('input', { bubbles: true }));
    addressInput.dispatchEvent(new Event('change', { bubbles: true }));
    logger.log("✅ Address input updated via DOM");
  } else {
    logger.log("❌ Could not find address input field");
  }
  
  // Check localStorage after a delay
  setTimeout(() => {
    debugAddressData();
  }, 1000);
};

/**
 * Monitor form data changes in real-time
 */
export const monitorFormData = () => {
  if (typeof window === "undefined") return;
  
  logger.log("🔍 Starting form data monitoring...");
  
  // Monitor input changes
  const addressInput = document.querySelector('input[name="address_1"]');
  if (addressInput) {
    const originalValue = addressInput.value;
    logger.log("📍 Initial address length:", originalValue?.length || 0);
    
    // Add event listeners to monitor changes
    ['input', 'change', 'blur', 'focus'].forEach(eventType => {
      addressInput.addEventListener(eventType, (e) => {
        logger.log(`📝 ${eventType.toUpperCase()} event - Address length:`, e.target.value?.length || 0);
      });
    });
    
    // Monitor value changes via polling
    let lastValue = originalValue;
    const monitor = setInterval(() => {
      const currentValue = addressInput.value;
      if (currentValue !== lastValue) {
        logger.log("🔄 Address length changed (polling):", lastValue?.length || 0, "→", currentValue?.length || 0);
        lastValue = currentValue;
      }
    }, 500);
    
    // Stop monitoring after 30 seconds
    setTimeout(() => {
      clearInterval(monitor);
      logger.log("⏹️ Stopped form data monitoring");
    }, 30000);
    
    logger.log("✅ Form data monitoring active for 30 seconds");
  } else {
    logger.log("❌ Could not find address input field for monitoring");
  }
};

// Make functions available globally for console debugging
if (typeof window !== "undefined") {
  window.debugAddressData = debugAddressData;
  window.clearAddressData = clearAddressData;
  window.setTestAddressData = setTestAddressData;
  window.testAddressTruncation = testAddressTruncation;
  window.monitorFormData = monitorFormData;
}
