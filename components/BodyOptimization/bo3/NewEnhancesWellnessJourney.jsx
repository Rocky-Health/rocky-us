import AccordionList from "@/components/AccordionList";

const accordionData = [
  {
    subtitle: "Today",
    title: "Start your initial consultation ($99)",
    content:
      "Share your health history and weight loss goals with us online to get started. One of our healthcare providers will review your answers and get back to you within 24hrs.",
    image: "https://myrocky.b-cdn.net/WP%20Images/bo3/new/Startyour.jpg",
    isFirst: true,
  },
  {
    subtitle: "In 3 days",
    title: "Take a lab test",
    content:
      "If you're a candidate for treatment, our clinician will provide you with the appropriate lab requisition or alternatively you can provide us with recent results.",
    image: "https://myrocky.b-cdn.net/WP%20Images/bo3/new/Takealabtest.jpg",
  },
  {
    subtitle: "Within 3 days",
    title: "Provider writes an Rx",
    content:
      "You will have the opportunity to ask any questions you may have prior to a prescription being issued. Your clinician will provide you with advice best suited to your needs.",
    image: "https://myrocky.b-cdn.net/WP%20Images/bo3/new/Provider.jpg",
  },
  {
    subtitle: "Free & Discreet 2-Day Delivery",
    title: "Get your medication",
    content:
      "Your medication will arrive within 1-2 business days. Sometimes it may take longer depending on where you live.",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/bo3/new/Getyourmedication.jpg",
  },
  {
    subtitle: "On-going care & support",
    title: "Begin treatment",
    content:
      "You'll have access to your clinician and the pharmacy team at all times should you have any questions.",
    image: "https://myrocky.b-cdn.net/WP%20Images/bo3/new/Begintreatment.jpg",
  },
];
const EnhancesWellnessJourney = () => {
  return (
    <>
      <h2 className="text-center text-[32px] md:text-5xl font-[550] leading-[36.8px] md:leading-[55.2px] tracking-[-0.01em]  md:tracking-[-0.02em] mb-3 md:mb-4 headers-font">
        How Rocky Enhances Your Wellness Journey
      </h2>
      <p className="text-center mx-auto text-base md:text-lg font-[400] leading-[22.4px] md:leading-[25.2px] mb-10 md:mb-14 max-w-[300px] md:max-w-full ">
        Digital Healthcare, without the long wait times.
      </p>
      <AccordionList data={accordionData} />
    </>
  );
};

export default EnhancesWellnessJourney;
