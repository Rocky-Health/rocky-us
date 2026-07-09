export const nadPlusFaqs = [
  {
    question: "How does NAD+ support cellular energy?",
    answer:
      "NAD+ powers the mitochondria — the energy producers inside every cell — by helping convert nutrients from food into ATP, the fuel your cells run on. Healthy NAD+ levels support efficient cellular function, metabolism, recovery, and the everyday processes that keep you feeling energized.",
  },
  {
    question: "Why do NAD+ levels decline with age?",
    answer:
      "NAD+ levels naturally decrease over time due to aging, stress, lifestyle factors, and everyday cellular wear and tear. Lower NAD+ availability has been associated with reduced cellular efficiency and changes in energy production.",
  },
  {
    question: "How do I know if NAD+ is right for me?",
    answer:
      "NAD+ support may be appropriate for individuals looking to optimize energy, recovery, focus, or overall wellness as part of a broader longevity strategy.",
  },
  {
    question: "Is this part of a personalized longevity plan?",
    answer:
      "Yes. NAD+ support can be integrated into a broader longevity-focused approach that may include advanced lab testing, lifestyle optimization, supplementation, and personalized wellness recommendations.",
  },
  {
    question: "Where is the treatment sourced and prepared?",
    answer:
      "Our NAD+ is third-party tested for quality and consistency, and packaged in the USA. We work with regulated partners to help ensure high manufacturing and quality standards throughout the process.",
  },
];
export const nadPlusFaqsV2 = [
  {
    question: "What is NAD+ and what does it do?",
    answer:
      "NAD+ is a coenzyme naturally found in the body that plays a key role in cellular energy production, metabolism, and repair processes. NAD+ levels naturally decline with age.",
  },
  {
    question: "How is injectable NAD+ different from supplements?",
    answer:
      "Injectable NAD+ bypasses digestion and delivers NAD+ directly into the body through subcutaneous administration, which may offer more reliable absorption compared to oral supplements.",
  },
  {
    question: "How quickly will I notice results?",
    answer:
      "Some patients notice improvements in energy, clarity, or recovery within weeks, while others experience more gradual changes over months. Results vary between individuals.",
  },
  {
    question: "Are NAD+ injections safe?",
    answer:
      "NAD+ therapy is reviewed by a licensed clinician to determine if it is appropriate for you. As with any treatment, there are potential risks and side effects that will be discussed during the assessment process.",
  },
  {
    question: "Does the injection hurt?",
    answer:
      "The injections use a very small needle similar to insulin injections. Most patients describe only mild discomfort or a brief pinch.",
  },
  {
    question: "Do I need a prescription?",
    answer:
      "Yes. NAD+ injections require an assessment by a licensed clinician to determine if treatment is appropriate for you.",
  },
];

export const EXPERT_PRICING_DATA = {
  heading: "Expert-guided NAD+, at prices you can afford",
  // US price is $99/month (SKU 490785). The "$600+ in-clinic" comparison
  // framing is retained; it still reads correctly against $99, but the exact
  // in-clinic figure may need business confirmation.
  description:
    "In-clinic NAD+ sessions are often $600+ each, and consultations and follow-ups are typically billed separately. Our at-home NAD+ therapy is only $99 a month for a full-month supply, with everything included: clinician oversight, tailored dosing, and discreet delivery to your door.",
  ctaText: "Get Started",
  ctaHref: "/nad-consultation-quiz",
  image: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/expert.png",
  imageMobile:
    "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/expert-mobile.png",
  imageAlt: "Active couple enjoying outdoor sport together",
  overlayLabel: "NAD+ support",
  overlayItems: [
    { label: "Energy", icon: "energy" },
    { label: "Focus", icon: "focus" },
    { label: "Vitality", icon: "vitality" },
  ],
  benefitItems: [
    { label: "Energy levels", direction: "up" },
    { label: "Mental clarity", direction: "up" },
    { label: "Mood", direction: "up" },
    { label: "Sleep quality", direction: "up" },
    { label: "Recovery", direction: "up" },
    { label: "Cravings", direction: "down" },
    { label: "Cellular health", direction: "up" },
    { label: "At-home convenience", direction: "up" },
  ],
};

