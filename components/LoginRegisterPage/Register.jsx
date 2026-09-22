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
import { encryptPasswordWithServerKey } from "@/utils/encryptPasswordWithServerKey";
import FieldError, { fieldInputClass, fieldLabelClass } from "./FieldError";

import {
  ALL_US_STATES,
  PHASE_1_STATES,
  getStateLabel,
} from "@/lib/constants/usStates";
import Logo from "../Navbar/Logo";
import Image from "next/image";
import PhoneInput from "@/components/PhoneInput";

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
    const newErrors = {};
    let valid = true;

    if (!formData.first_name) {
      newErrors.first_name = "Please enter your first name";
      valid = false;
    }
    if (!formData.last_name) {
      newErrors.last_name = "Please enter your last name";
      valid = false;
    }
    if (!formData.email) {
      newErrors.email = "Email address is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
      valid = false;
    } else if (
      !/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
    ) {
      newErrors.password =
        "Password must contain at least one number or symbol";
      valid = false;
    }
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const validateStep2 = () => {
    const newErrors = {};
    let valid = true;

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
      valid = false;
    } else {
      const digitsOnly = formData.phone.replace(/\D/g, "");
      if (digitsOnly.length < 10 || /^0+$/.test(digitsOnly)) {
        newErrors.phone = "Please enter a valid phone number";
        valid = false;
      }
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
      valid = false;
    }
    if (!formData.province) {
      newErrors.province = "State is required";
      valid = false;
    }
    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleNextStep = async (e) => {
    e.preventDefault();
    if (!validateStep1()) {
      return;
    }

    setLoading(true);

    try {
      let isEncryptedPassword = false;
      const encryptResult = await encryptPasswordWithServerKey(
        formData.password,
      );
      if (encryptResult.error) {
        isEncryptedPassword = false;
        logger.error(
          "Error fetching private or public keys:",
          encryptResult.statusText,
        );
      }
      const { encryptedPassword } = encryptResult;
      if (encryptedPassword) {
        isEncryptedPassword = true;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: isEncryptedPassword ? encryptedPassword : formData.password,
          register_step: 1,
          isEncryptedPassword,
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

  const handlePhoneChange = (formatted) => {
    setFormData((prev) => ({ ...prev, phone: formatted }));
    // Clear external error while user is typing
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleDateChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      date_of_birth: value,
    }));
    if (errors.date_of_birth) {
      setErrors((prev) => ({ ...prev, date_of_birth: "" }));
    }
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

      let isEncryptedPassword = false;
      const encryptResult = await encryptPasswordWithServerKey(
        formData.password,
      );
      if (encryptResult.error) {
        isEncryptedPassword = false;
        logger.error(
          "Error fetching private or public keys:",
          encryptResult.statusText,
        );
      }
      const { encryptedPassword } = encryptResult;
      if (encryptedPassword) {
        isEncryptedPassword = true;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: isEncryptedPassword ? encryptedPassword : formData.password,
          phone: formData.phone,
          date_of_birth: formattedDate,
          province: formData.province,
          gender: formData.gender,
          register_step: 2,
          isEncryptedPassword,
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
          searchParams.get("mh-flow") === "1" ||
          searchParams.get("longevity-flow") === "1";

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

        // setFormData({
        //     first_name: "",
        //     last_name: "",
        //     email: "",
        //     password: "",
        //     confirm_password: "",
        //     phone: "",
        //     date_of_birth: "",
        //     province: "",
        //     gender: "",
        // });
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

      <form noValidate onSubmit={currentStep === 1 ? handleNextStep : handleSubmit}>
        <div className="flex flex-col flex-wrap items-center justify-center mx-auto py-3 px-8 pt-5 w-[100%] max-w-[400px] space-y-4">
          {currentStep === 1 ? (
            <>
              <div className="flex flex-col md:flex-row md:gap-2 w-full space-y-4 md:space-y-0">
                <div className="w-full flex flex-col items-start justify-center gap-2">
                  <label
                    htmlFor="first_name"
                    className={fieldLabelClass(errors.first_name)}
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    className={fieldInputClass(errors.first_name)}
                    tabIndex="1"
                    placeholder="Your first name"
                    value={formData.first_name}
                    onChange={handleChange}
                    style={{ outlineColor: "black" }}
                    required
                  />
                  <FieldError message={errors.first_name} className="-mt-1.5" />
                </div>
                <div className="w-full flex flex-col items-start justify-center gap-2">
                  <label
                    htmlFor="last_name"
                    className={fieldLabelClass(errors.last_name)}
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    className={fieldInputClass(errors.last_name)}
                    tabIndex="1"
                    placeholder="Your last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    style={{ outlineColor: "black" }}
                    required
                  />
                  <FieldError message={errors.last_name} className="-mt-1.5" />
                </div>
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <label htmlFor="email" className={fieldLabelClass(errors.email)}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={fieldInputClass(errors.email)}
                  tabIndex="1"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ outlineColor: "black" }}
                  required
                />
                <FieldError message={errors.email} className="-mt-1.5" />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2 password-field">
                <label
                  htmlFor="password"
                  className={fieldLabelClass(errors.password)}
                >
                  Password
                </label>
                <div className="w-full relative items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Enter your password"
                    name="password"
                    className={fieldInputClass(errors.password)}
                    tabIndex="4"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    style={{ outlineColor: "black" }}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <MdOutlineVisibilityOff size={16} />
                    ) : (
                      <MdOutlineRemoveRedEye size={16} />
                    )}
                  </button>
                </div>
                <FieldError message={errors.password} className="-mt-1.5" />
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
                <label
                  htmlFor="confirm_password"
                  className={fieldLabelClass(errors.confirm_password)}
                >
                  Confirm Password
                </label>
                <div className="w-full relative items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    placeholder="Confirm your password"
                    name="confirm_password"
                    className={fieldInputClass(errors.confirm_password)}
                    tabIndex="4"
                    autoComplete="new-password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    style={{ outlineColor: "black" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <MdOutlineVisibilityOff size={16} />
                    ) : (
                      <MdOutlineRemoveRedEye size={16} />
                    )}
                  </button>
                </div>
                <FieldError
                  message={errors.confirm_password}
                  className="-mt-1.5"
                />
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
                <label htmlFor="phone" className={fieldLabelClass(errors.phone)}>
                  Phone Number
                </label>
                <PhoneInput
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  error={errors.phone || undefined}
                  required
                  className="w-full"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <label
                  htmlFor="date_of_birth"
                  className={fieldLabelClass(errors.date_of_birth)}
                >
                  Date of Birth
                </label>
                <DOBInput
                  value={formData.date_of_birth}
                  onChange={handleDateChange}
                  className={`${fieldInputClass(errors.date_of_birth)} pr-10`}
                  placeholder="mm/dd/yyyy"
                  minAge={18}
                  required
                />
                <FieldError
                  message={errors.date_of_birth}
                  className="-mt-1.5"
                />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <label
                  htmlFor="province"
                  className={fieldLabelClass(errors.province)}
                >
                  State
                </label>
                <select
                  id="province"
                  name="province"
                  className={fieldInputClass(errors.province)}
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
                <FieldError message={errors.province} className="-mt-1.5" />
              </div>
              <div className="w-full flex flex-col items-start justify-center gap-2">
                <label htmlFor="gender" className={fieldLabelClass(errors.gender)}>
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className={fieldInputClass(errors.gender)}
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
                <FieldError message={errors.gender} className="-mt-1.5" />
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
