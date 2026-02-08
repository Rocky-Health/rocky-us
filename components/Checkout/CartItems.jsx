import Image from "next/image";
import { formatPrice } from "@/utils/priceFormatter";

const CartItems = ({ items }) => {
  return (
    <div className="w-full">
      {items.map((item) => (
        <div key={item.key}>
          <CartItem item={item} />
          <hr />
        </div>
      ))}
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
                  (v) => v.attribute?.toString().toLowerCase() === "flavors"
                )?.value && (
                  <>
                    {" / "}
                    <span className="text-[12px] font-normal">
                      {
                        item.variation.find(
                          (v) =>
                            v.attribute?.toString().toLowerCase() === "flavors"
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
            {formatPrice(itemPrice)} / <span className="text-[12px] font-normal">every 3 months</span>
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
                  <span className="text-[14px] line-through text-gray-400">$547.00</span>
                  <span className="text-[14px] font-[600] text-[#212121]">$397.00</span>
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
                  <span className="text-[14px] line-through text-gray-400">$297.00</span>
                  <span className="text-[14px] font-[600] text-[#212121]">$200.00</span>
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
          {isSubscriptionWithFallback && !isOfferProduct && "Pause Or Cancel Anytime"}
        </p>
      </div>
    </div>
  );
};
