"use client";

import { useState, Suspense, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "@/components/Loader";
import { MdOutlineRemoveRedEye, MdOutlineVisibilityOff } from "react-icons/md";
import {
  getSavedProducts,
  clearSavedProducts,
} from "../../utils/crossSellCheckout";
import { processSavedFlowProducts } from "../../utils/flowCartHandler";
import Link from "next/link";
import { migrateLocalCartToServer } from "@/lib/cart/cartService";
import GoogleSignInButton from "./GoogleSignInButton";
import CartMigrationOverlay from "@/components/CartMigrationOverlay";
import Image from "next/image";

const LoginContent = ({ setActiveTab, loginRef }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMigratingCart, setIsMigratingCart] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberme: false,
  });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  const redirectTo = searchParams.get("redirect_to");
  const isEdFlow = searchParams.get("ed-flow") === "1";
  const sessionExpired = searchParams.get("session_expired") === "1";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle adding saved cross-sell products to cart after login
  const handleCrossSellProducts = async () => {
    try {
      // Use direct cart approach for flow products
      const flowProductsResult = await processSavedFlowProducts();
      if (flowProductsResult.success) {
        logger.log(
          "Processed saved flow products after login:",
          flowProductsResult,
        );
        return flowProductsResult.redirectUrl;
      }

      // Check for legacy saved products and convert them to direct cart approach
      const savedProducts = getSavedProducts();

      if (savedProducts) {
        logger.log(
          "Converting legacy saved products to direct cart approach:",
          savedProducts,
        );

        // Determine the flow type from URL parameters or saved products
        const flowType =
          searchParams.get("ed-flow") === "1"
            ? "ed"
            : searchParams.get("wl-flow") === "1"
              ? "wl"
              : searchParams.get("hair-flow") === "1"
                ? "hair"
                : searchParams.get("mh-flow") === "1"
                  ? "mh"
                  : searchParams.get("skincare-flow") === "1"
                    ? "skincare"
                    : savedProducts.flowType || "ed"; // Use saved flow type or default to "ed"

        logger.log(
          "Using flow type for direct cart addition after login:",
          flowType,
        );

        // Import the appropriate flow function dynamically
        const { addToCartDirectly } =
          await import("../../utils/flowCartHandler");

        // Convert legacy saved products to direct cart addition
        const result = await addToCartDirectly(
          savedProducts.mainProduct,
          savedProducts.addons || [],
          flowType,
          { requireConsultation: true },
        );

        // Clear saved products
        clearSavedProducts();

        if (result.success) {
          logger.log("Legacy products converted and added to cart:", result);
          return result.redirectUrl;
        } else {
          logger.error("Failed to convert legacy products:", result.error);
        }
      }
    } catch (error) {
      logger.error("Error handling cross-sell products:", error);
    }

    return null;
  };

  // Validate form before submission
  const validateForm = () => {
    let valid = true;
    const newErrors = { username: "", password: "" };

    // Validate email
    if (!formData.username.trim()) {
      newErrors.username = "Email address is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.username)) {
      newErrors.username = "Please enter a valid email address";
      valid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // Handle Google Sign-In
  const handleGoogleSuccess = async (credentialResponse) => {
    setSubmitting(true);

    try {
      const id_token = credentialResponse.credential;

      const res = await fetch("/api/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token }),
      });

      const data = await res.json();

      logger.log("Google login response:", {
        status: res.status,
        data: data || "No data",
      });

      if (res.ok) {
        toast.success(
          data.message ||
            `Welcome back${
              data.userDisplayName ? ", " + data.userDisplayName : ""
            }!`,
        );

        // Migrate any localStorage cart items to the server cart
        try {
          logger.log("Starting cart migration process after Google login...");
          setIsMigratingCart(true);
          await migrateLocalCartToServer();
          logger.log("Cart migration completed successfully");

          // Refresh the cart display
          document.getElementById("cart-refresher")?.click();
          logger.log("Cart display refreshed after migration");

          // Dispatch a custom event to ensure cart is updated throughout the app
          const cartUpdatedEvent = new CustomEvent("cart-updated");
          document.dispatchEvent(cartUpdatedEvent);
        } catch (migrateError) {
          logger.error("Error migrating cart items:", migrateError);
          // Don't block login flow if migration fails
          setIsMigratingCart(false);
        }
        // Note: We don't hide the overlay here for successful migrations
        // It will stay visible during the redirect delays and disappear when page navigates

        // Handle cross-sell products
        const redirectPath = await handleCrossSellProducts();

        // Determine final redirect
        let finalRedirectPath = redirectPath;
        if (!finalRedirectPath) {
          if (redirectTo) {
            try {
              finalRedirectPath = decodeURIComponent(redirectTo);
            } catch (e) {
              logger.error("Error decoding redirectTo URL:", e);
              finalRedirectPath = redirectTo;
            }
          } else {
            finalRedirectPath = "/";
          }
        }

        logger.log(
          "Final redirect path after Google login:",
          finalRedirectPath,
        );

        // Add a small delay to ensure the success toast is visible before navigation
        setTimeout(() => {
          router.push(finalRedirectPath);
          setTimeout(() => {
            router.refresh();
          }, 300);
        }, 1500);
      } else {
        // Handle error responses
        let errorMessage =
          data.error || "Google sign-in failed. Please try again.";
        toast.error(errorMessage);
        logger.error("Google login error:", data);
      }
    } catch (err) {
      logger.error("Google login exception:", err);
      toast.error(
        "An error occurred during Google sign-in. Please try again later.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google sign-in was unsuccessful. Please try again.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Parse the response data
      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        logger.error("Error parsing response:", parseError);
        toast.error("Unable to connect to the server. Please try again later.");
        setSubmitting(false);
        return;
      }

      // Log the response for debugging (without causing errors if data is null)
      logger.log("Login response:", {
        status: res.status,
        data: data || "No data",
      });

      if (res.ok) {
        // We'll trigger the cart refresh AFTER migration, not here
        logger.log("🎉 LOGIN SUCCESS - About to show toast");
        sessionStorage.removeItem("sessionExpiredToastShown");
        if (data?.data?.name) {
          toast.success("You logged in successfully, " + data.data.name);
        } else {
          toast.success("You logged in successfully");
        }
        logger.log("🎉 LOGIN SUCCESS - Toast should be visible now");

        // Migrate any localStorage cart items to the server cart
        let migrateSuccess = false;
        try {
          logger.log("Starting cart migration process...");
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
          // Don't block login flow if migration fails
          setIsMigratingCart(false);
        }
        // Note: We don't hide the overlay here for successful migrations
        // It will stay visible during the redirect delays and disappear when page navigates

        // Small delay to ensure cart migration has time to complete server-side
        if (migrateSuccess && redirectTo && redirectTo.includes("/checkout")) {
          logger.log(
            "Waiting for cart migration to complete before checkout redirect...",
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Determine the redirect path after successful login
        let redirectPath;

        // Always check for saved products from cross-sell flows
        redirectPath = await handleCrossSellProducts();

        // If no redirect from cross-sell processing, use the provided redirect_to parameter
        if (!redirectPath) {
          if (redirectTo) {
            try {
              // Decode the redirectTo URL if it's encoded
              redirectPath = decodeURIComponent(redirectTo);
              logger.log("Decoded redirectTo:", redirectPath);
            } catch (e) {
              logger.error("Error decoding redirectTo URL:", e);
              redirectPath = redirectTo; // Use as-is if decoding fails
            }
          } else {
            // If no redirect_to parameter, check for flow-specific parameters
            const isFlow =
              searchParams.get("ed-flow") === "1" ||
              searchParams.get("wl-flow") === "1" ||
              searchParams.get("hair-flow") === "1" ||
              searchParams.get("mh-flow") === "1" ||
              searchParams.get("skincare-flow") === "1";

            if (isFlow) {
              // For flow-specific logins without a redirect_to parameter,
              // preserve all URL parameters when redirecting to checkout
              const params = new URLSearchParams(searchParams.toString());

              // Get all the cart-related parameters
              const cartParams = Array.from(params.entries()).filter(
                ([key]) =>
                  key.includes("onboarding-add-to-cart") ||
                  key.includes("convert_to_sub") ||
                  key.includes("dose_") ||
                  key.includes("quantity") ||
                  key.includes("add-product-subscription") ||
                  key.includes("variation_") ||
                  key.includes("ed-flow") ||
                  key.includes("wl-flow") ||
                  key.includes("hair-flow") ||
                  key.includes("mh-flow") ||
                  key.includes("skincare-flow"),
              );

              // Create a new URLSearchParams for checkout
              const checkoutParams = new URLSearchParams();
              cartParams.forEach(([key, value]) => {
                checkoutParams.append(key, value);
              });

              redirectPath = `/checkout?${checkoutParams.toString()}`;
              logger.log(
                "Created checkout URL with flow parameters:",
                redirectPath,
              );
            } else {
              // Default redirect to home
              redirectPath = "/";
            }
          }
        }

        logger.log("Final redirect path:", redirectPath);

        // Add a small delay to ensure the success toast is visible before navigation
        setTimeout(() => {
          // Use Next.js navigation for consistent behavior across all environments
          router.push(redirectPath);

          setTimeout(() => {
            router.refresh();
          }, 300);
        }, 1500); // 1.5 second delay to show the success toast
      } else {
        // Handle error responses - display error in toast notification
        let errorMessage =
          "Login failed. Please check your email and password and try again.";

        // Safely extract error message from response
        if (data) {
          // Handle specific error codes from WordPress API
          if (data.code === "incorrect_password") {
            errorMessage =
              "The password you entered is incorrect. Please try again.";
          } else if (
            data.code === "invalid_email" ||
            data.code === "invalid_username"
          ) {
            errorMessage = "Unknown email address. Please check and try again.";
          } else if (data.error) {
            // Use the error message from backend (strip HTML tags if present)
            errorMessage = data.error.replace(/<[^>]*>/g, "");
          } else if (data.message) {
            // Fallback to message field (strip HTML tags if present)
            errorMessage = data.message.replace(/<[^>]*>/g, "");
          }
        }

        // Always show a toast error regardless of the response structure
        toast.error(errorMessage);

        // Safely log error data
        //logger.error("Login error:", data || "No error data available");
      }
    } catch (err) {
      // Handle any unexpected errors during the fetch operation
      logger.error("Login exception:", err);
      toast.error("An error occurred during login. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  // Show session expired notification (only once per browser session)
  useEffect(() => {
    if (sessionExpired) {
      const alreadyShown = sessionStorage.getItem("sessionExpiredToastShown");
      if (!alreadyShown) {
        sessionStorage.setItem("sessionExpiredToastShown", "1");
        toast.info("Your session has expired. Please sign in to continue.", {
          autoClose: 5000,
        });
      }
    }
  }, [sessionExpired]);

  return (
    <>
      <CartMigrationOverlay show={isMigratingCart} />
      <div className="px-3 mx-auto pt-5 text-center">
        <h2 className="text-[#251f20] text-[32px] headers-font font-[450] leading-[44.80px]">
          Sign in to your account
        </h2>
        <h3 className="text-sm text-center font-normal pt-2 tracking-normal">
          Don't have an account?
          <a
            href={(() => {
              const currentParams = new URLSearchParams(
                searchParams.toString(),
              );
              currentParams.set("viewshow", "register");
              return `/login-register?${currentParams.toString()}`;
            })()}
            className="font-[400] text-[#AE7E56] underline ml-1"
          >
            Sign up
          </a>
        </h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col flex-wrap items-center justify-center mx-auto py-3 px-8 pt-5 w-[100%] max-w-[400px] space-y-4">
          <div className="w-full flex flex-col items-start justify-center gap-2">
            <label htmlFor="username">Email Address</label>
            <input
              type="email"
              id="username"
              name="username"
              className="block w-[100%] rounded-[8px] h-[40px] text-md m-auto border-gray-500 border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent"
              tabIndex="1"
              autoComplete="email"
              placeholder="Enter your email address"
              onChange={handleChange}
              style={{ outlineColor: "black" }}
            />
          </div>
          <div className="w-full flex flex-col items-start justify-center gap-2 password-field">
            <div className="flex flex-row justify-between items-center w-full">
              <label htmlFor="password">Password</label>
              {/* <Link
                href="/forgot-password"
                className="text-xs text-[#AE7E56] font-normal underline"
              >
                Forgot Password?
              </Link> */}
            </div>
            <div className="w-full relative items-center">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                name="password"
                className="block w-[100%] rounded-[8px] h-[40px] text-md m-auto border-gray-500 border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent"
                tabIndex="2"
                autoComplete="off"
                onChange={handleChange}
                style={{ outlineColor: "black" }}
              />
              {showPassword ? (
                <MdOutlineVisibilityOff
                  size={16}
                  className="absolute right-3 top-3 cursor-pointer"
                  onClick={togglePasswordVisibility}
                  aria-label="Hide password"
                />
              ) : (
                <MdOutlineRemoveRedEye
                  size={16}
                  className="absolute right-3 top-3 cursor-pointer"
                  onClick={togglePasswordVisibility}
                  aria-label="Show password"
                />
              )}
            </div>
            {errors.password && (
              <span className="text-red-500 text-sm">{errors.password}</span>
            )}
          </div>
          <div className="quiz-option flex w-full py-2 items-center justify-between">
            <div className="basis-1/2">
              <label
                htmlFor="rememberme"
                className=" text-left text-sm text-[#212121] flex items-center"
              >
                <input
                  type="checkbox"
                  id="rememberme"
                  className="rounded border-gray-500 relative"
                  name="rememberme"
                  value="1"
                  tabIndex="3"
                  onChange={handleChange}
                />
                &nbsp;Remember me
              </label>
            </div>
            <div className="basis-1/2">
              <Link
                href={`/forgot-password${
                  redirectTo ? "?redirect_to=" + redirectTo : ""
                }${isEdFlow ? (redirectTo ? "&" : "?") + "ed-flow=1" : ""}`}
                className="text-[#AE7E56] text-sm font-normal block text-right underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          <div className="w-full flex justify-center items-center my-5">
            <button
              type="submit"
              className="bg-black text-white py-[12.5px] w-full rounded-full"
              disabled={submitting}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center justify-center gap-4 my-4">
            <div className="h-[1px] bg-gray-300 flex-1"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="h-[1px] bg-gray-300 flex-1"></div>
          </div>

          {/* Google Sign-In Button */}
          <div className="w-full flex justify-center items-center">
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={submitting}
              isLoading={submitting}
            />
          </div>
        </div>
      </form>
    </>
  );
};

export default function Login({ setActiveTab, loginRef }) {
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
      <div className="py-4 px-4 max-w-[1140px] mx-auto ">
        <Link href="/" aria-label="MyRocky Homepage">
          {logoContent}
        </Link>
      </div>
      <hr className="border-gray-300" />
      <Suspense fallback={<Loader />}>
        <LoginContent setActiveTab={setActiveTab} loginRef={loginRef} />
      </Suspense>
    </div>
  );
}
