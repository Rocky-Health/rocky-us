import React, { useState, useEffect } from "react";
import "./WLProductCard.css";

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 shrink-0 text-[#AE7E56]"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

const WLProductCard = ({ product, onSelect, isSelected }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [showModal]);

  if (!product) return null;

  const displayPrice = product.price ? `From ${product.price}` : null;
  const benefits = product.benefits || [];
  const shortDescription =
    product.description ||
    product.details ||
    "Meet with a provider to discuss your personalized care plan.";

  return (
    <>
      <div
        className={`flex flex-col md:max-w-[270px] rounded-2xl overflow-hidden border border-transparent drop-shadow-md cursor-pointer transition-all duration-300  hover:shadow-xl hover:scale-[1.01] `}
        onClick={() => product.supplyAvailable !== false && onSelect?.(product)}
      >
        {/* Top section: image with price tag overlay */}
        <div className="relative w-full aspect-[4/3] bg-[#80684b] overflow-hidden rounded-t-2xl">
          <img
            src={product.url}
            alt={product.name}
            className={`w-full h-full object-cover ${isSelected ? "opacity-100" : "grayscale brightness-90"} transition-opacity duration-300`}
            onError={(e) => {
              e.target.style.display = "none";
              const fallback = e.target.nextElementSibling;
              if (fallback) {
                fallback.classList.remove("hidden");
                fallback.classList.add(
                  "flex",
                  "items-center",
                  "justify-center",
                );
              }
            }}
          />
          <div className="absolute inset-0 hidden bg-[#80684b] rounded-t-2xl text-[#FFFFFF] text-sm">
            Product Image
          </div>
          <div className="absolute md:top-3 top-1 md:left-3 left-[10px] flex md:items-center items-start md:flex-row flex-col gap-2 md:h-auto h-[92%] md:w-[90%] justify-between">
            {displayPrice && (
              <span className=" bg-[#FFFFFFCC] text-[#000000] rounded-md py-[4px] px-[8px] font-[500] text-[13px] tracking-[-2%] leading-[140%]">
                {displayPrice}
              </span>
            )}
            {/* {product.limitedSupply && (
                            <span className=" bg-[#FFFFFFCC] text-[#000000] rounded-md py-[4px] px-[8px] font-[500] text-xs tracking-[-2%] leading-[140%] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 mb-0.5 rounded-full bg-[#E37400]"></span>
                                <span className="">Limited supply</span>
                            </span>
                        )} */}
            {product.label ? (
              <span className=" bg-[#FFFFFFCC] text-[#000000] rounded-md py-[4px] px-[8px] font-[500]  text-[13px] sm:tracking-[-2%] tracking-[-3%] leading-[140%] flex items-center gap-1 self-end">
                {/* <span className="w-1.5 h-1.5 rounded-full bg-[#78CD7F] animate-pulse"></span> */}
                <span className="">{product.label}</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Bottom section: product info */}
        <div
          className={`px-3 py-4 rounded-b-2xl flex flex-col grow  transition-all duration-300 border border-[1.5px] bg-[#F0EEEA] ${isSelected ? " border-[#AE7E56]" : " border-[#E2E2E1]"}`}
        >
          <h2
            className={`text-[16px] font-[500] leading-[140%]  tracking-[-2%]`}
          >
            {product.name}
            {product.isPrescription && (
              <span className="text-sm md:text-base align-top">®</span>
            )}
          </h2>
          {/* <p
            className={`text-[12px] font-[400] leading-[140%] md:grow-0 grow  ${isSelected ? "text-white" : "text-[#000000]"}`}
          >
            ({product.ingredient})
          </p> */}
          <p
            className={`text-[14px] font-[400] leading-[140%] tracking-[0%] transition-all my-3 duration-300   subheaders-font`}
          >
            {shortDescription}
          </p>

          {product.tags && (
            <ul className="flex flex-col gap-1.5 grow  list-inside list-disc ">
              {product.tags?.map((tag, index) => (
                <li
                  key={index}
                  className={`flex gap-2  w-full text-[12px] font-[200] subheaders-font leading-[140%] ${isSelected ? " text-[#F0EEEA]" : " text-[#000000] "} transition-all duration-300  px-1  `}
                >
                  <span className="">•</span> {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Product detail modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex md:items-center items-end md:justify-center justify-end  bg-black/60"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white md:rounded-2xl rounded-t-2xl shadow-xl max-w-3xl w-full overflow-hidden flex flex-col-reverse md:flex-row max-h-[96vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col ">
              <h2 className="text-xl sm:text-2xl font-[500] text-[#000000] leading-[140%] mb-2">
                {product.name}
                {product.isPrescription && (
                  <span className="text-sm align-top">®</span>
                )}
              </h2>
              <p className="text-xs text-[#000000] font-[400] leading-[114.9%] tracking-[-2%] bg-[#F0EEEA] rounded-sm p-2 mb-4 text-center">
                {shortDescription}
              </p>
              <div className="h-[40vh] overflow-y-auto WLProductCard-hied-scrollbar">
                {benefits.length > 0 && (
                  <ul className="space-y-2 mb-6">
                    {benefits.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm font-[400] leading-[140%] mb-2 text-[#000000]"
                      >
                        <CheckIcon />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <hr />
                {product.importantInfo && (
                  <div className="mb-6">
                    <h3 className="text-[18px] font-[500] leading-[140%] mt-6 text-[#000000] mb-2">
                      Important Information
                    </h3>
                    <p className="text-sm text-[#757575]">
                      {product.importantInfo}
                    </p>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="mt-auto w-full sm:w-auto bg-[#000000] text-white font-medium py-3 px-6 rounded-xl hover:bg-[#333333] focus:outline-none transition-colors "
                style={{
                  boxShadow: "0 -30px 20px 0px rgba(255,255,255,1)",
                }}
                onClick={() => {
                  product.supplyAvailable !== false && onSelect?.(product);
                  setShowModal(false);
                }}
              >
                Select
              </button>
            </div>

            {/* Right: image + price + close */}
            <div className="relative w-full md:w-[50%] shrink-0 bg-[#E8E4DF] rounded-b-2xl md:rounded-b-none md:rounded-r-2xl flex flex-col items-center justify-center  min-h-[100px]  md:min-h-0">
              <button
                type="button"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FFFFFFCC] text-[#000000] flex items-center justify-center hover:scale-95 focus:outline-none z-10 transition-all duration-300"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
              <div className="absolute top-3 left-3 flex md:items-center md:flex-row flex-col gap-2 items-start md:justify-start justify-between md:h-auto h-[90%]">
                {displayPrice && (
                  <span className=" bg-[#FFFFFFCC] text-[#000000] rounded-md py-[4px] px-[8px] font-[500] leading-[140%]">
                    {displayPrice}
                  </span>
                )}
                {product.limitedSupply && (
                  <span className=" bg-[#FFFFFFCC] text-[#000000] rounded-md py-[4px] px-[8px] font-[500]  leading-[140%] flex items-center gap-1">
                    <span className="w-2 h-2 mb-0.5 rounded-full bg-[#E37400]"></span>
                    <span className="">Limited supply</span>
                  </span>
                )}
              </div>
              <img
                src={product.uri_popup}
                alt={product.name}
                className="w-full h-full max-h-[40vh] md:max-h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WLProductCard;
