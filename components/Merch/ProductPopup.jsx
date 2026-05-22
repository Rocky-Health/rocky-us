"use client";

import React, { useState, useEffect } from "react";
import CustomImage from "@/components/utils/CustomImage";
import { IoClose, IoChevronUp, IoChevronDown, IoAlertCircle } from "react-icons/io5";
import { LuBellRing } from "react-icons/lu";

import { useAddItemToCart } from "@/lib/cart/cartHooks";
import CartPopup from "@/components/Cart/CartPopup";
import NotifyMePopup from "./NotifyMePopup";
import { logger } from "@/utils/devLogger";
import Image from "next/image";
import { formatPrice } from "@/utils/priceFormatter";

const ProductPopup = ({ isOpen, onClose, product }) => {
  // Use the product data passed from parent component
  const currentProduct = product;
  const addItemToCart = useAddItemToCart();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState("black");
  const [quantity, setQuantity] = useState(1);
  const MAX_QUANTITY = 10;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);
  const [selectedSoldOutSize, setSelectedSoldOutSize] = useState(null);
  const [openSections, setOpenSections] = useState({
    description: true,
    sizeAndFit: true,
    care: true,
  });
  const isShirt = currentProduct?.slug?.includes("myRocky-essential-tee") || false;
  // Sort sizes from small to XL for better UX
  const sortSizes = (sizes) => {
    const order = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size", "One Size Fits All"];
    return sizes.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  };

  const sizes = sortSizes(currentProduct?.sizes || ["S", "M", "L", "XL"]);
  const sizeChart = currentProduct?.sizeChart || {
    S: "Chest: 39\"",
    M: "Chest: 42\"",
    L: "Chest: 45\"",
    XL: "Chest: 48\""
  };
  const colors = currentProduct?.colors || [
    { name: "black", value: "#000000" },
    { name: "white", value: "#FFFFFF" },
    { name: "green", value: "#2D5016" },
  ];

  // Helper function to find variation by size and color
  const findVariationBySizeAndColor = (size, color) => {
    if (!currentProduct?.variationData?.variationDetails) return null;
    
    const variations = Object.values(currentProduct.variationData.variationDetails);
    return variations.find(variation => {
      // Check if this variation matches the selected size and color
      const hasSize = variation.attributes?.some(attr => 
        attr.name.toLowerCase().includes('size') && 
        attr.option.toLowerCase() === size.toLowerCase()
      );
      const hasColor = variation.attributes?.some(attr => 
        attr.name.toLowerCase().includes('color') && 
        attr.option.toLowerCase() === color.toLowerCase()
      );
      return hasSize && hasColor;
    });
  };

  // Helper function to get variation info for a specific size
  const getVariationInfoForSize = (size) => {
    if (!selectedColor) return null;
    return findVariationBySizeAndColor(size, selectedColor);
  };

  // Update selected color and size when product changes
  useEffect(() => {
    if (currentProduct?.colors?.length > 0) {
      setSelectedColor(currentProduct.colors[0].name);
    }
    
    // Auto-select size if only one size is available
    if (currentProduct?.sizes?.length === 1) {
      setSelectedSize(currentProduct.sizes[0]);
    } else {
      setSelectedSize(null); // Reset size selection for multiple sizes
    }
  }, [currentProduct]);

  // Reset selected size if it becomes sold out when color changes
  useEffect(() => {
    if (selectedSize && selectedColor) {
      const variationInfo = getVariationInfoForSize(selectedSize);
      if (variationInfo && variationInfo.stock_status === 'outofstock') {
        setSelectedSize(null);
      }
    }
  }, [selectedColor, selectedSize]);

  // Add to cart function
  const handleAddToCart = async () => {
    if (!currentProduct || !selectedSize) return;
    
    // Check if the selected size is sold out
    const variationInfo = getVariationInfoForSize(selectedSize);
    if (variationInfo && variationInfo.stock_status === 'outofstock') {
      alert('This size is currently sold out.');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      let productId = currentProduct.id;
      let variationId = null;
      
      // For variable products, use the variation ID instead of the main product ID
      if (currentProduct.type === 'variable' && currentProduct.variations && currentProduct.variations.length > 0) {
        // Find the variation ID based on selected size
        // Variations array order: [L, M, S, XL] corresponds to [567884, 567883, 567882, 567885]
        const sizeIndex = currentProduct.sizes.indexOf(selectedSize);
        if (sizeIndex !== -1 && currentProduct.variations[sizeIndex]) {
          variationId = currentProduct.variations[sizeIndex];
        }
      }

      const cartItem = {
        productId: variationId || productId, // Use variation ID as product ID for variable products
        variationId: variationId,
        quantity: quantity,
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.images?.[0] || currentProduct.images?.[selectedImageIndex] || "",
        product_type: currentProduct.type || "simple",
        variation: [
          {
            name: "Color",
            value: selectedColor
          },
          {
            name: "Size", 
            value: selectedSize
          }
        ]
      };

      await addItemToCart(cartItem);
      
      // Refresh the cart in the navbar
      document.getElementById("cart-refresher")?.click();
      
      setShowCartPopup(true);
    } catch (error) {
      logger.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };


  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle cart popup close
  const handleCartPopupClose = () => {
    setShowCartPopup(false);
    // Optionally close the product popup as well
    // onClose();
  };

  // Handle continue shopping - close both popups
  const handleContinueShopping = () => {
    setShowCartPopup(false);
    onClose();
  };

  const handleSoldOutSizeClick = (size) => {
    setSelectedSoldOutSize(size);
    setShowNotifyPopup(true);
  };

  const closeNotifyPopup = () => {
    setShowNotifyPopup(false);
    setSelectedSoldOutSize(null);
  };

  // Swipe functionality for image navigation
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchEnd(null);
    setTouchStart(touch.clientX);
  };

  const onTouchMove = (e) => {
    const touch = e.touches[0];
    setTouchEnd(touch.clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    console.log('Swipe detected:', { distance, isLeftSwipe, isRightSwipe, touchStart, touchEnd });

    if (isLeftSwipe && currentProduct.images.length > 1) {
      // Swipe left - go to next image
      console.log('Going to next image');
      setSelectedImageIndex((prev) => 
        prev === currentProduct.images.length - 1 ? 0 : prev + 1
      );
    }
    
    if (isRightSwipe && currentProduct.images.length > 1) {
      // Swipe right - go to previous image
      console.log('Going to previous image');
      setSelectedImageIndex((prev) => 
        prev === 0 ? currentProduct.images.length - 1 : prev - 1
      );
    }
    
    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  };


  const scrollToSizeAndFit = () => {
    // First ensure the section is open
    if (!openSections.sizeAndFit) {
      setOpenSections((prev) => ({
        ...prev,
        sizeAndFit: true,
      }));
    }
    
    // Small delay to ensure the section is rendered, then scroll to it
    setTimeout(() => {
      const sizeAndFitElement = document.querySelector('[data-section="sizeAndFit"]');
      if (sizeAndFitElement) {
        sizeAndFitElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  };

  if (!isOpen || !currentProduct) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <style jsx global>{`
        body {
          overflow: hidden !important;
        }
        html {
          overflow: hidden !important;
        }
      `}</style>
      <div className="bg-white rounded-3xl lg:rounded-3xl max-w-5xl w-full h-[90vh] relative flex flex-col overflow-hidden lg:max-w-[800px] lg:max-h-[570px]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute text-normal top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors z-10"
        >
          <IoClose className="w-6 h-6 text-black " />
        </button>

        {/* Mobile Layout */}
        <div className="flex flex-col lg:flex-row-reverse  h-full">
          {/* Product Images - Top on mobile, Right on desktop */}
          <div className="lg:w-96  ">
            <div className="relative">
              {/* Main Product Image */}
              <div 
                className="relative w-full h-[300px] lg:h-[462px] rounded-t-2xl  mb-2 bg-[#F3F3F3] lg:mb-0 flex items-center justify-center  lg:p-0"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{ touchAction: 'pan-x' }}
              >
                <div className="relative w-[80%] h-[80%] md:w-[75%] md:h-[75%]">
                <Image
                  src={currentProduct.images[selectedImageIndex]}
                  alt={currentProduct.name}
                  fill
                  className="object-contain object-center"
                />
                </div>
                
                {/* Swipe indicators */}
                {currentProduct.images.length > 1 && (
                  <>
                    {/* Left arrow - Desktop only */}
                    <button 
                      onClick={() => setSelectedImageIndex(prev => prev === 0 ? currentProduct.images.length - 1 : prev - 1)}
                      className="hidden lg:flex absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-90 rounded-full items-center justify-center shadow-lg hover:bg-opacity-100 transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Right arrow - Desktop only */}
                    <button 
                      onClick={() => setSelectedImageIndex(prev => prev === currentProduct.images.length - 1 ? 0 : prev + 1)}
                      className="hidden lg:flex absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white bg-opacity-90 rounded-full items-center justify-center shadow-lg hover:bg-opacity-100 transition-all duration-200 hover:scale-110"
                    >
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
              </div>

              {/* Thumbnail Images */}
              <div className="flex justify-center gap-[10px] md:bg-[#F3F3F3] md:py-6 md:rounded-b-2xl">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-12 h-12 md:w-[60px] md:h-[60px] rounded-2xl overflow-hidden  border-2 transition-colors p-2 ${
                      selectedImageIndex === index
                        ? "border-gray-900"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <CustomImage
                      src={image}
                      alt={`${currentProduct.name} view ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Information - Scrollable content */}
          <div className="flex-1 px-5 py-4 lg:p-8 overflow-y-auto relative">
            {/* Product Name */}
            <h2 className="text-[20px] md:text-[24px]  font-medium text-black mb-2 tracking-[0%] leading-[140%]">
              {currentProduct.name}
            </h2>
            
            {/* Product Description */}
            <p className="text-black text-sm lg:text-base tracking-[-1%] leading-[140%] mb-2">
              {currentProduct.short_description
              }
            </p>


            {/* Color Selection */}
            <div className="mb-6">
              <div className="flex flex-col items-start gap-2">
                <span className="text-base  md:text-lg font-medium  text-black tracking-[0%] leading-[140%]">Color: {selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}</span>
                <div 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-[0_0_0_1px_black] "
                  style={{ backgroundColor: colors.find(c => c.name === selectedColor)?.value }}
                ></div>
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-4 lg:mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base md:text-lg font-medium text-black tracking-[0%] leading-[140%]">Select Size:</span>
                <button 
                  onClick={scrollToSizeAndFit}
                  className="text-sm md:text-base text-black underline tracking-[0%] leading-[140%] hover:text-gray-600 transition-colors"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => {
                  const variationInfo = getVariationInfoForSize(size);
                  const isSoldOut = variationInfo && variationInfo.stock_status === 'outofstock';
                  const isDisabled = isAddingToCart || isSoldOut;
                  
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        if (isSoldOut) {
                          // handleSoldOutSizeClick(size);
                        } else {
                          setSelectedSize(size);
                        }
                      }}
                      disabled={isAddingToCart}
                      className={`relative px-3 lg:px-4 py-2 h-12 border rounded-lg text-base font-medium transition-colors ${
                        size === "One Size" || size === "One Size Fits All"
                          ? "min-w-fit"
                          : "w-12"
                      } ${
                        selectedSize === size
                          ? "border-gray-900 bg-white text-black"
                          : isSoldOut
                          ? "border-gray-300 bg-gray-100 text-gray-400 cursor-pointer hover:bg-gray-200"
                          : "border-gray-300 bg-white text-black hover:border-gray-400"
                      }`}
                    >
                      <span className={isSoldOut ? "line-through" : ""}>{size}</span>
                      {/* {isSoldOut && (
                        <LuBellRing className="absolute top-1 right-1 w-4 h-4 text-black" />
                      )} */}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accordion Sections */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 text-black text-lg font-medium leading-[140%] tracking-[0%] pb-4">
                Details
              </div>
              {/* Description */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection("description")}
                  className="flex items-center justify-between w-full py-3 text-left"
                >
                  <span className="font-medium text-gray-900">Description</span>
                  {openSections.description ? (
                    <IoChevronUp className="w-5 h-5" />
                  ) : (
                    <IoChevronDown className="w-5 h-5" />
                  )}
                </button>
                {openSections.description && (
                  <div className="pb-3 text-sm text-[#000000CC]">
                    {currentProduct.detailedDescription || currentProduct.description}
                  </div>
                )}
              </div>

              {/* Size and Fit */}
              <div className="border-b border-gray-200" data-section="sizeAndFit">
                <button
                  onClick={() => toggleSection("sizeAndFit")}
                  className="flex items-center justify-between w-full py-3 text-left"
                >
                  <span className="font-medium text-gray-900">Size and Fit</span>
                  {openSections.sizeAndFit ? (
                    <IoChevronUp className="w-5 h-5" />
                  ) : (
                    <IoChevronDown className="w-5 h-5" />
                  )}
                </button>
                {openSections.sizeAndFit && (
                  <div className="pb-4 text-[#000000CC] text-sm">
                    <p className="mb-6">Fit: {currentProduct?.fit || "true to size"}</p>
                    {isShirt && (
                      <p className="mb-4">Model is 5’9 160lbs (175cm / 72kg) and is wearing a size Medium.</p>)}
                    <div className="grid grid-cols-2 gap-4 ">
                      <div className="space-y-6">
                        {Object.entries(sizeChart).slice(0, 2).map(([size, measurement]) => (
                          <div key={size} className="flex flex-col">
                            <span className="font-medium text-black">{size}</span>
                            <span className="text-[#000000CC]">{measurement}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-6">
                        {Object.entries(sizeChart).slice(2).map(([size, measurement]) => (
                          <div key={size} className="flex flex-col">
                            <span className="font-medium text-black">{size}</span>
                            <span className="text-[#000000CC]">{measurement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Care */}
              <div className="">
                <button
                  onClick={() => toggleSection("care")}
                  className="flex items-center justify-between w-full py-3 text-left"
                >
                  <span className="font-medium text-gray-900">Care</span>
                  {openSections.care ? (
                    <IoChevronUp className="w-5 h-5" />
                  ) : (
                    <IoChevronDown className="w-5 h-5" />
                  )}
                </button>
                {openSections.care && (
                  <div className="pb-3 text-[#000000CC] text-sm">
                    <p>We recommend machine washing in cold water and air drying to maintain integrity. For hats, hand wash gently and air dry.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Spacer for fixed button on mobile */}
            <div className="h-20 lg:hidden"></div>
            {/* Spacer for desktop sticky button */}
            {/* Desktop Add to Cart Button - Sticky at bottom of scrollable content */}
            <div className="hidden lg:block sticky bottom-0 bg-white -mx-8" style={{ marginBottom: '-32px', paddingBottom: '32px' , background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 26.5%)' }}>
              <div className="flex items-center justify-center gap-4 w-full px-8 py-8  bg-white -mb-16 " style={{ background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 26.5%)' }}>
                <div className="flex items-center justify-between h-[52px] w-[100px] p-4 border border-gray-300 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!selectedSize || isAddingToCart || (selectedSize && getVariationInfoForSize(selectedSize)?.stock_status === 'outofstock')}
                    className={`flex items-center justify-center w-4 h-4 text-lg text-center ${
                      selectedSize && !isAddingToCart && getVariationInfoForSize(selectedSize)?.stock_status !== 'outofstock'
                        ? "text-gray-600 hover:text-gray-800" 
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    -
                  </button>
                  <span className="text-base text-center flex items-center justify-center text-gray-900 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(quantity + 1, MAX_QUANTITY))}
                    disabled={!selectedSize || isAddingToCart || quantity >= MAX_QUANTITY || (selectedSize && getVariationInfoForSize(selectedSize)?.stock_status === 'outofstock')}
                    className={`flex items-center justify-center w-4 h-4 text-lg text-center ${
                      selectedSize && !isAddingToCart && quantity < MAX_QUANTITY && getVariationInfoForSize(selectedSize)?.stock_status !== 'outofstock'
                        ? "text-gray-600 hover:text-gray-800" 
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedSize || isAddingToCart || (selectedSize && getVariationInfoForSize(selectedSize)?.stock_status === 'outofstock')}
                  className={`flex-1 h-[52px] w-[222px] py-3 rounded-full font-medium ${
                    selectedSize && !isAddingToCart && getVariationInfoForSize(selectedSize)?.stock_status !== 'outofstock'
                      ? "bg-black text-white hover:bg-gray-800" 
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isAddingToCart ? "Adding..." : (() => {
                    if (selectedSize) {
                      const variationInfo = getVariationInfoForSize(selectedSize);
                      if (variationInfo) {
                        const price = variationInfo.sale_price || variationInfo.regular_price;
                        return `Add to Cart - $${formatPrice(price * quantity)}`;
                      }
                    }
                    return `Add to Cart - $${formatPrice(currentProduct.price * quantity)}`;
                  })()}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Add to Cart Button - Mobile only */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 rounded-full">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!selectedSize || isAddingToCart || (selectedSize && getVariationInfoForSize(selectedSize)?.stock_status === 'outofstock')}
                className={`px-3 py-2 ${
                  selectedSize && !isAddingToCart && getVariationInfoForSize(selectedSize)?.stock_status !== 'outofstock'
                    ? "text-gray-600 hover:text-gray-800" 
                    : "text-gray-300 cursor-not-allowed"
                }`}
              >
                -
              </button>
              <span className="px-4 py-2 text-gray-900 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(quantity + 1, MAX_QUANTITY))}
                disabled={!selectedSize || isAddingToCart || quantity >= MAX_QUANTITY || (selectedSize && getVariationInfoForSize(selectedSize)?.stock_status === 'outofstock')}
                className={`px-3 py-2 ${
                  selectedSize && !isAddingToCart && quantity < MAX_QUANTITY && getVariationInfoForSize(selectedSize)?.stock_status !== 'outofstock'
                    ? "text-gray-600 hover:text-gray-800" 
                    : "text-gray-300 cursor-not-allowed"
                }`}
              >
                +
              </button>
            </div>
            <button 
              onClick={handleAddToCart}
              disabled={!selectedSize || isAddingToCart || (selectedSize && getVariationInfoForSize(selectedSize)?.stock_status === 'outofstock')}
              className={`flex-1 py-3 px-6 rounded-full font-medium sm:text-base text-sm ${
                selectedSize && !isAddingToCart && getVariationInfoForSize(selectedSize)?.stock_status !== 'outofstock'
                  ? "bg-black text-white hover:bg-gray-800" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isAddingToCart ? "Adding..." : (() => {
                if (selectedSize) {
                  const variationInfo = getVariationInfoForSize(selectedSize);
                  if (variationInfo) {
                    const price = variationInfo.sale_price || variationInfo.regular_price;
                    return `Add to Cart - $${formatPrice(price * quantity)}`;
                  }
                }
                return `Add to Cart - $${formatPrice(currentProduct.price * quantity)}`;
              })()}
            </button>
          </div>
        </div>
      </div>
      
      {/* Cart Popup */}
      <CartPopup 
        isOpen={showCartPopup}
        onClose={handleCartPopupClose}
        onContinueShopping={handleContinueShopping}
        productType="merch"
      />

      {/* Notify Me Popup */}
      <NotifyMePopup
        isOpen={showNotifyPopup}
        onClose={closeNotifyPopup}
        size={selectedSoldOutSize}
        productName={currentProduct?.name}
      />
    </div>
  );
};

export default ProductPopup;