import CartPageContent from "@/components/Cart/CartPageContent";
import { Suspense } from "react";

const CartPage = () => {
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
      <CartPageContent />
    </Suspense>
  );
};

export default CartPage;
