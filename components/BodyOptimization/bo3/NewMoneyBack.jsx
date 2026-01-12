"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";

const MoneyBack = () => {
  const [IsOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
  };

  const closePopUp = () => {
    setIsOpen(false);
  };

  return (
    <section
      className="bg-[#fff] md:h-[226px] h-[395px] md:p-10 px-5 py-10 bg-[length:100%_1px] bg-no-repeat bg-[position:top,bottom]"
      style={{
        backgroundImage: `linear-gradient(90deg, #FFF 0%, #E2E2E1 51.44%, #FFF 100%),
                          linear-gradient(90deg, #FFF 0%, #E2E2E1 51.44%, #FFF 100%)`,
      }}
    >
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-center ">
        <div className="w-[147px]">
          <img
            loading="lazy"
            src="https://myrocky.b-cdn.net/WP%20Images//bo3/new/guarantee.png"
            alt="Lose-Weight-or-Your-Money-Back"
            className="mx-auto w-full object-cover"
          />
        </div>
        <div className="text-center md:text-start">
          <h2 className="text-[#000] text-center md:text-start text-[32px]  headers-font not-italic leading-[115%] tracking-[-0.64px] mb-2">
            See Progress or Your Money Back
          </h2>
          <p className="text-[rgba(0,0,0,0.80)] text-center text-[16px] font-[400] not-italic leading-normal mb-3">
            Transform your body or we'll fully refund all your consultation
            costs.
          </p>
          <button
            onClick={openModal}
            id="open-modal"
            className="underline text-[16px] font-[500]"
          >
            Learn more
          </button>
        </div>
      </div>

      {IsOpen && (
        <>
          <div className="bg-black bg-opacity-50 fixed inset-0 z-40"></div>
          <div
            aria-hidden="true"
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="relative bg-white rounded-2xl p-4 w-full max-w-2xl  mx-4 overflow-y-auto  max-h-[90dvh] shadow-xl">
              <button
                onClick={closePopUp}
                className="button absolute right-[20px] top-[20px] w-[24px] h-[24px] lg:w-[32px] lg:h-[32px] flex items-center justify-center rounded-full bg-[#E2E2E1]"
              >
                <FaTimes className="font-thin" />
              </button>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="https://myrocky.b-cdn.net/WP%20Images//bo3/new/guarantee.png"
                  alt="Lose-Weight-or-Your-Money-Back"
                  className="w-[60px] h-[60px] lg:w-[80px] lg:h-[80px]"
                />
                <h2 className="text-[22px] lg:text-[32px] font-[550] headers-font max-w-[182px] md:max-w-full leading-[24.53px]">
                  Lose Weight or Your Money Back
                </h2>
              </div>
              <div className="text-[14px] lg:text-[16px] font-[350]">
                <p className="mb-4">
                  The body optimization money back guarantee only applies for
                  the consultation costs incurred and NOT the cost of
                  medication.
                </p>
                <p className="mb-4">
                  In order to be eligible, the patient must have been on
                  treatment for a minimum of 180 days. They must notify us
                  between 180 days and 210 days to be eligible for a review.
                </p>
                <p className="mb-4">
                  In order to qualify for the Body Optimization treatment money
                  back guarantee, patients must also satisfy all of the
                  following criteria:
                </p>
              </div>
              <ul className="list-decimal pl-4 space-y-3 text-[14px] lg:text-[16px] font-[350]">
                <li>
                  {" "}
                  Patient has completed their lab work within 4 weeks of
                  starting treatment and discussed the results with their
                  clinician.
                </li>
                <li>
                  {" "}
                  Be on treatment for a minimum of 6 months with no pauses or
                  breaks in treatment.
                </li>
                <li> Ensure you take the medication as prescribed.</li>
                <li>
                  {" "}
                  Track your weight weekly from the day you start treatment and
                  be able to provide us with a record of this if asked for.{" "}
                </li>
                <li>
                  {" "}
                  Must provide appropriate images from the initial consultation
                  which clearly shows your fat distribution and be able to
                  provide images for comparison after 6 months.
                </li>
                <li>
                  {" "}
                  You have lost less than 5% of your starting body weight, with
                  a starting BMI of 27 or higher.
                </li>
                <li>
                  {" "}
                  Patient must provide an image proving their current weight on
                  a scale with light clothing to minimize additional weight.
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default MoneyBack;
