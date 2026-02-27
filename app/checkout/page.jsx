import CheckoutPageContent from "@/components/Checkout/CheckoutPageContent";
import { Suspense } from "react";

const CheckoutPage = async () => {
  return (
    <Suspense fallback={<></>}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
           #launcher {
          display: none !important;
        }
        iframe[title="Close message"] {
          display: none !important;
        }
        iframe[title="Message from company"] {
          display: none !important;
        }
        `,
        }}
      />
      <CheckoutPageContent />
    </Suspense>
  );
};

export default CheckoutPage;
