import React from "react";

function ButtonsSection() {
  return (
    <div className="flex flex-col lg:flex-row gap-2">
      {data.buttons.map((button, index) => (
        <Link
          key={button.href ?? index}
          href={button.href}
          className={`h-11 md:px-[24px] py-3 md:py-[11.5px] rounded-[64px] flex items-center space-x-2 transition justify-center w-full md:w-fit  ${
            button.primary
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-white border-solid border border-black text-black hover:bg-gray-100"
          }`}
        >
          <span className="text-[14px] leading-[19.6px] md:leading-[21px] font-[500] md:font-[400]">
            {button.text}
          </span>
          <svg
            width="12"
            height="11"
            viewBox="0 0 12 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 0.5L6.285 1.1965L10.075 5H0V6H10.075L6.285 9.7865L7 10.5L12 5.5L7 0.5Z"
              fill={button.primary ? "white" : "black"}
            ></path>
          </svg>
        </Link>
      ))}
    </div>
  );
}

export default ButtonsSection;
