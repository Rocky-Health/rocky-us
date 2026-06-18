import OrderReceivedPageContent from "@/components/OrderReceived/OrderReceivedPageContent";
import EverFlowScript from "@/components/EverFlow/EverFlowScript";
import { Suspense } from "react";
import { cookies } from "next/headers";

const EF_OFFERS = {
  5094: { network: "rcr73qtl" },
  5096: { network: "vyrov30g" },
};

const OrderReceivedPage = async ({ params }) => {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const orderId = params?.id || "";

  const efOfferId = Number(cookieStore.get("ef_offer_id")?.value);
  const efOffer = EF_OFFERS[efOfferId];

  // Check if Awin tracking is enabled
  const awinEnabled = process.env.AWIN_ENABLED;
  const isAwinEnabled = awinEnabled === undefined || awinEnabled === "" || awinEnabled === "true" || awinEnabled === "1";

  return (
    <Suspense fallback={<></>}>
      <style dangerouslySetInnerHTML={{
        __html: `
          #launcher {
            display: none !important;
          }
        `
      }} />
      <OrderReceivedPageContent userId={userId} />
      {efOffer && (
        <EverFlowScript
          mode="conversion"
          offerId={efOfferId}
          network={efOffer.network}
          adv1={orderId}
          orderId={orderId}
        />
      )}
      {/* AWIN noscript fallback: use order_id when available so server computes values */}
      {isAwinEnabled && (
        <noscript>
          <img
            src={`/api/awin/track-order?order_id=${orderId}`}
            width="1"
            height="1"
            style={{ display: "none" }}
            alt=""
          />
        </noscript>
      )}
    </Suspense>
  );
};

export default OrderReceivedPage;