export const PROTOCOL_DATA = {
  partnerHeadline: "Proud partner of leading sports organizations",
  partners: [
    {
      name: "Toronto Blue Jays",
      subtitle: "MLB - 2X WORLD SERIES CHAMPIONS",
      image: "https://myrocky.b-cdn.net/Longevity-dark-assets/2%20-%20TBJ.gif",
      logo: "https://myrocky.b-cdn.net/WP%20Images/proud-logo/TBJ.png",
      mobileLogo: "https://myrocky.b-cdn.net/WP%20Images/proud-logo/TBJ.png",
      logoWidth: 35,
      logoHeight: 30,
      mobileLogoWidth: 72,
      mobileLogoHeight: 70,
    },

    {
      name: "Toronto Maple Leafs",
      subtitle: "NHL - 13X STANLEY CUP CHAMPIONS",
      image: "/NAD+/man.png",
      logo: "https://myrocky.b-cdn.net/WP%20Images/proud-logo/TML-Primary-White-R.png",
      mobileLogo:
        "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/TML.png",
      logoWidth: 31,
      logoHeight: 30,
      mobileLogoWidth: 61,
      mobileLogoHeight: 70,
    },
    {
      name: "NBA",
      subtitle: "World's premier basketball league",
      image:
        "https://myrocky.b-cdn.net/Longevity-dark-assets/2.3%20-%20NBA.gif",
      logo: "/npa-logo.png",
      logoWidth: 15,
      logoHeight: 35,
      bigLogo: true,
      mobileLogo:
        "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/nba.png",
      mobileLogoWidth: 108,
      mobileLogoHeight: 64,
    },
  ],
};

// US standalone NAD+ product payload. NOTE: the US /longevity-nad-lp flow does
// NOT consume this object — useNadCheckout.js builds its mainProduct inline
// (SKU 490785, $99/month) and routes through utils/flowCartHandler.js. Kept
// here for parity with the CA data module and any future direct-add use.
// TODO(TK-830): pending Cam confirmation — pa_din "00005005" and pa_brand
// "Create Labs" are CA-specific. Confirm these should NOT be sent for the US
// SKU (pa_din likely dropped). They are not user-facing and are not required
// by the US addToCartDirectly path, so they are intentionally omitted from the
// live US product payload in useNadCheckout.js.
export const STANDALONE_NAD_PRODUCT = {
  productId: 490785,
  variationId: 490785,
  name: "NAD+",
  price: 99,
  regularPrice: 99,
  isSubscription: true,
  subscriptionPeriod: "1_month",
  // TODO(TK-830): confirm US asset URL. CA CDN image retained for now.
  image:
    "https://mycdn.myrocky.ca/wp-content/uploads/20260528123657/nad.webp",
  variation: [
    { attribute: "pa_subscription-type", value: "Monthly Supply" },
    { attribute: "pa_dose-strength", value: "500mg/5ml" },
  ],
};

export const PRODUCT_DATA = {
  bg: "bg-white",
  imageBg: "#E8DCC8",
  image:
    "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/ned-plus.png",
  imageAlt: "MyRocky NAD+ vial",
  banner: "",
  bannerClassName: "",
  name: "NAD+",
  pricePrefix: "",
  price: "$99",
  priceAfter: "",
  description:
    "A simple way to support cellular health, energy production, and overall wellness.",
  ctaText: "Get Started",
  ctaHref: "/nad-consultation-quiz",
  btnClassName: "",
  checkPointsHeading: "",
  checkPoints: [
    "Supports energy levels",
    "Promotes cellular health & longevity",
    "Helps with focus & mental clarity",
  ],
  checkPointsPosition: "before",
};

export const WHAT_TO_EXPECT_DATA = {
  bg: "bg-white",
  label: "Your Journey",
  heading: "What to expect",
  items: [
    {
      week: "Week 1",
      title: "First signs of energy",
      desc: "Subtle energy lift, improved morning alertness. Sleep may feel deeper.",
    },
    {
      week: "Week 2",
      title: "Mental clarity returns",
      desc: "Mental fog begins to lift, focus sharpens, and energy becomes sustained. The compounding effect starts.",
    },
    {
      week: "Week 4",
      title: "Building momentum",
      desc: "Recovery is faster. Workouts feel more productive. Sleep feels deeper and more restorative.",
    },
    {
      week: "Week 8",
      title: "You begin to feel more balanced and supported",
      desc: "Energy is consistent, mental focus lasts, and recovery feels easier. Patients often feel renewed vitality.",
    },
    {
      week: "Week 12+",
      title: "Full effect becomes your baseline",
      desc: "Your body recovers faster and starts to rebuild. Supports cellular repair processes. It's about how well you age, not just how you feel today.",
    },
  ],
  ctaText: "Start Your Free Assessment",
  ctaHref: "/nad-consultation-quiz",
  btnClassName: "uppercase tracking-wide text-sm font-[500]",
};

export const RESULTS_DATA = {
  backgroundImage:
    "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/background.png",
  backgroundAlt: "",
  label: "The fuel your cells need",
  heading: "Being this tired doesn't have to be your new normal",
  stats: [
    { value: 87, description: "felt better in < 30 days" },
    { value: 83, description: "reported increased energy" },
    { value: 75, description: "reported better mood" },
    { value: 71, description: "reported improved recovery" },
  ],
  disclaimer:
    "*Actual results may vary. Rx required, a licensed clinician will determine if treatment is appropriate for you.",
};
