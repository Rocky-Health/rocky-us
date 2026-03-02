import Image from "next/image";
import { formatPrice } from "@/utils/priceFormatter";
import { useState } from "react";
import { logger } from "@/utils/devLogger";

const CartItems = ({ items }) => {
  return (
    <div className="w-full">
      {items.map((item) => (
        <div key={item.key}>
          <CartITem2 item={item} />
        </div>
      ))}

      <p className="text-center text-[#6C695C] text-[13px] leading-[140%] my-[16px]">
        Pause or cancel anytime
      </p>

      {items.some((item) => item.name === "Body Optimization Program") && (
        <div className="bg-[#F4F7F3] rounded-[8px] p-[12px] text-center my-[16px]">
          <p className="text-[14px] font-medium leading-[140%] mb-[8px]">
            💪 180-Day Money-Back Guarantee
          </p>
          <p className="text-[11px] text-[#6C695C] leading-[140%] font-normal">
            You’ll lose weight and feel fully satisfied with our program. Or
            you’ll receive a prompt, full refund.
          </p>
        </div>
      )}

      <hr></hr>
    </div>
  );
};

export default CartItems;

const CartItem = ({ item }) => {
  const itemPrice = item.totals.line_total / 100;

  const currencySymbol = item.prices.currency_symbol || "$"; // Default to $

  const subscription = item.extensions?.subscriptions;
  const isSubscription = subscription && subscription.billing_interval;

  // Special handling for Sublingual Semaglutide product (ID: 490537)
  // This product should be treated as a monthly subscription even if WooCommerce metadata is missing
  const isOralSemaglutide = item.id === 490537 || item.product_id === 490537;
  const isSubscriptionWithFallback = isSubscription || isOralSemaglutide;

  // Check if this is the special offer product [GLP-1] Buy 2 Get 1 Free
  const isOfferProduct = item.id === 489780 || item.product_id === 489780;

  let supply = "";
  if (
    subscription &&
    subscription.billing_interval &&
    subscription.billing_period
  ) {
    const interval = subscription.billing_interval;
    const period = subscription.billing_period;

    // Pluralize the period if interval > 1
    const pluralPeriod = interval > 1 ? `${period}s` : period;
    supply = `every ${interval} ${pluralPeriod}`;
  } else if (isOralSemaglutide) {
    // Default to monthly for Sublingual Semaglutide if no subscription data
    supply = "every 4 weeks";
  }

  const intervalText = isSubscriptionWithFallback ? `${supply}` : "";

  return (
    <div className="flex gap-4 py-4 w-full">
      <Image
        width={65}
        height={65}
        src={item.images[0]?.thumbnail}
        alt={item.name}
        className="rounded-md min-w-[65px] min-h-[65px] w-[65px] h-[65px]"
      />
      <div className="text-[14px] font-semibold">
        <h5>
          <span dangerouslySetInnerHTML={{ __html: item.name }}></span>{" "}
          {!isSubscriptionWithFallback &&
            item.variation[0] &&
            `(${item.variation[0]?.value})`}
        </h5>

        {item.name != "Body Optimization Program" && !isOfferProduct && (
          <p className="text-[12px]">
            {currencySymbol}
            {formatPrice(itemPrice)} /{" "}
            <span className="text-[12px] font-normal">
              {isSubscriptionWithFallback && intervalText}
              {!isSubscriptionWithFallback &&
                item.variation[1] &&
                item.variation[1]?.value}
              {item.name?.toString().toLowerCase().includes("zonnic") &&
                item.variation?.find(
                  (v) => v.attribute?.toString().toLowerCase() === "flavors",
                )?.value && (
                  <>
                    {" / "}
                    <span className="text-[12px] font-normal">
                      {
                        item.variation.find(
                          (v) =>
                            v.attribute?.toString().toLowerCase() === "flavors",
                        )?.value
                      }
                    </span>
                  </>
                )}
            </span>
          </p>
        )}
        {isOfferProduct && (
          <p className="text-[12px]">
            {currencySymbol}
            {formatPrice(itemPrice)} /{" "}
            <span className="text-[12px] font-normal">every 3 months</span>
          </p>
        )}
        {isOfferProduct && (
          <div className="flex flex-col mt-3 gap-3">
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col">
                <p className="text-[14px] font-[400] text-[#212121]">
                  Medication (3 months)
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[14px] line-through text-gray-400">
                    $547.00
                  </span>
                  <span className="text-[14px] font-[600] text-[#212121]">
                    $397.00
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-[600] text-green-700 bg-green-100 px-2 py-1 rounded whitespace-nowrap">
                SAVE $150
              </span>
            </div>

            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col">
                <p className="text-[14px] font-[400] text-[#212121]">
                  Provider Consultations (3 months)
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[14px] line-through text-gray-400">
                    $297.00
                  </span>
                  <span className="text-[14px] font-[600] text-[#212121]">
                    $200.00
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-[600] text-green-700 bg-green-100 px-2 py-1 rounded whitespace-nowrap">
                SAVE $97
              </span>
            </div>

            <p className="text-gray-500 mt-1 font-normal text-[12px]">
              Pause Or Cancel Anytime
            </p>
          </div>
        )}
        {item.name === "Body Optimization Program" && (
          <div className="flex flex-col">
            <p className="text-sm md:text-base font-[500] text-[#212121] underline text-nowrap">
              Monthly membership:
            </p>
            <p className="text-sm md:text-base font-[300] text-[#212121]">
              Initial fee $99 | Monthly fee $99
            </p>
            <p className="text-sm md:text-base font-[500] text-[#212121] mt-2 underline">
              Includes:
            </p>
            <ul className="text-sm md:text-base font-[300] text-[#212121] list-none pl-5">
              <li className="text-nowrap">- Monthly prescription</li>
              <li className="text-nowrap">- Follow-ups with clinicians</li>
              <li className="text-nowrap">- Pharmacist counselling</li>
            </ul>
          </div>
        )}
        <p className="text-gray-500 mt-1 font-thin text-[12px]">
          {isSubscriptionWithFallback &&
            !isOfferProduct &&
            "Pause Or Cancel Anytime"}
        </p>
      </div>
    </div>
  );
};

