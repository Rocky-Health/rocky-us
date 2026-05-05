"use client";

import { ProductImage } from "@/components/Product";
import Link from "next/link";
import { formatPriceUI } from "@/utils/priceFormatter";

export default function BasicProductInfo({ product }) {
  if (!product) return null;


  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-semibold mb-2">
        {product.name}
      </h1>

      {product.price && (
        <div className="text-xl font-medium mb-4">
          ${formatPriceUI(product.price)}
        </div>
      )}

      {product.shortDescription && (
        <div
          className="text-gray-600 mb-6"
          dangerouslySetInnerHTML={{ __html: product.shortDescription }}
        />
      )}

      {/* Loading state for variations */}
      <div className="mb-6">
        <div className="animate-pulse h-12 bg-gray-200 rounded mb-3"></div>
        <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
      </div>

      {/* Loading state for Add to Cart button */}
      <div className="animate-pulse h-14 bg-gray-300 rounded"></div>

      {/* Consultation link placeholder */}
      <div className="mt-6 text-center">
        <Link href="/consultation" className="text-blue-600 underline">
          Need consultation? Talk to our healthcare providers
        </Link>
      </div>
    </div>
  );
}
