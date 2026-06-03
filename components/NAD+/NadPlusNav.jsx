import Navbar from "@/components/Navbar";

/** Same nav as the site header, minus Trustpilot + blue partner strip (not `navbar-main`). */
export default function NadPlusNav({
    className = "w-full  top-0 z-50 bg-white",
    ctaHref: _ctaHref,
}) {
    return <Navbar className={className} hideTrustpilot hidePartnerBanner />;
}