const CartITem2 = ({ item }) => {
  logger.log("itemms ->" ,item);
  const itemPrice = item.totals.line_subtotal / 100;

  const currencySymbol = item.prices.currency_symbol || "$"; // Default to $

  const subscription = item.extensions?.subscriptions;
  const isSubscription = subscription && subscription.billing_interval;

  // Special handling for Sublingual Semaglutide product (ID: 490537)
  // This product should be treated as a monthly subscription even if WooCommerce metadata is missing
  const isOralSemaglutide = item.id === 490537 || item.product_id === 490537;
  const isSubscriptionWithFallback = isSubscription || isOralSemaglutide;

  // Check if this is the special offer product [GLP-1] Buy 2 Get 1 Free
  const isOfferProduct = item.id === 489780 || item.product_id === 489780;

  let supply = "";
  if (
    subscription &&
    subscription.billing_interval &&
    subscription.billing_period
  ) {
    const interval = subscription.billing_interval;
    const period = subscription.billing_period;

    // Pluralize the period if interval > 1
    const pluralPeriod = interval > 1 ? `${period}s` : period;
    supply = `every ${interval} ${pluralPeriod}`;
  } else if (isOralSemaglutide) {
    // Default to monthly for Sublingual Semaglutide if no subscription data
    supply = "every 4 weeks";
  }

  const intervalText = isSubscriptionWithFallback ? `${supply}` : "";

  const [showIncluded, setShowIncluded] = useState(false);

  const toggleIncluded = () => {
    setShowIncluded((prev) => !prev);
  };

  return (
    <div className="flex gap-4 py-4 w-full justify-between">
      <div className="flex gap-4  w-full">
        <Image
          width={56}
          height={56}
          src={
            item.name == "Body Optimization Program"
              ? "/products/wlProg.webp"
              : item.images[0]?.thumbnail
          }
          alt={item.name}
          className="rounded-[12px] border-[2px] border-white shadow-[0px_0px_4px_0px_#0000003D] min-w-[56px] min-h-[56px] w-[56px] h-[56px]"
        />
        <div className="text-[14px]">
          <h5>
            <span
              dangerouslySetInnerHTML={{
                __html:
                  item.name == "Body Optimization Program"
                    ? "Weight Loss Program"
                    : item.name,
              }}
            ></span>{" "}
            {!isSubscriptionWithFallback &&
              item.variation[0] &&
              `(${item.variation[0]?.value})`}
          </h5>

          {item.name != "Body Optimization Program" && !isOfferProduct && (
            <p className="text-[11px] text-[#6C695C]">
              <span className=" font-normal">
                {isSubscriptionWithFallback && intervalText}
                {!isSubscriptionWithFallback &&
                  item.variation[1] &&
                  item.variation[1]?.value}
                {item.name?.toString().toLowerCase().includes("zonnic") &&
                  item.variation?.find(
                    (v) => v.attribute?.toString().toLowerCase() === "flavors",
                  )?.value && (
                    <>
                      {" / "}
                      <span className=" font-normal">
                        {
                          item.variation.find(
                            (v) =>
                              v.attribute?.toString().toLowerCase() ===
                              "flavors",
                          )?.value
                        }
                      </span>
                    </>
                  )}
              </span>
            </p>
          )}
          {isOfferProduct && (
            <p className="text-[12px]">
              {currencySymbol}
              {formatPrice(itemPrice)} /{" "}
              <span className="text-[12px] font-normal">every 3 months</span>
            </p>
          )}
          {isOfferProduct && (
            <div className="flex flex-col mt-3 gap-3">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col">
                  <p className="text-[14px] font-[400] text-[#212121]">
                    Medication (3 months)
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[14px] line-through text-gray-400">
                      $547.00
                    </span>
                    <span className="text-[14px] font-[600] text-[#212121]">
                      $397.00
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-[600] text-green-700 bg-green-100 px-2 py-1 rounded whitespace-nowrap">
                  SAVE $150
                </span>
              </div>

              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col">
                  <p className="text-[14px] font-[400] text-[#212121]">
                    Provider Consultations (3 months)
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[14px] line-through text-gray-400">
                      $297.00
                    </span>
                    <span className="text-[14px] font-[600] text-[#212121]">
                      $200.00
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-[600] text-green-700 bg-green-100 px-2 py-1 rounded whitespace-nowrap">
                  SAVE $97
                </span>
              </div>

              <p className="text-gray-500 mt-1 font-normal text-[12px]">
                Pause Or Cancel Anytime
              </p>
            </div>
          )}
          {item.name === "Body Optimization Program" && (
            // <div className="flex flex-col">
            //   <p className="text-sm md:text-base font-[500] text-[#212121] underline text-nowrap">
            //     Monthly membership:
            //   </p>
            //   <p className="text-sm md:text-base font-[300] text-[#212121]">
            //     Initial fee $99 | Monthly fee $99
            //   </p>
            //   <p className="text-sm md:text-base font-[500] text-[#212121] mt-2 underline">
            //     Includes:
            //   </p>
            //   <ul className="text-sm md:text-base font-[300] text-[#212121] list-none pl-5">
            //     <li className="text-nowrap">- Monthly prescription</li>
            //     <li className="text-nowrap">- Follow-ups with clinicians</li>
            //     <li className="text-nowrap">- Pharmacist counselling</li>
            //   </ul>
            // </div>
            <>
              <p className="text-[11px] text-[#6C695C]">every 4 Weeks</p>
              <div className="relative inline-block">
                <p
                  onClick={toggleIncluded}
                  className="font-poppins font-normal text-[11px] leading-[140%] tracking-[-0.02em] align-middle underline decoration-solid decoration-0 cursor-pointer"
                >
                  What's Included?
                </p>
                {showIncluded && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowIncluded(false)}
                    />
                    <div className="absolute left-0 bottom-full mb-2 z-50 w-[200px] bg-white rounded-[8px] shadow-[0px_4px_16px_0px_#00000026] border border-[#E2E2E1] p-3">
                      <div className="absolute left-3 bottom-[-6px] w-3 h-3 bg-white border-r border-b border-[#E2E2E1] rotate-45" />
                      <p className="text-[11px] font-[600] text-[#212121] mb-2">
                        Includes:
                      </p>
                      <ul className="list-none text-[11px] text-[#6C695C] space-y-1">
                        <li className="flex items-center gap-1">
                          ✓ Prescriptions
                        </li>
                        <li className="flex items-center gap-1">
                          ✓ Provider check-ins
                        </li>
                        <li className="flex items-center gap-1">
                          ✓ Unlimited medical support
                        </li>
                        <li className="flex items-center gap-1">
                          ✓ Lifestyle & nutrition coaching
                        </li>
                        <li className="flex items-center gap-1">
                          ✓ Access to exclusive tools
                        </li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="">
        { item.name == "Body Optimization Program" ? <>
          <span className="text-green-500">FREE</span>
        </> : currencySymbol + formatPrice(itemPrice)}
      </div>
    </div>
  );
};
