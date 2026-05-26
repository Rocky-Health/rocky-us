"use client";

import { useEffect, useState } from "react";
import { logger } from "@/utils/devLogger";
import ProductSkeleton from "./ProductSkeleton";
import ProductPageContent from "@/components/Product/ProductPageContent";
import ProductNotFound from "@/components/Product/ProductNotFound";
import ZonnicProductPageContent from "./ZonnicProductPageContent";
import DhmBlendProductPageContent from "./DhmBlend/DhmBlendProductPageContent";
import BodyOptimizationProductPageContent from "./body-optimization/BodyOptimizationProductPageContent";
import SupplementsProductPageContent from "./Supplements/SupplementsProductPageContent";
import { useProductTracking } from "@/lib/hooks/useGA4Tracking";
import { analyticsService } from "@/utils/analytics/analyticsService";
import { useAutoApplyCoupon } from "@/lib/hooks/useAutoApplyCoupon";

export default function ProductClientWrapper({ slug, initialData = null }) {
  const [productData, setProductData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);

  useAutoApplyCoupon();

  // Check if this is a ZONNIC product
  const isZonnicProduct =
    slug === "zonnic" || slug?.toLowerCase().includes("zonnic");

  // Check if this is a DHM Blend product
  const isDhmBlendProduct =
    slug === "dhm-blend" || slug?.toLowerCase().includes("dhm-blend");

  // Check if this is a supplements product
  const isSupplementsProduct =
    slug === "essential-night-boost" ||
    slug?.toLowerCase().includes("essential-night-boost") ||
    slug?.toLowerCase().includes("essential-mood-balance") ||
    slug?.toLowerCase().includes("essential-gut-relief") ||
    slug?.toLowerCase().includes("night-boost") ||
    slug?.toLowerCase().includes("mood-balance") ||
    slug?.toLowerCase().includes("gut-relief") ||
    slug?.toLowerCase().includes("testosterone-support") ||
    slug?.toLowerCase().includes("hair-growth-support");

  const bodyOptimizationProducts = [
    "ozempic",
    "mounjaro",
    "wegovy",
    "rybelsus",
  ];
  const isBodyOptimizationProduct = bodyOptimizationProducts.some((product) =>
    slug?.toLowerCase().includes(product)
  );

  useEffect(() => {
    if (initialData) {
      setProductData(initialData);
      setLoading(false);
      return;
    }
    async function fetchProductData() {
      try {
        const response = await fetch(`/api/products/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("not_found");
          } else {
            setError("server_error");
          }
          return;
        }
        const data = await response.json();
        setProductData(data);
        setError(false);
      } catch (error) {
        logger.error("Error fetching product data:", error);
        setError("server_error");
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
  }, [slug, initialData]);

  // Extract basic product info
  const basicData = productData?.clientProps?.product;
  // Check if we are still loading the full product data
  const fullDataLoading =
    productData && !productData.clientProps?.variations && !error;

  // Initialize GA4 tracking for product view
  // This will automatically track view_item when product data is loaded
  useProductTracking(basicData, {
    debug: process.env.NODE_ENV === "development",
    enabled: !!basicData && !error && !loading,
  });

  // Also trigger a headless_page_view for SPA navigation when product changes
  useEffect(() => {
    if (basicData && !loading && !error) {
      const pagePath =
        typeof window !== "undefined"
          ? window.location.pathname
          : `/product/${slug}`;
      analyticsService.trackHeadlessPageView({
        page_title: basicData.name || slug,
        page_path: pagePath,
      });
    }
  }, [basicData, loading, error, slug]);

  // Show skeleton during initial loading
  if (loading) {
    return <ProductSkeleton />;
  }

  // Handle error states
  if (error === "not_found") {
    return <ProductNotFound />;
  }
  if (error === "server_error" || !basicData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p>
          We're having trouble loading this product. Please try again later.
        </p>
      </div>
    );
  }

  // If this is a supplements product, use the supplements-specific product page
  if (isSupplementsProduct) {
    // If we have basic data but full data is still loading,
    // render the page with basic info and loading states for dynamic content
    if (fullDataLoading) {
      return (
        <SupplementsProductPageContent
          clientProps={{
            product: {
              ...basicData,
              loading: true,
            },
            productType: null,
            variationType: null,
            variations: null,
            consultationLink: null,
            isLoading: true,
          }}
          faqs={[]}
        />
      );
    }

    // Render the supplements product page content with the complete fetched data
    return (
      <SupplementsProductPageContent
        {...productData}
        clientProps={{
          ...productData.clientProps,
          isLoading: false,
        }}
      />
    );
  }

  // If this is a ZONNIC product, use the ZONNIC-specific product page
  if (isZonnicProduct) {
    // If we have basic data but full data is still loading,
    // render the page with basic info and loading states for dynamic content
    if (fullDataLoading) {
      return (
        <ZonnicProductPageContent
          clientProps={{
            product: {
              ...basicData,
              loading: true,
            },
            productType: null,
            variationType: null,
            variations: null,
            consultationLink: null,
            isLoading: true,
          }}
          faqs={[]}
        />
      );
    }

    // Render the ZONNIC product page content with the complete fetched data
    // Make sure to explicitly set isLoading to false
    return (
      <ZonnicProductPageContent
        {...productData}
        clientProps={{
          ...productData.clientProps,
          isLoading: false,
        }}
      />
    );
  }

  // If this is a DHM Blend product, use the DHM Blend-specific product page
  if (isDhmBlendProduct) {
    // If we have basic data but full data is still loading,
    // render the page with basic info and loading states for dynamic content
    if (fullDataLoading) {
      return (
        <DhmBlendProductPageContent
          clientProps={{
            product: {
              ...basicData,
              loading: true,
            },
            productType: null,
            variationType: null,
            variations: null,
            consultationLink: null,
            isLoading: true,
          }}
        />
      );
    }

    // Render the DHM Blend product page content with the complete fetched data
    return <DhmBlendProductPageContent {...productData} />;
  }

  if (isBodyOptimizationProduct) {
    if (fullDataLoading) {
      return (
        <BodyOptimizationProductPageContent
          clientProps={{
            product: {
              ...basicData,
              loading: true,
            },
            productType: null,
            variationType: null,
            variations: null,
            consultationLink: null,
            isLoading: true,
          }}
          faqs={[]}
        />
      );
    }

    return <BodyOptimizationProductPageContent {...productData} />;
  }

  // For regular products, use the standard product page
  // If we have basic data but full data is still loading,
  // render the page with basic info and loading states for dynamic content
  if (fullDataLoading) {
    return (
      <ProductPageContent
        clientProps={{
          product: {
            ...basicData,
            loading: true,
          },
          productType: null,
          variationType: null,
          variations: null,
          consultationLink: null,
          isLoading: true,
        }}
        faqs={[]}
      />
    );
  }

  // Render the product page content with the complete fetched data
  return <ProductPageContent {...productData} />;
}
