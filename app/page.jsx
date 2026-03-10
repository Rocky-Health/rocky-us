import { Suspense } from "react";
import { cookies } from "next/headers";
import CouponCapture from "@/components/utils/CouponCapture";
import HomePageClient from "@/components/home/HomePageClient";

async function HomeContent() {
  const faqs = [
    {
      question: "What is MyRocky?",
      answer:
        "MyRocky is a 100% online platform with a focus to normalize men's health and eliminate the stigma surrounding it. At MyRocky, we make it easy for patients to connect to licensed healthcare professionals. We specialize in medical conditions commonly experienced by men including Erectile Dysfunction and Hair Loss. We've built a simple & convenient online process which helps you connect to healthcare professionals in order to get customized treatment plans, shipped right to your door.",
    },
    {
      question: "How does MyRocky work?",
      answer:
        "MyRocky offers prescription and over-the-counter products. For Prescription medication, you will need to complete an online medical intake/ questionnaire pertaining to the medical condition you are interested in treating. This step covers your medical history, medical conditions, medication you currently take, etc. A licensed healthcare provider then takes a look at your information and assesses whether or not you are a good candidate for any particular treatment. If a healthcare professional determines a treatment is right for you, it is delivered by MyRocky Pharmacy straight to your doorstep.",
    },
    {
      question: "Who looks after you at MyRocky?",
      answer:
        "MyRocky is operated by Healthcare Professionals including Doctors, Nurse Practitioners, and Pharmacists. Our team is experienced and readily available to ensure your needs are met. You can contact any member of the team by portal message, or emailing the respective departments directly.",
    },
    {
      question: "How does MyRocky ensure patient privacy?",
      answer:
        "MyRocky handles the privacy and security of all our customers with great care. Our platform meets all required regulatory compliance, as well having systems in place to ensure all information provided is secured. Any medical or personal information provided is only accessed by the medical team managing your care.",
    },
  ];

  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const userName = cookieStore.get("userName")?.value;
  const userEmail = cookieStore.get("userEmail")?.value;
  const displayName = cookieStore.get("displayName")?.value;

  // Use display name with fallbacks in this order: displayName -> firstName -> userEmail
  let nameToShow;
  if (displayName) {
    nameToShow = displayName;
  } else if (userName) {
    nameToShow = userName.split(" ")[0];
  } else if (userEmail) {
    nameToShow =
      userEmail.length > 15 ? userEmail.substring(0, 12) + "..." : userEmail;
  } else {
    nameToShow = "Guest";
  }

  const menuItems = [
    {
      category: "Sexual Health",
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/sex-header.webp",
      assessmentText: "Start Your ED Assessment",
      description: "Get Confidence Back in Bed",
      treatments: [
        {
          text: "Erectile Dysfunction",
          link: "/sex",
          quizLink: "/ed-pre-consultation-quiz",
        },
      ],
      medications: [
        {
          text: "Sildenafil (Generic Viagra)",
          link: "/product/sildenafil-viagra/",
          type: "most-popular",
        },
        {
          text: "Tadalafil (Generic Cialis®)",
          link: "/product/tadalafil-cialis/",
          type: "most-popular",
        },
        // { text: "Viagra®", link: "/product/viagra/" },
        // { text: "Cialis®", link: "/product/cialis/" },
        // { text: "Dissolvable Tadalafil", link: "/product/chewable-tadalafil/" },
      ],
      // prematureEjaculation: [
      //   { text: "Numb Ointment", link: "/product/lidocaine/" },
      //   { text: "Numb Spray", link: "/product/lidocaine-spray/" },
      // ],
      // supplements: [
      //   { text: "Essential T-Boost", link: "/product/testosterone-support/" },
      // ],
    },
    {
      category: "Weight Loss",
      image: "https://myrocky.b-cdn.net/WP%20Images/Weight%20Loss/wl.webp",
      assessmentText: "Start Your Weight Loss Assessment",
      description: "Lose Weight With Science",
      treatments: [
        {
          text: "Weight Loss",
          link: "/body-optimization",
          quizLink: "/wl-pre-consultation",
        },
      ],
      medications: [
        { text: "Ozempic®", link: "/product/ozempic/", type: "most-popular" },
        { text: "Mounjaro®", link: "/product/mounjaro/" },
        { text: "Wegovy®", link: "/product/wegovy/" },
        { text: "Rybelsus®", link: "/product/rybelsus/" },
      ],
      supplements: [
        // { text: "Essential Gut Support", link: "/product/essential-gut-relief/" },
        // { text: "Numb Spray", link: "/product/essential-gut-relief/" },
        // { text: "Essential T-Boost", link: "/product/testosterone-support" },
      ],
    },
    {
      category: "Hair Loss",
      image: "https://myrocky.b-cdn.net/WP%20Images/Hair%20Loss/hair.webp",
      assessmentText: "Start Your Hair Loss Assessment",
      description: "Stop Hair Loss in Its Tracks",
      treatments: [
        { text: "Hair Loss", link: "/hair", quizLink: "/hair-flow" },
      ],
      medications: [
        {
          text: "Finasteride & Minoxidil Topical Foam",
          link: "/product/finasteride-minoxidil-topical-foam/",
          type: "most-popular",
        },
        // { text: "Finasteride (Propecia®)", link: "/product/finasteride/" },
        // { text: "Minoxidil (Rogaine®)", link: "/product/minoxidil/" },
      ],
      // supplements: [
      //   {
      //     text: "Essential Follicle Support",
      //     link: "/product/hair-growth-support/",
      //   },
      // ],
    },
    // {
    //   category: "Mental Health",
    //   // image: "https://myrocky.b-cdn.net/WP%20Images/Mental%20Health/mh.webp",
    //   image:
    //     "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Mental%20Health%20Page/image-1-new.webp",
    //   assessmentText: "Start Your Mental Health Assessment",
    //   treatments: [
    //     {
    //       text: "Mental Health",
    //       link: "/mental-health",
    //       quizLink: "/mh-pre-quiz",
    //     },
    //   ],

    //   medications: [
    //     { text: "Bupropion XL", link: "/mh-pre-quiz" },
    //     { text: "Citalopram", link: "/mh-pre-quiz" },
    //     { text: "Escitalopram", link: "/mh-pre-quiz" },
    //     { text: "Fluoxetine", link: "/mh-pre-quiz" },
    //     { text: "Paroxetine", link: "/mh-pre-quiz" },
    //     { text: "Sertraline", link: "/mh-pre-quiz" },
    //     { text: "Trazodone", link: "/mh-pre-quiz" },
    //     { text: "Venlafaxine XR", link: "/mh-pre-quiz" },
    //     // { text: "Bupropion XL", link: "/product/bupropion/" },
    //     // { text: "Citalopram", link: "/product/citalopram/" },
    //     // { text: "Escitalopram", link: "/product/escitalopram/" },
    //     // { text: "Fluoxetine", link: "/product/fluoxetine/" },
    //     // { text: "Paroxetine", link: "/product/paroxetine/" },
    //     // { text: "Sertraline", link: "/product/sertraline/" },
    //     // { text: "Trazodone", link: "/product/trazodone/" },
    //     // { text: "Venlafaxine XR", link: "/product/venlafaxine/" },
    //   ],
    //   supplements: [
    //     {
    //       text: "Essential Mood Balance",
    //       link: "/product/essential-mood-balance/",
    //     },
    //     {
    //       text: "Essential Night Boost",
    //       link: "/product/essential-night-boost/",
    //     },
    //   ],
    // },

    // {
    //   category: "Smoking Cessation",
    //   image: "/zonic/zonnic-life.webp",
    //   assessmentText: "A New Way To Quit Smoking",
    //   treatments: [
    //     {
    //       text: "ZONNIC Nicotine Pouches",
    //       link: "/product/zonnic/",
    //       quizLink: "/product/zonnic/",
    //     },
    //   ],
    // },
    // {
    //   category: "Recovery",
    //   image: "https://myrocky.b-cdn.net/WP%20Images/dhm/DHMBlendPP.png?v=1",
    //   assessmentText: "The Smarter Way To Recover!",
    //   treatments: [
    //     {
    //       text: "DHM Blend",
    //       link: "/product/dhm-blend/",
    //       quizLink: "/product/dhm-blend/",
    //     },
    //   ],
    // },
    // {
    //   category: "Skin Care",
    //   image: "/skin-care/acne-main.jpg",
    //   description: "Personalized Prescription Skincare",
    //   link: "/skincare",
    // },
    // {
    //   category: "Merch",
    //   image: "",
    //   description: "Shop Our Merch",
    //   link: "/merch",
    // },
  ];

  return (
    <>
      <CouponCapture />
      <HomePageClient
        menuItems={menuItems}
        token={token}
        nameToShow={nameToShow}
        faqs={faqs}
      />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
