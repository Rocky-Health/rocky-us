import OrderPayContent from "@/components/Checkout/OrderPayContent";
import { Suspense } from "react";

export const metadata = {
  title: "Complete Your Payment",
  description: "Complete payment for your order",
};

const OrderPayPage = async ({ params }) => {
  const resolvedParams = await params;
  const orderId = resolvedParams?.orderId || "";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <OrderPayContent orderId={orderId} />
    </Suspense>
  );
};

export default OrderPayPage;
