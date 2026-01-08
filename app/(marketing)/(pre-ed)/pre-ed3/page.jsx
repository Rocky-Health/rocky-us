import { redirect } from "next/navigation";
import { getVariantCount } from "@/lib/constants/preEd3Variants";

/**
 * A/B Testing Redirect Handler for /pre-ed3
 *
 * This page randomly redirects users to one of 6 variation pages
 * on each visit. The redirect happens server-side for optimal performance.
 */
export default function PreEd3() {
  // Generate random number between 1 and 6 (inclusive)
  const variantCount = getVariantCount();
  const randomVariant = Math.floor(Math.random() * variantCount) + 1;

  // Redirect to the randomly selected variation
  redirect(`/pre-ed3/v${randomVariant}`);
}
