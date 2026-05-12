"use client";

import React, { useState } from "react";
import Image from "next/image";
import ProductPopup from "./ProductPopup";
import ProductCardSkeleton from "./ProductCardSkeleton";
import MerchBehindTheScene from "./MerchBehindTheScene";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { formatPrice } from "@/utils/priceFormatter";

const ShopBanner = ({ products = [], loading = false }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Custom scroll bar styles
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      height: 2px;
      width: 8px;
      max-width: 1184px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #e5e7eb;
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #000000;
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #000000;
    }
  `;

  const featuredProducts = products;

  // Show loading state with skeleton cards
  if (loading) {
    return (
      <div id="shop-banner" className="bg-white">
        <div className="md:max-w-[1200px] md:py-24 py-14 lg:px-0 px-5 md:mx-auto">
          {/* Header Section */}
          <div className="text-left md:mb-14 mb-8">
            <h1 className="headers-font text-[40px] md:text-5xl text-leading-[115%] tracking-[-2%] text-black mb-4">
              Capsule Collection
            </h1>
            <p className="text-base md:text-lg text-black leading-[140%] tracking-[0] font-[400]">
              Less is More
            </p>
          </div>

          {/* Main Content Section with Skeleton */}
          <div className="lg:h-[567px] flex items-center justify-start flex-col-reverse lg:flex-row gap-8 mb-20">
            {/* Lifestyle Image - Left Section */}
            <div className="w-full md:w-[378px] h-[300px] md:h-[567px] overflow-hidden rounded-2xl">
              <div className="w-full h-full bg-gray-200 animate-pulse rounded-2xl"></div>
            </div>

            {/* Product Cards - Right Section */}
            <div className="flex gap-8 h-full lg:flex-row flex-col w-full">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!featuredProducts || featuredProducts.length === 0) {
    return (
      <div id="shop-banner" className="bg-white">
        <div className="md:max-w-[1200px] md:py-24 py-14 lg:px-0 px-5 md:mx-auto">
          <div className="text-center">
            <h1 className="headers-font text-[40px] md:text-5xl text-leading-[115%] tracking-[-2%] text-black mb-4">
              Capsule Collection
            </h1>
            <p className="text-base md:text-lg text-black leading-[140%] tracking-[0] font-[400] mb-8">
              No products available at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const openProductPopup = (product) => {
    setSelectedProduct(product);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div id="shop-banner" className="bg-white ">
      <style>{scrollbarStyles}</style>
      <div className=" md:max-w-[1200px] md:py-24 py-14  lg:px-0 px-5 md:mx-auto">
        {/* Header Section */}
        <div className="text-left md:mb-14 mb-8">
          <h1 className="headers-font text-[40px] md:text-5xl text-leading-[115%] tracking-[-2%] text-black mb-4">
            Capsule Collection
          </h1>
          <p className="text-base md:text-lg text-black leading-[140%] tracking-[0] font-[400] ">
            Less is More.
          </p>
        </div>

        {/* Main Content Section */}
        <div className="lg:h-[567px] flex items-center justify-start md:justify-center flex-col-reverse lg:flex-row gap-8 ">
          {/* Product Cards - Right Section */}
          <div className="w-full md:w-auto overflow-x-auto custom-scrollbar pb-8 scroll-smooth">
            <div className="flex gap-8 h-full flex-row min-w-max md:justify-center">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="cursor-pointer flex flex-col h-[527px] w-[280px] md:w-[378px] items-center flex-shrink-0"
                  onClick={() => openProductPopup(product)}
                >
                  {/* Product Image */}
                  <div className="flex-1 bg-[#F3F3F3]  md:h-[431px]  flex items-center justify-center rounded-2xl mb-4 overflow-hidden relative">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={378}
                      height={431}
                      className="object-contain"
                      loading="lazy"
                      quality={85}
                      sizes="(max-width: 768px) 100vw, 378px"
                    />
                    {/* Info Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductPopup(product);
                      }}
                      className="absolute top-3 right-3 w-8 h-8  rounded-full flex items-center justify-center"
                      aria-label="More information"
                    >
                      <FaInfoCircle className="text-gray-600 group-hover:text-gray-800 text-sm" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="w-full">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-medium text-black tracking-[0%] leading-[100%] mb-1">
                        {product.name}
                      </h3>
                      <p className="text-lg font-medium text-black tracking-[0%] leading-[140%] ">
                        ${formatPrice(product.price)}
                      </p>
                    </div>

                    <button className="w-full h-[48px]  bg-white border text-base tracking-[0%] leading-[140%] border-black text-black font-medium rounded-full hover:bg-black hover:text-white transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Behind the Scene Section - Full Width */}
      <MerchBehindTheScene />

      <div className=" md:max-w-[1200px] md:py-24 pb-14  lg:px-0 px-5 md:mx-auto">
        <hr className="border-[#E2E2E1] my-14" />
        {/* Description Section */}
        <div className="flex flex-col lg:flex-row md:gap-20 gap-8 items-start">
          {/* Left Text Block */}
          <div className="flex-1 lg:flex-none md:w-[55%] font-[450]  headers-font">
            <p className=" text-black  headers-font md:text-[28px] text-[24px] md:tracking-[-2%] tracking-[-1%] leading-[115%]">
              Designed with premium fabrics, cut with intention, and built on a
              bold aesthetic -
            </p>
            <p className="md:text-[28px] text-[24px] headers-font  text-[#AE7E56] md:tracking-[-2%] tracking-[-1%] leading-[115%]">
              because excellence isn’t optional, it’s the standard.
            </p>
          </div>

          {/* Right Bullet Points */}
          <div className="flex-1 lg:flex-none ">
            <ul className="space-y-4 md:space-y-6">
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-[#AE7E56] text-[17.5px] w-[17.5px] h-[17.5px]" />
                <span className="text-black font-[400] text-[16px] leading-[140%] tracking-[0%]">
                  Everyday Comfort
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-[#AE7E56] text-[17.5px] w-[17.5px] h-[17.5px]" />

                <span className="text-black font-[400] text-[16px] leading-[140%] tracking-[0%]">
                  Quality Materials
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-[#AE7E56] text-[17.5px] w-[17.5px] h-[17.5px]" />
                <span className="text-black font-[400] text-[16px] leading-[140%] tracking-[0%]">
                  Premium Feel
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Product Popup */}
      {selectedProduct && (
        <ProductPopup
          isOpen={isPopupOpen}
          onClose={closePopup}
          product={selectedProduct}
        />
      )}
    </div>
  );
};

export default ShopBanner;
