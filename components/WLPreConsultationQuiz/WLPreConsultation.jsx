"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import QuestionnaireNavbar from "../EdQuestionnaire/QuestionnaireNavbar";
import { ProgressBar } from "../EdQuestionnaire/ProgressBar";
import { useProductsWithAvailability } from "./productData";
import { stepConfig, determineRecommendedProduct } from "./utils/stepUtils";
import { addToCartEarly } from "@/utils/flowCartHandler";
import ProductNotAvailablePopup from "../Popups/ProductNotAvailablePopup";

// Import Step Components
import WeightConcerns from "./steps/WeightConcerns";
import DescribeDiet from "./steps/DescribeDeit";
import WeightLossGoalStep from "./steps/WeightLossGoalStep";
import WeightLossMotivationStep from "./steps/WeightLossMotivationStep";
import WeightLossResultsStep from "./steps/WeightLossResultsStep";
import ProvinceSelectionStep from "./steps/ProvinceSelectionStep";
import AgeVerificationStep from "./steps/AgeVerificationStep";
import BMICalculatorStep from "./steps/BMICalculatorStep";
import MedicalConditionsStep from "./steps/MedicalConditionsStep";
import MedicationsStep from "./steps/MedicationsStep";
import EatingDisorderStep from "./steps/EatingDisorderStep";
import PregnancyStep from "./steps/PregnancyStep";
import NeedlePreferenceStep from "./steps/NeedlePreferenceStep";
import ProductRecommendationsStep from "./steps/ProductRecommendationsStep";

// Import Popup Components
import WarningPopupWrapper from "./popups/WarningPopupWrapper";
import CrossSellPopupWrapper from "./popups/CrossSellPopupWrapper";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";
import { trackMetaProductSelection, logMetaTrackingError } from "@/utils/metaQuestionnaireTracking";

