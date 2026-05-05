import Navbar from "@/components/Navbar";

/** Same nav as the site header, minus Trustpilot + blue partner strip (not `navbar-main`). */
export default function MedViNav({ className = "w-full", ctaHref: _ctaHref }) {
  return (
    <Navbar
      className={className}
      hideTrustpilot
      hidePartnerBanner
    />
  );
}
