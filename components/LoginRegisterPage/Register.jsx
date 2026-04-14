"use client";

import { useState, Suspense } from "react";
import { logger } from "@/utils/devLogger";
import Link from "next/link";
import {
  MdOutlineRemoveRedEye,
  MdOutlineVisibilityOff,
  MdArrowForward,
  MdArrowBack,
} from "react-icons/md";
import { toast } from "react-toastify";
import { useSearchParams, useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import DOBInput from "../shared/DOBInput";
import {
  getSavedProducts,
  clearSavedProducts,
} from "../../utils/crossSellCheckout";
import { processSavedFlowProducts } from "../../utils/flowCartHandler";
import { migrateLocalCartToServer, getLocalCart } from "@/lib/cart/cartService";
import {
  checkQuebecZonnicRestriction,
  getQuebecRestrictionMessage,
  isQuebecProvince,
} from "@/utils/zonnicQuebecValidation";
import CartMigrationOverlay from "@/components/CartMigrationOverlay";

import {
  ALL_US_STATES,
  PHASE_1_STATES,
  getStateLabel,
} from "@/lib/constants/usStates";
import Logo from "../Navbar/Logo";
import Image from "next/image";

const RegisterContent = ({ setActiveTab, registerRef }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMigratingCart, setIsMigratingCart] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    date_of_birth: "",
    province: "",
    gender: "",
  });
  const [datePickerValue, setDatePickerValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneError, setPhoneError] = useState("");
  const redirectTo = searchParams.get("redirect_to");

  // Password strength checks (live feedback)
  const pwdForRules =
    typeof formData.password === "string" ? formData.password : "";
  const passwordHasMinLength = pwdForRules.length >= 8;
  const passwordHasUppercase = /[A-Z]/.test(pwdForRules);
  const passwordHasLowercase = /[a-z]/.test(pwdForRules);
  const passwordHasNumberOrSymbol =
    /[0-9]/.test(pwdForRules) || /[^A-Za-z0-9]/.test(pwdForRules);
  const passwordHasCharacterMix =
    passwordHasUppercase && passwordHasLowercase && passwordHasNumberOrSymbol;
  const passwordStarted = pwdForRules.length > 0;
  const isEdFlow = searchParams.get("ed-flow") === "1";

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const genderOptions = [
    { value: "", label: "Select gender" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
  ];

  const handleCrossSellProducts = async (isFromCrossSell = false) => {
    try {
      logger.log(
        `Processing flow products after registration. From cross-sell: ${isFromCrossSell}`,
      );

      // First, check for new flow products (direct cart approach)
      // This should always be processed regardless of cross-sell popup origin
      const flowProductsResult = await processSavedFlowProducts();
      if (flowProductsResult.success) {
        logger.log(
          "Processed saved flow products after registration:",
          flowProductsResult,
        );
        return flowProductsResult.redirectUrl;
      }

      // Only process old cross-sell products if NOT from a cross-sell popup
      if (!isFromCrossSell) {
        // Fallback to old cross-sell products (URL-based approach)
        const savedProducts = getSavedProducts();

        if (savedProducts) {
          const products = [
            {
              id: savedProducts.mainProduct.id,
              quantity: 1,
            },
            ...savedProducts.addons.map((addon) => ({
              id: addon.id,
              quantity: 1,
            })),
          ];

          const response = await fetch("/api/cart/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ products }),
          });

          if (!response.ok) {
            logger.error("Failed to add cross-sell products to cart");
          }

          clearSavedProducts();

          return "/checkout?ed-flow=1";
        }
      }
    } catch (error) {
      logger.error("Error handling cross-sell products:", error);
    }

    return null;
  };

  const validateStep1 = () => {
    if (!formData.first_name || !formData.last_name) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!formData.email) {
      toast.error("Email address is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      toast.error("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      toast.error("Password must contain at least one number or symbol");
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.phone) {
      toast.error("Phone number is required");
      setPhoneError("Phone number is required");
      return false;
    }
    // Check if phone number contains only zeros
    const digitsOnly = formData.phone.replace(/\D/g, "");
    if (digitsOnly.length > 0 && /^0+$/.test(digitsOnly)) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    // Clear phone error if validation passes
    setPhoneError("");
    if (!formData.date_of_birth) {
      toast.error("Date of birth is required");
      return false;
    }
    if (!formData.province) {
      toast.error("Province is required");
      return false;
    }
    return true;
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (!validateStep1()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          register_step: 1,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentStep(2);
      } else {
        // Debug logging to help identify the issue
        logger.log("Register API Error Response:", {
          status: res.status,
          ok: res.ok,
          data: data,
          error: data.error,
        });

        toast.error(
          data.error || "Registration failed. Please check and try again.",
        );
      }
    } catch (err) {
      logger.error("Registration error:", err);
      toast.error("Registration failed. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackStep = () => {
    setCurrentStep(1);
  };

  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/\D/g, "");

    if (phoneNumber.length <= 3) {
      return `(${phoneNumber}`;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
        3,
        6,
      )}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({
      ...prev,
      phone: formattedPhoneNumber,
    }));

    // Validate dynamically as user types
    const digitsOnly = formattedPhoneNumber.replace(/\D/g, "");
    if (digitsOnly.length >= 10) {
      // Only validate if we have enough digits (complete phone number)
      if (/^0+$/.test(digitsOnly)) {
        setPhoneError("Please enter a valid phone number");
      } else {
        setPhoneError("");
      }
    } else if (phoneError) {
      // Clear error if user is still typing and hasn't reached 10 digits yet
      setPhoneError("");
    }
  };

  const handlePhoneBlur = () => {
    // Validate on blur (when user leaves the field)
    if (formData.phone) {
      const digitsOnly = formData.phone.replace(/\D/g, "");
      if (digitsOnly.length > 0 && /^0+$/.test(digitsOnly)) {
        setPhoneError("Please enter a valid phone number");
      } else if (digitsOnly.length > 0 && digitsOnly.length < 10) {
        setPhoneError("Please enter a valid phone number");
      } else {
        setPhoneError("");
      }
    }
  };

  const handleDateChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      date_of_birth: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      const dateParts = formData.date_of_birth.split("/");
      const formattedDate =
        dateParts.length === 3
          ? `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`
          : formData.date_of_birth;

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          date_of_birth: formattedDate,
          province: formData.province,
          gender: formData.gender,
          register_step: 2,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        logger.log(data.data.response);
        document.getElementById("cart-refresher")?.click();
        toast.success(data.message || "You registered successfully!");

        // Check if we came from a flow (for redirect logic)
        const isFromFlow =
          searchParams.get("ed-flow") === "1" ||
          searchParams.get("wl-flow") === "1" ||
          searchParams.get("hair-flow") === "1" ||
          searchParams.get("mh-flow") === "1";

        // Always check for local cart items and migrate if present
        // This is important because unauthenticated users add items to localStorage
        // and they need to be migrated after registration
        const localCart = getLocalCart();
        const hasLocalCartItems = localCart.items && localCart.items.length > 0;

        let migrateSuccess = false;
        if (hasLocalCartItems) {
          try {
            logger.log(
              `Starting cart migration process for new registration with ${localCart.items.length} items in local cart...`,
            );
            setIsMigratingCart(true);
            await migrateLocalCartToServer();
            migrateSuccess = true;
            logger.log("Cart migration completed successfully");

            // Now that migration is complete, refresh the cart display
            document.getElementById("cart-refresher")?.click();
            logger.log("Cart display refreshed after migration");

            // Dispatch a custom event to ensure cart is updated throughout the app
            const cartUpdatedEvent = new CustomEvent("cart-updated");
            document.dispatchEvent(cartUpdatedEvent);
          } catch (migrateError) {
            logger.error("Error migrating cart items:", migrateError);
            // Don't block registration flow if migration fails
            setIsMigratingCart(false);
          }
          // Note: We don't hide the overlay here for successful migrations
          // It will stay visible during the redirect delays and disappear when page navigates
        } else {
          logger.log("No local cart items to migrate after registration");
        }

        // Small delay to ensure cart migration has time to complete server-side
        if (migrateSuccess && redirectTo && redirectTo.includes("/checkout")) {
          logger.log(
            "Waiting for cart migration to complete before checkout redirect...",
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        let redirectPath;

        // Always check for saved flow products (new direct cart approach)
        // Only skip old cross-sell handling if we came from a cross-sell popup
        // Note: isFromFlow indicates flow parameter, but we still need to process
        // saved products if they exist (they're different from localStorage cart items)
        redirectPath = await handleCrossSellProducts(false);

        if (!redirectPath) {
          redirectPath = redirectTo || "/";
        }

        // Check for Quebec restriction after successful registration
        if (formData.province && isQuebecProvince(formData.province)) {
          try {
            // Fetch cart items to check for Zonnic products
            const cartResponse = await fetch("/api/cart");
            if (cartResponse.ok) {
              const cartData = await cartResponse.json();
              if (cartData.items && cartData.items.length > 0) {
                const restriction = checkQuebecZonnicRestriction(
                  cartData.items,
                  formData.province,
                  formData.province,
                );

                if (restriction.blocked) {
                  // Remove Zonnic products from cart
                  const zonnicItems = cartData.items.filter(
                    (item) =>
                      item.name && item.name.toLowerCase().includes("zonnic"),
                  );

                  for (const zonnicItem of zonnicItems) {
                    try {
                      await fetch("/api/cart", {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          itemKey: zonnicItem.key,
                        }),
                      });
                      logger.log(
                        `Removed Zonnic product ${zonnicItem.name} from cart due to Quebec restriction`,
                      );
                    } catch (removeError) {
                      logger.error(
                        "Error removing Zonnic product from cart:",
                        removeError,
                      );
                    }
                  }

                  // Store popup state in localStorage to show after redirect
                  localStorage.setItem("showQuebecPopup", "true");
                  localStorage.setItem(
                    "quebecPopupMessage",
                    getQuebecRestrictionMessage(),
                  );
                }
              }
            }
          } catch (error) {
            logger.error("Error checking cart for Quebec restriction:", error);
          }
        }

        router.push(redirectPath);
        setTimeout(() => {
          router.refresh();
        }, 300);

        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          confirm_password: "",
          phone: "",
          date_of_birth: "",
          province: "",
          gender: "",
        });
      } else {
        // Debug logging to help identify the issue
        logger.log("Register API Step 2 Error Response:", {
          status: res.status,
          ok: res.ok,
          data: data,
          error: data.error,
        });

        toast.error(
          data.error || "Registration failed. Please check and try again.",
        );
      }
    } catch (err) {
      logger.error("Registration error:", err);
      toast.error("Registration failed. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CartMigrationOverlay show={isMigratingCart} />
      <div className="px-3 mx-auto pt-5 text-center">
        <h2
          className={`text-[#251f20] ${
            isEdFlow ? "text-[24px]" : "text-[32px]"
          } headers-font font-[450] leading-[140%] max-w-[520px] mx-auto`}
        >
          {isEdFlow ? (
            <>
              Congratulations! <br className="md:hidden" /> You're just moments
              away from making ED a thing of the past.
            </>
          ) : (
            "Welcome to MyRocky"
          )}
        </h2>
        <h3 className="text-sm text-center font-normal pt-2 tracking-normal">
          Already have an account?
          <Link
            href={(() => {
              const currentParams = new URLSearchParams(
                searchParams.toString(),
              );
              currentParams.set("viewshow", "login");
              return `/login-register?${currentParams.toString()}`;
            })()}
            className="font-[400] text-[#AE7E56] underline ml-1"
          >
            Log in
          </Link>
        </h3>
      </div>

      <form onSubmit={currentStep === 1 ? handleNextStep : handleSubmit}>
        <div className="flex flex-col flex-wrap items-center justify-center mx-auto py-3 px-8 pt-5 w-[100%] max-w-[400px] space-y-4">
          {currentStep === 1 ? (
            <>
              <div className="flex flex-col md:flex-row md:gap-2 w-full space-y-4 md:space-y-0">
                <div className="w-full flex flex-col items-start justify-center gap-2">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    className="block w-[100%] rounded-[8px] h-[40px] text-md m-auto border-gray-500 border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent"
                    tabIndex="1"
                    placeholder="Your first name"
                    value={formData.first_name}
                    onChange={handleChange}
                    style={{ outlineColor: "black" }}
                    required
                  />
                </div>
                <div className="w-full flex flex-col items-start justify-center gap-2">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    className="block w-[100%] rounded-[8px] h-[40px] text-md m-auto border-gray-500 border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent"
                    tabIndex="1"
                    placeholder="Your last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    style={{ outlineColor: "black" }}
                    required
                  />
                </div>
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="block w-[100%] rounded-[8px] h-[40px] text-md m-auto border-gray-500 border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent"
                  tabIndex="1"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ outlineColor: "black" }}
                  required
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2 password-field">
                <label htmlFor="password">Password</label>
                <div className="w-full relative items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    name="password"
                    className="block w-[100%] rounded-[8px] h-[40px] text-md m-auto border-gray-500 border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent"
                    tabIndex="4"
                    autoComplete="off"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ outlineColor: "black" }}
                    required
                    minLength={8}
                  />
                  {showPassword ? (
                    <MdOutlineVisibilityOff
                      size={16}
                      className="absolute right-3 top-3 cursor-pointer"
                      onClick={togglePasswordVisibility}
                    />
                  ) : (
                    <MdOutlineRemoveRedEye
                      size={16}
                      className="absolute right-3 top-3 cursor-pointer"
                      onClick={togglePasswordVisibility}
                    />
                  )}
                </div>
                {/* Password requirements checklist */}
                <ul className="mt-1 text-[12px] list-none space-y-1 pl-0 w-full">
                  <li
                    className={`flex gap-2 items-start ${
                      passwordHasMinLength ? "text-green-600" : "text-black"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`shrink-0 w-4 text-center font-semibold leading-[1.25] ${
                        passwordHasMinLength ? "text-green-600" : "text-black"
                      }`}
                    >
                      {passwordHasMinLength ? "✓" : "○"}
                    </span>
                    <span>At least 8 characters</span>
                  </li>
                  <li
                    className={`flex gap-2 items-start ${
                      passwordHasCharacterMix ? "text-green-600" : "text-black"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`shrink-0 w-4 text-center font-semibold leading-[1.25] ${
                        passwordHasCharacterMix
                          ? "text-green-600"
                          : "text-black"
                      }`}
                    >
                      {passwordHasCharacterMix ? "✓" : "○"}
                    </span>
                    <span>
                      Include uppercase, lowercase, and a number or symbol
                    </span>
                  </li>
                </ul>
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2 password-field">
                <label htmlFor="confirm_password">Confirm Password</label>
                <div className="w-full relative items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    placeholder="Confirm your password"
                    name="confirm_password"
                    className="block w-[100%] rounded-[8px] h-[40px] text-md m-auto border-gray-500 border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent"
                    tabIndex="4"
                    autoComplete="off"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    style={{ outlineColor: "black" }}
                    required
                  />
                  {showConfirmPassword ? (
                    <MdOutlineVisibilityOff
                      size={16}
                      className="absolute right-3 top-3 cursor-pointer"
                      onClick={toggleConfirmPasswordVisibility}
                    />
                  ) : (
                    <MdOutlineRemoveRedEye
                      size={16}
                      className="absolute right-3 top-3 cursor-pointer"
                      onClick={toggleConfirmPasswordVisibility}
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-full flex items-start mb-2">
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="bg-transparent border-none cursor-pointer p-1 hover:bg-gray-100 rounded-full"
                  aria-label="Go back to previous step"
                >
                  <MdArrowBack size={24} />
                </button>
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`block w-[100%] rounded-[8px] h-[40px] text-md m-auto border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent ${
                    phoneError ? "border-red-500" : "border-gray-500"
                  }`}
                  placeholder="(___) ___-____"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  style={{ outlineColor: "black" }}
                  required
                  maxLength={14}
                />
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                )}
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <label htmlFor="date_of_birth">Date of Birth</label>
                <DOBInput
                  value={formData.date_of_birth}
                  onChange={handleDateChange}
                  className="block w-full rounded-[8px] h-[40px] text-md m-auto border-gray-500 border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent pr-10"
                  placeholder="mm/dd/yyyy"
                  minAge={18}
                  required
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <label htmlFor="province">State</label>
                <select
                  id="province"
                  name="province"
                  className="block w-[100%] rounded-[8px] h-[40px] text-md m-auto border-gray-500 border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent"
                  value={formData.province}
                  onChange={handleChange}
                  style={{ outlineColor: "black" }}
                  required
                >
                  {ALL_US_STATES.filter(
                    (option) =>
                      option.value === "" ||
                      PHASE_1_STATES.includes(option.value),
                  ).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  className="block w-[100%] rounded-[8px] h-[40px] text-md m-auto border-gray-500 border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent"
                  value={formData.gender}
                  onChange={handleChange}
                  style={{ outlineColor: "black" }}
                  required
                >
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="w-full flex justify-center items-center my-5">
            <button
              type="submit"
              className="bg-black text-white py-[12.5px] w-full rounded-full flex justify-center items-center"
              disabled={loading}
            >
              {currentStep === 1
                ? loading
                  ? "Processing..."
                  : "Continue"
                : loading
                  ? "Signing up..."
                  : "Complete Sign Up"}
              {!loading && <MdArrowForward className="ml-2" size={20} />}
            </button>
          </div>

          <div className="w-full text-center text-xs text-gray-600 mb-6 pt-[4rem]">
            <p className="mb-3">
              By continuing, you confirm that you've read and agree to our{" "}
              <Link href="/terms-of-use" className="text-[#AE7E56] underline">
                Terms and Conditions
              </Link>
              ,{" "}
              <Link href="/terms-of-use" className="text-[#AE7E56] underline">
                Professional Disclosure
              </Link>
              ,{" "}
              <Link href="/privacy-policy" className="text-[#AE7E56] underline">
                Privacy Policy
              </Link>
              ,{" "}
              <Link href="/terms-of-use" className="text-[#AE7E56] underline">
                Telehealth Consent
              </Link>{" "}
              and{" "}
              <Link
                href="/implied-consent"
                className="text-[#AE7E56] underline"
              >
                Implied Consent.
              </Link>
            </p>
            <p>
              We respect your privacy. All of your information is securely
              stored on our HIPAA Compliant server.
            </p>
          </div>
        </div>
      </form>
    </>
  );
};

export default function Register({ setActiveTab, registerRef }) {
  const logoContent = (
    <div className="h-[35px] w-[100px] relative ml-[0]">
      <Image
        src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
        alt="MyRocky Logo"
        fill
        className="object-contain"
      />
    </div>
  );
  return (
    <div suppressHydrationWarning>
      <style jsx global>{`
        #launcher {
          display: none !important;
        }
        iframe[title="Close message"] {
          display: none !important;
        }
        iframe[title="Message from company"] {
          display: none !important;
        }
      `}</style>
      <div className="py-4 px-4 max-w-[1140px] mx-auto ">
        <Link href="/" aria-label="MyRocky Homepage">
          {logoContent}
        </Link>
      </div>
      <hr className="border-gray-300" />
      <Suspense fallback={<Loader />}>
        <RegisterContent
          setActiveTab={setActiveTab}
          registerRef={registerRef}
        />
      </Suspense>
    </div>
  );
}
