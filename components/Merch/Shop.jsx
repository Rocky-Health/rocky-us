"use client";

import React, { useState } from "react";
import CustomImage from "@/components/utils/CustomImage";
import ProductPopup from "./ProductPopup";
import { MdAddShoppingCart } from "react-icons/md";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

const Shop = () => {
    const [selectedCategory, setSelectedCategory] = useState("All Merch");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState({});

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

    const categories = ["All Merch", "Hoodies", "Shirts", "Caps", "Jackets"];

    const products = [
        {
            id: 1,
            name: "MyRocky Essential Tee",
            category: "Shirts",
            image: "/merch/t-shitrt.png",
            badge: "Best Seller",
            images: [
                "/merch/t-shitrt.png",
                "/merch/t-shitrt.png",
                "/merch/t-shitrt.png",
                "/merch/t-shitrt.png",
            ],
            price: 45,
            description:
                "Everyday wear, elevated. Crafted from premium cotton with a clean-cut and refined fit.",
            detailedDescription:
                "The 100% cotton heavyweight tee. Crafted from 275 GSM combed jersey with signature MyRocky embroidery. Milled and handcrafted in US.",
            material: "100% premium cotton",
            sizes: ["S", "M", "L", "XL"],
            colors: [
                { name: "black", value: "#000000" },
                { name: "white", value: "#FFFFFF" },
                { name: "green", value: "#2D5016" },
            ],
            sizeChart: {
                S: 'Chest: 39"',
                M: 'Chest: 42"',
                L: 'Chest: 45"',
                XL: 'Chest: 48"',
            },
            fit: "true to size",
            modelInfo:
                "Model is 5'9 160lbs (175cm / 72kg) and is wearing a size Medium.",
        },
        {
            id: 2,
            name: "Shirt & Cap",
            category: "Shirts",
            image: "/merch/t-shirt-cap.png",
            images: [
                "/merch/t-shirt-cap.png",
                "/merch/IMG.png",
                "/merch/t-shirt-cap.png",
                "/merch/t-shirt-cap.png",
            ],
            price: 39.99,
            description:
                "Complete your look with our shirt and cap combo—stylish and comfortable.",
            detailedDescription:
                "Premium cotton shirt paired with a classic cap. The shirt features our signature MyRocky embroidery while the cap offers adjustable fit for all head sizes.",
            material: "100% cotton shirt, 100% polyester cap",
            sizes: ["S", "M", "L", "XL"],
            colors: [
                { name: "black", value: "#000000" },
                { name: "white", value: "#FFFFFF" },
            ],
            sizeChart: {
                S: 'Chest: 39"',
                M: 'Chest: 42"',
                L: 'Chest: 45"',
                XL: 'Chest: 48"',
            },
            fit: "true to size",
            modelInfo:
                "Model is 5'9 160lbs (175cm / 72kg) and is wearing a size Medium.",
        },
        {
            id: 3,
            name: "Essential Hoodie",
            category: "Hoodies",
            image: "/merch/hoodi.png",
            badge: "New",
            images: [
                "/merch/hoodi.png",
                "/merch/hoodi.png",
                "/merch/hoodi.png",
                "/merch/hoodi.png",
            ],
            price: 49.99,
            description:
                "Premium hoodie with soft fleece lining—perfect for cooler days.",
            detailedDescription:
                "Our signature hoodie crafted from premium cotton blend with soft fleece lining. Features kangaroo pocket and adjustable drawstring hood for ultimate comfort.",
            material: "80% cotton, 20% polyester",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
                { name: "black", value: "#000000" },
                { name: "gray", value: "#808080" },
                { name: "navy", value: "#000080" },
            ],
            sizeChart: {
                S: 'Chest: 40"',
                M: 'Chest: 44"',
                L: 'Chest: 48"',
                XL: 'Chest: 52"',
                XXL: 'Chest: 56"',
            },
            fit: "true to size",
            modelInfo:
                "Model is 5'10 170lbs (178cm / 77kg) and is wearing a size Large.",
        },
        {
            id: 4,
            name: "MyRocky's Essential Cap",
            category: "Caps",
            image: "/merch/cap.png",
            badge: "New",
            images: [
                "/merch/cap.png",
                "/merch/cap.png",
                "/merch/cap.png",
                "/merch/cap.png",
            ],
            price: 25,
            description:
                "Classic baseball cap with embroidered MyRocky logo—adjustable fit for everyone.",
            detailedDescription:
                "Premium baseball cap featuring our signature MyRocky embroidery. Made from high-quality polyester with adjustable snapback closure for the perfect fit.",
            material: "100% polyester",
            sizes: ["One Size"],
            colors: [
                { name: "black", value: "#000000" },
                { name: "white", value: "#FFFFFF" },
                { name: "navy", value: "#000080" },
            ],
            sizeChart: {
                "One Size": "Adjustable snapback closure",
            },
            fit: "adjustable",
            modelInfo: "One size fits most with adjustable snapback closure.",
        },
        {
            id: 5,
            name: "Premium Jacket",
            category: "Jackets",
            image: "/merch/IMG.png",
            badge: "Limited",
            images: [
                "/merch/IMG.png",
                "/merch/IMG.png",
                "/merch/IMG.png",
                "/merch/IMG.png",
            ],
            price: 79.99,
            description:
                "Premium jacket with weather-resistant material—perfect for outdoor adventures.",
            detailedDescription:
                "High-performance jacket designed for outdoor enthusiasts. Features weather-resistant DWR coating and breathable polyester construction for all-weather protection.",
            material: "100% polyester with DWR coating",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
                { name: "black", value: "#000000" },
                { name: "navy", value: "#000080" },
                { name: "olive", value: "#808000" },
            ],
            sizeChart: {
                S: 'Chest: 42"',
                M: 'Chest: 46"',
                L: 'Chest: 50"',
                XL: 'Chest: 54"',
                XXL: 'Chest: 58"',
            },
            fit: "true to size",
            modelInfo:
                "Model is 5'10 170lbs (178cm / 77kg) and is wearing a size Large.",
        },
        {
            id: 6,
            name: "Classic Polo",
            category: "Shirts",
            image: "/merch/IMG.png",
            images: [
                "/merch/IMG.png",
                "/merch/IMG.png",
                "/merch/IMG.png",
                "/merch/IMG.png",
            ],
            price: 34.99,
            description:
                "Classic polo shirt with embroidered MyRocky logo—professional and comfortable.",
            detailedDescription:
                "Professional polo shirt crafted from premium pique cotton. Features our signature MyRocky embroidery and classic three-button placket for a timeless look.",
            material: "100% pique cotton",
            sizes: ["S", "M", "L", "XL"],
            colors: [
                { name: "white", value: "#FFFFFF" },
                { name: "black", value: "#000000" },
                { name: "navy", value: "#000080" },
            ],
            sizeChart: {
                S: 'Chest: 38"',
                M: 'Chest: 41"',
                L: 'Chest: 44"',
                XL: 'Chest: 47"',
            },
            fit: "true to size",
            modelInfo:
                "Model is 5'9 160lbs (175cm / 72kg) and is wearing a size Medium.",
        },
        {
            id: 7,
            name: "Zip Hoodie",
            category: "Hoodies",
            image: "/merch/IMG.png",
            images: [
                "/merch/IMG.png",
                "/merch/IMG.png",
                "/merch/IMG.png",
                "/merch/IMG.png",
            ],
            price: 54.99,
            description:
                "Zip-up hoodie with kangaroo pocket—versatile and stylish for any occasion.",
            detailedDescription:
                "Versatile zip-up hoodie featuring a convenient kangaroo pocket and adjustable drawstring hood. Perfect for layering or wearing on its own.",
            material: "85% cotton, 15% polyester",
            sizes: ["S", "M", "L", "XL", "XXL"],
            colors: [
                { name: "black", value: "#000000" },
                { name: "gray", value: "#808080" },
                { name: "burgundy", value: "#800020" },
            ],
            sizeChart: {
                S: 'Chest: 40"',
                M: 'Chest: 44"',
                L: 'Chest: 48"',
                XL: 'Chest: 52"',
                XXL: 'Chest: 56"',
            },
            fit: "true to size",
            modelInfo:
                "Model is 5'10 170lbs (178cm / 77kg) and is wearing a size Large.",
        },
        {
            id: 8,
            name: "Snapback Cap",
            category: "Caps",
            image: "/merch/IMG.png",
            badge: "Popular",
            images: [
                "/merch/IMG.png",
                "/merch/IMG.png",
                "/merch/IMG.png",
                "/merch/IMG.png",
            ],
            price: 24.99,
            description:
                "Snapback cap with embroidered MyRocky logo—adjustable snap closure for perfect fit.",
            detailedDescription:
                "Classic snapback cap made from premium cotton twill. Features our signature MyRocky embroidery and adjustable snap closure for a custom fit.",
            material: "100% cotton twill",
            sizes: ["One Size"],
            colors: [
                { name: "black", value: "#000000" },
                { name: "white", value: "#FFFFFF" },
                { name: "red", value: "#FF0000" },
            ],
            sizeChart: {
                "One Size": "Adjustable snapback closure",
            },
            fit: "adjustable",
            modelInfo: "One size fits most with adjustable snapback closure.",
        },
        {
            id: 9,
            name: "Lightweight Jacket",
            category: "Jackets",
            image: "/merch/IMG.png",
            images: [
                "/merch/IMG.png",
                "/merch/IMG.png",
                "/merch/IMG.png",
                "/merch/IMG.png",
            ],
            price: 64.99,
            description:
                "Lightweight jacket perfect for layering—breathable and packable design.",
            detailedDescription:
                "Ultra-lightweight jacket designed for layering and travel. Features breathable nylon construction with mesh lining for maximum comfort.",
            material: "100% nylon with mesh lining",
            sizes: ["S", "M", "L", "XL"],
            colors: [
                { name: "black", value: "#000000" },
                { name: "gray", value: "#808080" },
                { name: "blue", value: "#0000FF" },
            ],
            sizeChart: {
                S: 'Chest: 40"',
                M: 'Chest: 44"',
                L: 'Chest: 48"',
                XL: 'Chest: 52"',
            },
            fit: "true to size",
            modelInfo:
                "Model is 5'10 170lbs (178cm / 77kg) and is wearing a size Large.",
        },
        {
            id: 10,
            name: "Long Sleeve Tee",
            category: "Shirts",
            image: "/merch/IMG.png",
            badge: "Trending",
            images: [
                "/merch/IMG.png",
                "/merch/IMG.png",
                "/merch/IMG.png",
                "/merch/IMG.png",
            ],
            price: 32.99,
            description:
                "Long sleeve tee with ribbed cuffs—comfortable and stylish for cooler weather.",
            detailedDescription:
                "Comfortable long sleeve tee featuring ribbed cuffs and hem. Made from soft cotton jersey for all-day comfort in cooler weather.",
            material: "100% cotton jersey",
            sizes: ["S", "M", "L", "XL"],
            colors: [
                { name: "black", value: "#000000" },
                { name: "white", value: "#FFFFFF" },
                { name: "heather", value: "#B0B0B0" },
            ],
            sizeChart: {
                S: 'Chest: 38"',
                M: 'Chest: 41"',
                L: 'Chest: 44"',
                XL: 'Chest: 47"',
            },
            fit: "true to size",
            modelInfo:
                "Model is 5'9 160lbs (175cm / 72kg) and is wearing a size Medium.",
        },
    ];

    const filteredProducts =
        selectedCategory === "All Merch"
            ? products
            : products.filter(
                  (product) => product.category === selectedCategory
              );

    const openProductPopup = (product) => {
        setSelectedProduct(product);
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setSelectedProduct(null);
    };

    const navigateImage = (productId, direction, event) => {
        event.stopPropagation(); // Prevent opening popup when clicking arrows
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        const currentIndex = currentImageIndex[productId] || 0;
        let newIndex;

        if (direction === "prev") {
            newIndex =
                currentIndex > 0 ? currentIndex - 1 : product.images.length - 1;
        } else {
            newIndex =
                currentIndex < product.images.length - 1 ? currentIndex + 1 : 0;
        }

        setCurrentImageIndex((prev) => ({
            ...prev,
            [productId]: newIndex,
        }));
    };

    return (
        <div className="bg-white mb-[96px] pt-10  mx-auto hidden md:block">
            <style>{scrollbarStyles}</style>
            <div className=" mx-auto mb-[60px] w-full pl-[128px] ">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-semibold text-black mb-5">
                        Shop
                    </h1>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-6 border-b border-gray-200 pb-4  max-w-[1184px]">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`text-sm headers-font tracking-[-2%] leading-[115%] text-[20px] font-[550] transition-colors relative ${
                                    selectedCategory === category
                                        ? "text-black"
                                        : "text-[#00000080] hover:text-gray-700"
                                }`}
                            >
                                {category}
                                {selectedCategory === category && (
                                    <div className="absolute -bottom-4 left-0 right-0 h-0.5 bg-black"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="overflow-x-auto custom-scrollbar w-full ">
                    <div className="flex gap-8  mb-[68px] ">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group cursor-pointer flex-shrink-0 w-[310px]"
                                onClick={() => openProductPopup(product)}
                            >
                                {/* Product Card */}
                                <div className="bg-[#F1F1F1] rounded-2xl p-4 relative w-[310px] h-[384px] border border-gray-200">
                                    {/* Badge */}
                                    {product.badge && (
                                        <div
                                            className={`h-[26px] text-[12px] text-center font-normal  px-[10px] py-[4px] absolute top-[20px] left-[20px] z-10  text-black   rounded ${
                                                product.badge === "Best Seller"
                                                    ? "bg-[#FAEDA7]"
                                                    : product.badge === "New"
                                                    ? "bg-[#FAC8A7]"
                                                    : "bg-[#A7885A]"
                                            }`}
                                        >
                                            {product.badge}
                                        </div>
                                    )}

                                    {/* Product Image */}
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <div className="relative w-64 h-64 bg-[#F1F1F1] rounded-lg overflow-hidden">
                                            <CustomImage
                                                src={
                                                    product.images[
                                                        currentImageIndex[
                                                            product.id
                                                        ] || 0
                                                    ]
                                                }
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />

                                            {/* Navigation Arrows */}
                                            {product.images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) =>
                                                            navigateImage(
                                                                product.id,
                                                                "prev",
                                                                e
                                                            )
                                                        }
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                                    >
                                                        <IoChevronBack className="w-4 h-4 text-black" />
                                                    </button>
                                                    <button
                                                        onClick={(e) =>
                                                            navigateImage(
                                                                product.id,
                                                                "next",
                                                                e
                                                            )
                                                        }
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                                                    >
                                                        <IoChevronForward className="w-4 h-4 text-black" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Image Pagination Dots - Inside Card */}
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                        {product.images.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`w-2 h-2 rounded-full ${
                                                    index ===
                                                    (currentImageIndex[
                                                        product.id
                                                    ] || 0)
                                                        ? "bg-black"
                                                        : "bg-[#D9D9D9]"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Product Info - Outside Card */}
                                <div className="flex items-center justify-between mt-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {product.name}
                                    </h3>
                                    <button className="text-black hover:text-gray-600 transition-colors">
                                        <MdAddShoppingCart className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        ))}
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

export default Shop;
