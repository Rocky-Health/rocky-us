import ContactUsContent from "@/components/ContactUs/ContactUsContent";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Contact MyRocky",
  description:
    "Get in touch with MyRocky's care team — questions about treatment, prescriptions, orders, or your account. We respond within one business day.",
  path: "/contact-us",
});

export default async function ContactUs() {
  return (
    <ContactUsContent />
  );
}