const WeightQuestionnaire = () => {
  // Core navigation state
  const [currentPage, setCurrentPage] = useState(1);

  useQuestionnaireStepTracking({
    questionnaireId: "wl-pre-consultation-v1",
    stepId: currentPage,
    stepIndex: currentPage,
    flowId: "weight-loss",
    stepType: "pre-consultation",
  });

  const [progressPercent, setProgressPercent] = useState(20);

  // Products data
  const { products: PRODUCTS, loading: productsLoading } =
    useProductsWithAvailability();

  // User data state
  const [userData, setUserData] = useState({
    height: { feet: 5, inches: 3 },
    weight: "",
    bmi: 0,
    weightDuration: "",
    weightGoal: "",
    province: "",
    dateOfBirth: "",
    selectedWeightGoalText: "16-50 lbs",
    gender: null, // ✅ Start with null, wait for API response
    needlePreference: "",
    weightConcernsDuration: "",
    dietDescription: "",
  });

  // Product selection state
  const [productState, setProductState] = useState({
    recommended: null,
    alternatives: [],
    selected: null,
    showMoreOptions: false,
  });

  // Popup visibility state
  const [popups, setPopups] = useState({
    bmi: false,
    medicalCondition: false,
    medication: false,
    eatingDisorder: false,
    pregnancy: false,
    rybelsus: false,
  });

  // Validation state
  const [validationState, setValidationState] = useState({
    bmiContinueEnabled: false,
    provinceContinueEnabled: false,
    dobContinueEnabled: false,
    isAcknowledged: true,
  });

  // For cross-sell popup
  const [showCrossSellPopup, setShowCrossSellPopup] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [initialCartData, setInitialCartData] = useState(null);

  // For shipping restriction popup
  const [showRestrictionPopup, setShowRestrictionPopup] = useState(false);
  const [restrictedProductName, setRestrictedProductName] = useState("");

  useEffect(() => {
    checkFinalStep();
    fetchUserGender();
  }, []);

  // Fetch user gender from API
  const fetchUserGender = async () => {
    try {
      // Fetch user profile data from API (same endpoint as Checkout uses)
      const response = await fetch("/api/profile");

      if (!response.ok) {
        logger.error("Failed to fetch user profile", response.status);
        // Fallback to male for WL when no login is made (show normal popup instead of women's addons)
        setUserData((prevData) => ({
          ...prevData,
          gender: "male",
        }));
        return;
      }

      const profileData = await response.json();

      if (profileData.success && profileData.gender) {
        logger.log("✅ Successfully fetched gender:", profileData.gender);
        setUserData((prevData) => ({
          ...prevData,
          gender: profileData.gender.toLowerCase(),
        }));
      } else {
        logger.warn("⚠️ No gender found in profile response, using default");
        // Fallback to male for WL when no login is made (show normal popup instead of women's addons)
        setUserData((prevData) => ({
          ...prevData,
          gender: "male",
        }));
      }
    } catch (error) {
      logger.error("❌ Error fetching user profile:", error);
      // Fallback to male if API call fails (show normal popup instead of women's addons)
      setUserData((prevData) => ({
        ...prevData,
        gender: "male",
      }));
    }
  };

  // Check if we need to show the final step
  const checkFinalStep = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("step") && urlParams.get("step") === "final") {
      setCurrentPage(13);
      urlParams.delete("step");
      const newUrl =
        window.location.pathname +
        (urlParams.toString() ? "?" + urlParams.toString() : "");
      window.history.replaceState({}, "", newUrl);
    }
  };

  // Handle step navigation
  const goToStep = (step) => {
    setCurrentPage(step);
    updateProgressBar(step);
  };

  // Update progress bar based on current step
  const updateProgressBar = (step) => {
    setProgressPercent(stepConfig.progressMap[step] || 0);
  };

  // Handle back button click
  const handleBackClick = () => {
    const prevStep = stepConfig.previousStep[currentPage] || 1;
    goToStep(prevStep);
  };

  // Weight Concerns Step Handler
  const handleWeightConcernsSelect = (option) => {
    setUserData((prev) => ({ ...prev, weightConcernsDuration: option }));

    // Check if localStorage data exists, update it or create new
    const existingData = localStorage.getItem("wl_pre_quiz_data");
    const updatedData = existingData
      ? { ...JSON.parse(existingData), weightConcernsDuration: option }
      : { weightConcernsDuration: option };

    localStorage.setItem("wl_pre_quiz_data", JSON.stringify(updatedData));

    goToStep(2);
  };

  // Diet Description Step Handler
  const handleDietDescriptionSelect = (option) => {
    setUserData((prev) => ({ ...prev, dietDescription: option }));

    const existingData = JSON.parse(
      localStorage.getItem("wl_pre_quiz_data") || "{}"
    );
    const updatedData = {
      ...existingData,
      dietDescription: option,
    };
    localStorage.setItem("wl_pre_quiz_data", JSON.stringify(updatedData));

    goToStep(3);
  };

  // BMI Step Handlers
  const handleBMIContinue = () => {
    if (userData.bmi >= 27) {
      const quizData = {
        weightPounds: userData.weight,
        feetValue: userData.height.feet,
        inchesValue: userData.height.inches,
        bmi_result: userData.bmi,
      };

      // Check if localStorage data exists, update it or create new
      const existingData = localStorage.getItem("wl_pre_quiz_data");
      const updatedData = existingData
        ? { ...JSON.parse(existingData), ...quizData }
        : quizData;

      localStorage.setItem("wl_pre_quiz_data", JSON.stringify(updatedData));
      goToStep(4);
    } else {
      setPopups((prev) => ({ ...prev, bmi: true }));
    }
  };

  // Weight Loss Goal Step Handler
  const handleWeightLossGoalSelect = (option) => {
    setUserData((prev) => ({ ...prev, weightGoal: option }));

    const existingData = JSON.parse(
      localStorage.getItem("wl_pre_quiz_data") || "{}"
    );
    const updatedData = {
      ...existingData,
      weightGoal: option,
    };
    localStorage.setItem("wl_pre_quiz_data", JSON.stringify(updatedData));

    goToStep(5);
  };

  // Weight Loss Motivation Step Handler
  const handleWeightLossMotivationContinue = () => {
    goToStep(6);
  };

  // Weight Loss Results Step Handler
  const handleWeightLossResultsContinue = () => {
    goToStep(7);
  };

  // Province Selection Step Handler
  const handleProvinceSelect = (province) => {
    setUserData((prev) => ({ ...prev, province }));

    const existingData = JSON.parse(
      localStorage.getItem("wl_pre_quiz_data") || "{}"
    );
    const updatedData = {
      ...existingData,
      province: province,
    };
    localStorage.setItem("wl_pre_quiz_data", JSON.stringify(updatedData));

    goToStep(8);
  };

  // Age Verification Step Handler
  const handleAgeVerificationSelect = (dateOfBirth) => {
    setUserData((prev) => ({ ...prev, dateOfBirth }));

    const existingData = JSON.parse(
      localStorage.getItem("wl_pre_quiz_data") || "{}"
    );
    const updatedData = {
      ...existingData,
      dateOfBirth: dateOfBirth,
    };
    localStorage.setItem("wl_pre_quiz_data", JSON.stringify(updatedData));

    goToStep(9);
  };

  // Medical Conditions Step Handler
  const handleMedicalConditionSelect = (condition) => {
    const existingData = JSON.parse(
      localStorage.getItem("wl_pre_quiz_data") || "{}"
    );
    const updatedData = {
      ...existingData,
      pre_quiz_q1: condition,
    };
    localStorage.setItem("wl_pre_quiz_data", JSON.stringify(updatedData));

    if (condition === "None of these apply to me") {
      goToStep(10);
    } else {
      setPopups((prev) => ({ ...prev, medicalCondition: true }));
    }
  };

  // Medications Step Handler
  const handleMedicationSelect = (medication) => {
    const existingData = JSON.parse(
      localStorage.getItem("wl_pre_quiz_data") || "{}"
    );
    const updatedData = {
      ...existingData,
      pre_quiz_q2: medication,
    };
    localStorage.setItem("wl_pre_quiz_data", JSON.stringify(updatedData));

    if (medication === "None of the above") {
      goToStep(11);
    } else {
      setPopups((prev) => ({ ...prev, medication: true }));
    }
  };

  // Eating Disorder Step Handler
  const handleEatingDisorderSelect = (option) => {
    const existingData = JSON.parse(
      localStorage.getItem("wl_pre_quiz_data") || "{}"
    );
    const updatedData = {
      ...existingData,
      pre_quiz_q3: option,
    };
    localStorage.setItem("wl_pre_quiz_data", JSON.stringify(updatedData));

    if (option === "No") {
      goToStep(12);
    } else {
      setPopups((prev) => ({ ...prev, eatingDisorder: true }));
    }
  };

  // Pregnancy Step Handler
  const handlePregnancySelect = (option) => {
    const existingData = JSON.parse(
      localStorage.getItem("wl_pre_quiz_data") || "{}"
    );
    const updatedData = {
      ...existingData,
      pre_quiz_q4: option,
    };
    localStorage.setItem("wl_pre_quiz_data", JSON.stringify(updatedData));

    if (option === "None of the above") {
      goToStep(13);
    } else {
      setPopups((prev) => ({ ...prev, pregnancy: true }));
    }
  };

  const handleNeedlePreferenceSelect = (option) => {
    setUserData((prev) => ({ ...prev, needlePreference: option }));

    const existingData = JSON.parse(
      localStorage.getItem("wl_pre_quiz_data") || "{}"
    );
    const updatedData = {
      ...existingData,
      "wl-pew-6": option,
      pre_quiz_q5: option,
    };
    localStorage.setItem("wl_pre_quiz_data", JSON.stringify(updatedData));

    goToStep(14);
  };

  // Product Selection Handlers
  const handleProductSelect = (product) => {
    setProductState((prev) => ({ ...prev, selected: product }));
  };

  const handleContinueClick = async () => {
    if (productState.selected?.name === "Rybelsus") {
      setPopups((prev) => ({ ...prev, rybelsus: true }));
    } else {
      // Add product to cart before showing cross-sell popup
      setIsAddingToCart(true);
      try {
        const mainProduct = {
          id: productState.selected.id,
          name: productState.selected.name,
          price: productState.selected.price,
          image: productState.selected.image || productState.selected.url, // WL products use 'url' field
          quantity: 1,
          isSubscription: productState.selected.isSubscription || false,
          // Add variation data for display
          variation: [
            {
              attribute: "Subscription Type",
              value:
                productState.selected.supply ||
                productState.selected.frequency ||
                "Monthly Supply",
            },
          ],
        };

        logger.log("🛒 WL Flow - Adding product to cart early:", mainProduct);

        // Add product to cart early (includes Body Optimization Program)
        const result = await addToCartEarly(mainProduct, "wl", {
          requireConsultation: true,
        });

        if (result.success) {
          logger.log("✅ Product added to cart, redirecting to checkout");

          // Store the cart data to pass to the modal
          if (result.cartData) {
            setInitialCartData(result.cartData);
          }

          // Go directly to checkout instead of showing cross-sell popup
          setIsAddingToCart(false);

          // Redirect to checkout
          // Use redirectUrl (for authenticated) or checkoutUrl (backwards compat), or generate URL
          const checkoutUrl =
            result.redirectUrl ||
            result.checkoutUrl ||
            "/checkout?wl-flow=1" +
            (result.authenticationRequired === false ? "&onboarding=1" : "");
          window.location.href = checkoutUrl;
        } else {
          logger.error("❌ Failed to add product to cart:", result.error);
          setIsAddingToCart(false);

          // Check if this is a shipping restriction error
          if (result.restricted) {
            setRestrictedProductName(productState.selected.name);
            setShowRestrictionPopup(true);
          } else {
            alert(
              result.error || "Failed to add product to cart. Please try again."
            );
          }
        }
      } catch (error) {
        logger.error("Error adding product to cart:", error);
        setIsAddingToCart(false);
        alert(
          "There was an issue adding the product to cart. Please try again."
        );
      }
    }
  };

  // Handle checkout from cross-sell popup
  const handleCheckout = (checkoutUrl) => {
    setShowCrossSellPopup(false);

    try {
      trackMetaProductSelection({
        flow_id: "weight-loss",
        questionnaire_id: "wl-pre-consultation-v1",
        content_id: String(productState.selected?.id || ""),
        selection_type: "product",
        selection_value: productState.selected?.id || "",
      });
    } catch (err) {
      logMetaTrackingError(err, { flow_id: "weight-loss", questionnaire_id: "wl-pre-consultation-v1", milestone: "PRODUCT_SELECTION" });
    }

    // The direct checkout handling will now be managed by the CrossSellPopupBase component
    // using the enhanced addToCartAndRedirect function with the "wl" flow type
  };

  // Popup Action Handlers
  const handleRybelusPopupAction = async (choice) => {
    if (choice === "choose-for-me") {
      // User chose Ozempic instead of Rybelsus
      const ozempicProduct = PRODUCTS.OZEMPIC;
      setProductState((prev) => ({ ...prev, selected: ozempicProduct }));
      setPopups((prev) => ({ ...prev, rybelsus: false }));

      // Add Ozempic to cart before showing cross-sell popup
      setIsAddingToCart(true);
      try {
        const mainProduct = {
          id: ozempicProduct.id,
          name: ozempicProduct.name,
          price: ozempicProduct.price,
          image: ozempicProduct.image || ozempicProduct.url,
          quantity: 1,
          isSubscription: ozempicProduct.isSubscription || false,
          variation: [
            {
              attribute: "Subscription Type",
              value:
                ozempicProduct.supply ||
                ozempicProduct.frequency ||
                "Monthly Supply",
            },
          ],
        };

        logger.log(
          "🛒 WL Flow - Adding Ozempic to cart (chosen instead of Rybelsus):",
          mainProduct
        );

        const result = await addToCartEarly(mainProduct, "wl", {
          requireConsultation: true,
        });

        if (result.success) {
          logger.log("✅ Ozempic added to cart, redirecting to checkout");

          if (result.cartData) {
            setInitialCartData(result.cartData);
          }

          // Go directly to checkout instead of showing cross-sell popup
          setIsAddingToCart(false);

          // Redirect to checkout
          // Use redirectUrl (for authenticated) or checkoutUrl (backwards compat), or generate URL
          const checkoutUrl =
            result.redirectUrl ||
            result.checkoutUrl ||
            "/checkout?wl-flow=1" +
            (result.authenticationRequired === false ? "&onboarding=1" : "");
          window.location.href = checkoutUrl;
        } else {
          logger.error("❌ Failed to add Ozempic to cart:", result.error);
          setIsAddingToCart(false);

          // Check if this is a shipping restriction error
          if (result.restricted) {
            setRestrictedProductName(ozempicProduct.name);
            setShowRestrictionPopup(true);
          } else {
            alert(
              result.error || "Failed to add product to cart. Please try again."
            );
          }
        }
      } catch (error) {
        logger.error("Error adding Ozempic to cart:", error);
        setIsAddingToCart(false);
        alert(
          "There was an issue adding the product to cart. Please try again."
        );
      }
    } else if (choice === "continue-with-rybelsus") {
      // User confirmed they want Rybelsus
      setPopups((prev) => ({ ...prev, rybelsus: false }));

      // Add Rybelsus to cart before showing cross-sell popup
      setIsAddingToCart(true);
      try {
        const mainProduct = {
          id: productState.selected.id,
          name: productState.selected.name,
          price: productState.selected.price,
          image: productState.selected.image || productState.selected.url,
          quantity: 1,
          isSubscription: productState.selected.isSubscription || false,
          variation: [
            {
              attribute: "Subscription Type",
              value:
                productState.selected.supply ||
                productState.selected.frequency ||
                "Monthly Supply",
            },
          ],
        };

        logger.log("🛒 WL Flow - Adding Rybelsus to cart:", mainProduct);

        const result = await addToCartEarly(mainProduct, "wl", {
          requireConsultation: true,
        });

        if (result.success) {
          logger.log("✅ Rybelsus added to cart, redirecting to checkout");

          if (result.cartData) {
            setInitialCartData(result.cartData);
          }

          // Go directly to checkout instead of showing cross-sell popup
          setIsAddingToCart(false);

          // Redirect to checkout
          // Use redirectUrl (for authenticated) or checkoutUrl (backwards compat), or generate URL
          const checkoutUrl =
            result.redirectUrl ||
            result.checkoutUrl ||
            "/checkout?wl-flow=1" +
            (result.authenticationRequired === false ? "&onboarding=1" : "");
          window.location.href = checkoutUrl;
        } else {
          logger.error("❌ Failed to add Rybelsus to cart:", result.error);
          setIsAddingToCart(false);
          alert(
            result.error || "Failed to add product to cart. Please try again."
          );
        }
      } catch (error) {
        logger.error("Error adding Rybelsus to cart:", error);
        setIsAddingToCart(false);
        alert(
          "There was an issue adding the product to cart. Please try again."
        );
      }
    }
  };

  // Calculate progress for progress bar
  const maxPage = 14;
  const progress = Math.max(10, Math.ceil((currentPage / maxPage) * 100));

  // Render current step based on currentPage
  const renderCurrentStep = () => {
    switch (currentPage) {
      case 1:
        return <WeightConcerns onOptionSelect={handleWeightConcernsSelect} />;
      case 2:
        return <DescribeDiet onOptionSelect={handleDietDescriptionSelect} />;
      case 3:
        return (
          <BMICalculatorStep
            userData={userData}
            setUserData={setUserData}
            validationState={validationState}
            setValidationState={setValidationState}
            onContinue={handleBMIContinue}
          />
        );
      case 4:
        return (
          <WeightLossGoalStep onOptionSelect={handleWeightLossGoalSelect} />
        );
      case 5:
        return (
          <WeightLossMotivationStep
            weightGoal={userData.weightGoal}
            onContinue={handleWeightLossMotivationContinue}
          />
        );
      case 6:
        return (
          <WeightLossResultsStep onContinue={handleWeightLossResultsContinue} />
        );
      case 7:
        return (
          <ProvinceSelectionStep onProvinceSelect={handleProvinceSelect} />
        );
      case 8:
        return (
          <AgeVerificationStep onDateSelect={handleAgeVerificationSelect} />
        );
      case 9:
        return (
          <MedicalConditionsStep
            onConditionSelect={handleMedicalConditionSelect}
          />
        );
      case 10:
        return <MedicationsStep onMedicationSelect={handleMedicationSelect} />;
      case 11:
        return (
          <EatingDisorderStep onOptionSelect={handleEatingDisorderSelect} />
        );
      case 12:
        return <PregnancyStep onOptionSelect={handlePregnancySelect} />;
      case 13:
        return (
          <ProductRecommendationsStep
            products={PRODUCTS}
            selectedProduct={productState.selected}
            setSelectedProduct={handleProductSelect}
            showMoreOptions={productState.showMoreOptions}
            setShowMoreOptions={(value) =>
              setProductState((prev) => ({ ...prev, showMoreOptions: value }))
            }
            onContinue={handleContinueClick}
            isLoading={isAddingToCart}
          />
        );
      default:
        return null;
    }
  };

  // Format product data for the cross-sell popup
  const formatProductForPopup = (product) => {
    if (!product) return null;

    // Ensure the product ID is properly included
    return {
      ...product,
      id: product.id, // Ensure ID is explicitly included
      imageUrl: product.url, // Map 'url' property to 'imageUrl' for the popup component
    };
  };

  return (
    <div className="flex flex-col h-screen bg-white subheaders-font font-medium">
      <QuestionnaireNavbar
        onBackClick={handleBackClick}
        currentPage={currentPage}
      />
      {currentPage !== 13 && <ProgressBar progress={progress} />}
      <div className="quiz-page-wrapper relative w-full md:w-[520px] mx-auto bg-[#FFFFFF] flex-1">
        {renderCurrentStep()}
      </div>

      {/* Warning Popups */}
      <WarningPopupWrapper
        popups={popups}
        setPopups={setPopups}
        onPopupActions={{
          rybelusAction: handleRybelusPopupAction,
        }}
        currentPage={currentPage}
      />

      {/* Cross-Sell Popup - COMMENTED OUT */}
      {/* {showCrossSellPopup && (
        <CrossSellPopupWrapper
          isOpen={showCrossSellPopup}
          userData={userData}
          selectedProduct={formatProductForPopup(productState.selected)}
          onCheckout={handleCheckout}
          onClose={() => setShowCrossSellPopup(false)}
          initialCartData={initialCartData}
        />
      )} */}

      {/* Styles */}
      <style jsx>{`
        @keyframes fade-out {
          0% {
            opacity: 1;
            transform: translateX(0);
          }

          100% {
            opacity: 0;
            transform: translateX(-100vw);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateX(100vw);
          }

          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .fade-out {
          animation: fade-out ease-in 250ms forwards;
        }

        .fade-in {
          animation: fade-in ease-in 250ms forwards;
        }

        .calc-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 10px;
          border-radius: 5px;
          background: #d3d3d3;
          outline: none;
          opacity: 0.7;
          -webkit-transition: 0.2s;
          transition: opacity 0.2s;
          max-width: 350px;
        }

        .calc-slider:hover {
          opacity: 1;
        }

        .calc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #814b00;
          cursor: pointer;
        }

        .calc-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #814b00;
          cursor: pointer;
        }

        [type="checkbox"]:checked,
        [type="radio"]:checked {
          background-color: #fffbf7 !important;
          background-image: url("https://myrocky-dev.testmg.us/wp-content/uploads/2024/02/quiz-checkmark-removebg-preview.png") !important;
          background-size: 59% !important;
          border: 1px #814b00 solid !important;
          outline: 1px #814b00 solid !important;
          box-shadow: 0 0 0 2px #814b00 !important;
        }

        input:focus,
        input:active {
          border: 1px #814b00 solid !important;
          outline: 1px #814b00 solid !important;
          box-shadow: 0 0 0 2px #814b00 !important;
        }

        .quiz-continue-button-wrapper {
          display: none !important;
        }

        .headers-font {
          font-family: var(--font-fellix-bold), Arial, sans-serif;
        }

        .subheaders-font {
          font-family: var(--font-fellix), Arial, sans-serif;
        }

        .quiz-page-wrapper {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .sticky {
          position: sticky;
          bottom: 0;
          background: white;
          padding: 1rem 0;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Product Shipping Restriction Popup */}
      <ProductNotAvailablePopup
        isOpen={showRestrictionPopup}
        onClose={() => setShowRestrictionPopup(false)}
        productName={restrictedProductName}
      />
    </div>
  );
};

export default WeightQuestionnaire;
