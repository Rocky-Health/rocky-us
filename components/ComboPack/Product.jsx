"use client";

import { useState } from "react";
import { logger } from "@/utils/devLogger";
import { ProductImage } from "../Product";
import CheckBox from "./Checkbox";
import { useAddItemToCart } from "@/lib/cart/cartHooks";
import CartPopup from "../Cart/CartPopup";

const Product = ({ product }) => {
  const [selectedSubscription, setSelectedSubscription] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const addItemToCart = useAddItemToCart();

  // When product ID is 1, it's the Hair Kit
  const isHairKit = product?.id === "1";
  // When product ID is 2, it's the Prescription Hair Kit
  const isPrescriptionKit = product?.id === "2";
  // When product ID is 3, it's the Organic Hair Kit
  const isOrganicKit = product?.id === "3";

  // Handle subscription selection - this ensures only one option can be selected
  const handleSubscriptionChange = (value) => {
    setSelectedSubscription(value);
  };

  // Get selected subscription option
  const getSelectedOption = (options) => {
    return (
      options?.find((option) => option.value === selectedSubscription) ||
      options?.[0]
    );
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    try {
      setIsLoading(true);

      // Handle Organic Hair Kit (third section)
      if (isOrganicKit && product.subscriptionOptions) {
        const selectedOption = getSelectedOption(product.subscriptionOptions);
        const priceValue = parseFloat(selectedOption.price.replace("$", ""));

        const cartData = {
          productId: selectedOption.productId,
          quantity: 1,
          name: product.name,
          price: priceValue,
          image: product.img,
          isSubscription: true,
          subscriptionPeriod: selectedOption.subscriptionPeriod,
        };

        await addItemToCart(cartData);
        document.getElementById("cart-refresher")?.click();
        setShowCartPopup(true);
        return;
      }

      // Handle Prescription Hair Kit (second section)
      if (isPrescriptionKit && product.subscriptionInfo) {
        const priceValue = parseFloat(
          product.subscriptionInfo.price.replace("$", "")
        );
        const cartData = {
          productId: product.subscriptionInfo.productId,
          quantity: 1,
          name: product.name,
          price: priceValue,
          image: product.img,
          isSubscription: true,
          subscriptionPeriod: product.subscriptionInfo.period,
        };

        await addItemToCart(cartData);
        document.getElementById("cart-refresher")?.click();
        setShowCartPopup(true);
        return;
      }

      // Handle Hair Kit (first section)
      if (isHairKit) {
        const selectedOption = getSelectedOption(
          product.subscriptionOptions || [
            {
              id: "monthly",
              value: "monthly",
              text: "1 Month Supply",
              price: "$90",
              productId: "784",
              subscriptionPeriod: "1_month_24",
            },
            {
              id: "quarterly",
              value: "quarterly",
              text: "3 Months Supply",
              price: "$220",
              productId: "397049",
              subscriptionPeriod: "3_month_24",
            },
          ]
        );

        const priceValue = parseFloat(selectedOption.price.replace("$", ""));

        const cartData = {
          productId: selectedOption.productId,
          quantity: 1,
          name: "MyRocky Hair Kit",
          price: priceValue,
          image: product.img,
          isSubscription: true,
          subscriptionPeriod: selectedOption.subscriptionPeriod,
        };

        await addItemToCart(cartData);
        document.getElementById("cart-refresher")?.click();
        setShowCartPopup(true);
        return;
      }

      // Handle other products
      logger.log("Adding regular product to cart:", product.id);
      const cartData = {
        productId: product.id,
        quantity: 1,
        name: product.name,
        price: 0, // Default price, should be updated
        image: product.img,
      };

      await addItemToCart(cartData);
      document.getElementById("cart-refresher")?.click();
      setShowCartPopup(true);
    } catch (error) {
      logger.error("Error adding to cart:", error);
      alert("Error adding to cart: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the Organic Hair Kit (third section)
  if (isOrganicKit) {
    return (
      <>
        {/* Desktop View */}
        <div className="lg:flex hidden">
          <div className="w-1/2">
            <ProductImage src={product.img} />
          </div>
          <div className="w-1/2 pl-8 pt-6">
            <h2 className="text-4xl font-semibold text-gray-900 mb-5">
              {product.name}
            </h2>
            <p className="w-3/4 mb-5">{product.description}</p>
            <p className="text-sm font-semibold mb-3">This kit includes: </p>
            <ul className="mb-5">
              {product.items.map((item, index) => (
                <li key={index}>
                  <b>{item.quantity}</b>{" "}
                  <span className="px-2">{item.name}</span>{" "}
                  <span className="text-gray-600 px-2"> ({item.size}) </span>
                </li>
              ))}
            </ul>

            <p className="text-sm font-semibold mb-3 mt-6">Select frequency:</p>

            {/* Render subscription options as radio buttons */}
            <div className="subscription-options">
              {product.subscriptionOptions.map((option) => (
                <CheckBox
                  key={option.id}
                  text={option.text}
                  price={option.price}
                  isSelected={selectedSubscription === option.value}
                  onSelect={handleSubscriptionChange}
                  value={option.value}
                />
              ))}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="w-full bg-black text-white rounded-full p-4 mt-5 block text-center cursor-pointer disabled:opacity-70"
            >
              {isLoading
                ? "Adding to Cart..."
                : `Buy Now — ${
                    getSelectedOption(product.subscriptionOptions)?.price
                  }`}
            </button>
            <p className="text-center mt-3">
              *subscription can be cancelled at any time
            </p>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="w-full">
            <h2 className="text-4xl font-semibold text-gray-900 mb-2">
              {product.name}
            </h2>
            <p className="w-full mb-5">{product.description}</p>
            <ProductImage src={product.img} />
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold mb-3">
              This kit includes:{" "}
              {product.items.map((item) => item.name).join(" and ")}.
            </p>

            <p className="text-sm font-semibold mb-3 mt-6">Select frequency:</p>

            {/* Render subscription options as radio buttons */}
            <div className="subscription-options">
              {product.subscriptionOptions.map((option) => (
                <CheckBox
                  key={option.id}
                  text={option.text}
                  price={option.price}
                  isSelected={selectedSubscription === option.value}
                  onSelect={handleSubscriptionChange}
                  value={option.value}
                />
              ))}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="w-full bg-black text-white rounded-full p-4 mt-5 block text-center cursor-pointer disabled:opacity-70"
            >
              {isLoading
                ? "Adding to Cart..."
                : `Buy Now — ${
                    getSelectedOption(product.subscriptionOptions)?.price
                  }`}
            </button>
            <p className="text-center mt-3">
              *subscription can be cancelled at any time
            </p>
          </div>
        </div>

        {/* Cart Popup */}
        <CartPopup
          isOpen={showCartPopup}
          onClose={() => setShowCartPopup(false)}
          productType="hair"
        />
      </>
    );
  }

  // Render the Prescription Hair Kit (second section)
  if (isPrescriptionKit) {
    return (
      <>
        {/* Desktop View */}
        <div className="lg:flex hidden">
          <div className="w-1/2">
            <ProductImage src={product.img} />
          </div>
          <div className="w-1/2 pl-8 pt-10">
            <h2 className="text-4xl font-semibold text-gray-900 mb-5">
              {product.name}
            </h2>
            <p className="w-3/4 mb-5">{product.description}</p>
            <p className="text-sm font-semibold mb-3">This kit includes: </p>
            <ul className="mb-5">
              {product.items.map((item, index) => (
                <li key={index}>
                  <b>{item.quantity}</b>{" "}
                  <span className="px-2">{item.name}</span>{" "}
                  <span className="text-gray-600 px-2"> ({item.size}) </span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <p className="text-lg font-semibold">
                3 Months Supply{" "}
                <span className="text-gray-500 text-sm line-through">
                  {product.subscriptionInfo.regularPrice}
                </span>
              </p>
              <p className="text-2xl font-bold mb-4">
                {product.subscriptionInfo.price}{" "}
                <span className="text-sm font-normal text-gray-700">
                  ({product.subscriptionInfo.discount})
                </span>
              </p>

              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full bg-black text-white rounded-full p-4 mt-2 block text-center cursor-pointer disabled:opacity-70"
              >
                {isLoading ? "Adding to Cart..." : "Buy Now"}
              </button>
              <p className="text-center mt-3">
                *subscription can be cancelled at any time
              </p>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="w-full">
            <h2 className="text-4xl font-semibold text-gray-900 mb-2">
              {product.name}
            </h2>
            <p className="w-full mb-5">{product.description}</p>
            <ProductImage src={product.img} />
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold mb-3">This kit includes:</p>
            <ul className="mb-5">
              {product.items.map((item, index) => (
                <li key={index}>
                  <b>{item.quantity}</b>{" "}
                  <span className="px-2">{item.name}</span>{" "}
                  <span className="text-gray-600 px-2"> ({item.size}) </span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <p className="text-lg font-semibold">
                3 Months Supply{" "}
                <span className="text-gray-500 text-sm line-through">
                  {product.subscriptionInfo.regularPrice}
                </span>
              </p>
              <p className="text-2xl font-bold mb-4">
                {product.subscriptionInfo.price}{" "}
                <span className="text-sm font-normal text-gray-700">
                  ({product.subscriptionInfo.discount})
                </span>
              </p>

              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full bg-black text-white rounded-full p-4 mt-2 block text-center cursor-pointer disabled:opacity-70"
              >
                {isLoading ? "Adding to Cart..." : "Buy Now"}
              </button>
              <p className="text-center mt-3">
                *subscription can be cancelled at any time
              </p>
            </div>
          </div>
        </div>

        {/* Cart Popup */}
        <CartPopup
          isOpen={showCartPopup}
          onClose={() => setShowCartPopup(false)}
          productType="hair"
        />
      </>
    );
  }

  // Render the hair kit product (first section)
  if (isHairKit) {
    return (
      <>
        {/* Desktop View */}
        <div className="lg:flex hidden">
          <div className="w-1/2">
            <ProductImage src="https://mycdn.myrocky.com/wp-content/uploads/20240403135520/RockyHealth-HQ-88-scaled.jpg" />
          </div>
          <div className="w-1/2 pl-8 pt-10">
            <h2 className="text-4xl font-semibold text-gray-900 mb-5">
              MyRocky Hair Kit
            </h2>
            <p className="w-3/4 mb-5">
              A power house combination of prescription and natural hair
              products.
            </p>
            <p className="text-sm font-semibold mb-3">
              This kit includes:
              {/* This kit includes: Finasteride, Minoxidil, and Essential IX
              Shampoo. */}
            </p>
            <ul className="mb-5">
              {product.items.map((item, index) => (
                <li key={index}>
                  <b>{item.quantity}</b>{" "}
                  <span className="px-2">{item.name}</span>{" "}
                  <span className="text-gray-600 px-2"> ({item.size}) </span>
                </li>
              ))}
            </ul>

            <p className="text-sm font-semibold mb-3 mt-6">Select frequency:</p>

            {/* Render subscription options as radio buttons */}
            <div className="subscription-options">
              {product.subscriptionOptions.map((option) => (
                <CheckBox
                  key={option.id}
                  text={option.text}
                  price={option.price}
                  isSelected={selectedSubscription === option.value}
                  onSelect={handleSubscriptionChange}
                  value={option.value}
                />
              ))}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="w-full bg-black text-white rounded-full p-4 mt-5 block text-center cursor-pointer disabled:opacity-70"
            >
              {isLoading
                ? "Adding to Cart..."
                : `Buy Now — ${
                    getSelectedOption(product.subscriptionOptions)?.price
                  }`}
            </button>
            <p className="text-center mt-3">
              *subscription can be cancelled at any time
            </p>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          <div className="w-full">
            <h2 className="text-4xl font-semibold text-gray-900 mb-2">
              MyRocky Hair Kit
            </h2>
            <p className="w-full mb-5">
              A power house combination of prescription and natural hair
              products.
            </p>
            <ProductImage src="https://mycdn.myrocky.com/wp-content/uploads/20240403135520/RockyHealth-HQ-88-scaled.jpg" />
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold mb-3">This kit includes:</p>
            <ul className="mb-5">
              {product.items.map((item, index) => (
                <li key={index}>
                  <b>{item.quantity}</b>{" "}
                  <span className="px-2">{item.name}</span>{" "}
                  <span className="text-gray-600 px-2"> ({item.size}) </span>
                </li>
              ))}
            </ul>

            <p className="text-sm font-semibold mb-3 mt-6">Select frequency:</p>

            {/* Render subscription options as radio buttons */}
            <div className="subscription-options">
              {product.subscriptionOptions.map((option) => (
                <CheckBox
                  key={option.id}
                  text={option.text}
                  price={option.price}
                  isSelected={selectedSubscription === option.value}
                  onSelect={handleSubscriptionChange}
                  value={option.value}
                />
              ))}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="w-full bg-black text-white rounded-full p-4 mt-5 block text-center cursor-pointer disabled:opacity-70"
            >
              {isLoading
                ? "Adding to Cart..."
                : `Buy Now — ${
                    getSelectedOption(product.subscriptionOptions)?.price
                  }`}
            </button>
            <p className="text-center mt-3">
              *subscription can be cancelled at any time
            </p>
          </div>
        </div>

        {/* Cart Popup */}
        <CartPopup
          isOpen={showCartPopup}
          onClose={() => setShowCartPopup(false)}
          productType="hair"
        />
      </>
    );
  }

  // Render regular products
  return (
    <>
      <div className="lg:flex hidden">
        <div className="w-1/2">
          <ProductImage src={product.img} />
        </div>
        <div className="w-1/2 pl-8 pt-10">
          <h2 className="text-4xl font-semibold text-gray-900 mb-5">
            {product.name}
          </h2>
          <p className="w-3/4 mb-5">{product.description}</p>

          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="w-full bg-black text-white rounded-full p-4 mt-5 block text-center cursor-pointer disabled:opacity-70"
          >
            {isLoading ? "Adding to Cart..." : `Add to Cart`}
          </button>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <div className="w-full">
          <h2 className="text-4xl font-semibold text-gray-900 mb-2">
            {product.name}
          </h2>
          <p className="w-full mb-5">{product.description}</p>
          <ProductImage src={product.img} />
        </div>
        <div className="mt-4">
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="w-full bg-black text-white rounded-full p-4 mt-5 block text-center cursor-pointer disabled:opacity-70"
          >
            {isLoading ? "Adding to Cart..." : `Add to Cart`}
          </button>
        </div>
      </div>

      {/* Cart Popup */}
      <CartPopup
        isOpen={showCartPopup}
        onClose={() => setShowCartPopup(false)}
        productType="hair"
      />
    </>
  );
};

export default Product;
