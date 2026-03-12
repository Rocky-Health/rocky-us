// const WLProducts = {
//   COMPOUNDED_TIRZEPATIDE: {
//     id: "489523",
//     name: "Compounded Tirzepatide",
//     description: "(tirzepatide) Vial",
//     price: "$249",
//     details: "Tirzepatide is the generic version of Mounjaro. It is a personalized treatment to help reduce appetite and keep you fuller for longer",
//     url: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/ozempic/Tirzepatide.jpg",
//     isDefault: true,
//     supplyAvailable: true,
//   },
//   COMPOUNDED_SEMAGLUTIDE: {
//     id: "489798",
//     name: "Compounded Semaglutide",
//     description: "(semaglutide) Vial",
//     price: "$149",
//     details: "Semaglutide is the generic version of Ozempic. It is a personalized treatment to help reduce appetite and keep you fuller for longer",
//     url: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/ozempic/Semaglutide.jpg",
//     supplyAvailable: true,
//   },
//   OZEMPIC: {
//     id: "142976",
//     name: "Ozempic",
//     description: "(semaglutide) injection",
//     price: "$1310",
//     details:
//       "Ozempic is the brand name for Semaglutide which is a FDA-approved medication. It helps reduce appetite and keeps you feeling fuller for longer",
//     url: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/ozempic/ozempic_2x.webp",
//     supplyAvailable: true,
//   },
//   MOUNJARO: {
//     id: "160469",
//     name: "Mounjaro",
//     description: "(tirzepatide) injection",
//     price: "$1410",
//     details:
//       "Mounjaro® is the brand name for Tirzepatide which is a FDA approved drug. It helps reduce appetite and keeps you feeling fuller for longer.",
//     url: "/products/monjaro.png",
//     supplyAvailable: true,
//   },
//   WEGOVY: {
//     id: "276274",
//     name: "Wegovy",
//     description: "(semaglutide) injection",
//     price: "$1770",
//     details:
//       "Wegovy is the brand name for semaglutide, an FDA-approved medication prescribed at a higher dose. It helps reduce appetite and keeps you feeling fuller for longer.",
//     url: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wegovy/wegovy_2x.webp",
//     supplyAvailable: true,
//   },
//   RYBELSUS: {
//     id: "369795",
//     name: "Rybelsus",
//     description: "(semaglutide) tablets",
//     price: "$1310",
//     details:
//       "Rybelsus is the brand name for semaglutide, an FDA-approved oral medication. It helps reduce appetite and keeps you feeling fuller for longer.",
//     url: "/products/rybelsus.png",
//     supplyAvailable: true,
//   },
// };

const WL_PRODUCT_BENEFITS_DEFAULT = [
  "Unlimited provider visits",
  "Labs (Quest Diagnostics)",
  "Insurance Prior Auths",
  "Coaching: dietitian, mental health, movement, support groups",
  "SESH TM Fitness Program: home & gym workouts, macro tracker, weight tracker",
  "1:1 nutritionist coaching and chat",
];

const WLProducts = {
  COMPOUNDED_TIRZEPATIDE: {
    id: "489523",
    name: "Compounded Tirzepatide",
    description: "Same active ingredient as Ozempic. The popular, affordable alternative.",
    price: "$389",
    details:
      "Tirzepatide is the generic version of Mounjaro. It is a personalized treatment to help reduce appetite and keep you fuller for longer",
    isDefault: true,
    supplyAvailable: true,
    url: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Compounded Tirzepatide (GLP-1-GIP).jpg",
    uri_popup:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Compounded Tirzepatide (GLP-1-GIP) - Popup.jpg",
    benefits: WL_PRODUCT_BENEFITS_DEFAULT,
    importantInfo: "All doses - No other fees",
    label: "Maximum Results",
    ingredient: "GLP-1/GIP",
    // tags: [
    //     "Dual-hormone mechanism for enhanced results",
    //     "Enhanced results vs other injectables",
    //     "Enhanced results vs other injectables",
    // ],
  },
  COMPOUNDED_SEMAGLUTIDE: {
    id: "489798",
    name: "Compounded Semaglutide",
    description: "Dual-action mechanism with the highest rated clinical weight loss.",
    price: "$279",
    details:
      "Semaglutide is the generic version of Ozempic. It is a personalized treatment to help reduce appetite and keep you fuller for longer",
    url: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Compounded Semaglutide (GLP-1).jpg",
    uri_popup:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Compounded Semaglutide (GLP-1) - Popup.jpg",
    supplyAvailable: true,
    benefits: WL_PRODUCT_BENEFITS_DEFAULT,
    importantInfo: "All doses - No other fees",
    label: "Lowest-Cost",
     ingredient: "GLP-1",
    // tags: [
    //     "Same active ingredient as Ozempic",
    //     "Dose optimized for weight loss",
    //     "Preferred by patients focused on maximizing results",
    // ],
  },
  OZEMPIC: {
    id: "142976",
    name: "Ozempic",
    description: "Name Brand Semaglutide Injection",
    price: "$1409",
    details:
      "Ozempic is the brand name for Semaglutide which is a FDA-approved medication. It helps reduce appetite and keeps you feeling fuller for longer",
    url: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Ozempic.jpg",
    uri_popup:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Ozempic - Popup.jpg",
    supplyAvailable: true,
    limitedSupply: true,
    isPrescription: true,
    benefits: WL_PRODUCT_BENEFITS_DEFAULT,
    importantInfo:
      "MyRocky does not guarantee that patient will receive a prescription of any specific medication, including Ozempic, Mounjaro, Wegovy  or Rybelsus. All medical decisions are made at the discretion of the healthcare provider",
     ingredient: "GLP-1",
     tags: ["Same active ingredient as Wegovy", "Strong appetite control"],
  },
  MOUNJARO: {
    id: "160469",
    name: "Mounjaro",
    description: "﻿Name Brand Tirzepatide Injection",
    price: "$1509",
    details:
      "Mounjaro® is the brand name for Tirzepatide which is a FDA approved drug. It helps reduce appetite and keeps you feeling fuller for longer.",
    url: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Mounjaro.jpg",
    uri_popup:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Mounjaro - Popup.jpg",
    supplyAvailable: true,
    isPrescription: true,
    benefits: WL_PRODUCT_BENEFITS_DEFAULT,
    importantInfo:
      "MyRocky does not guarantee that patient will receive a prescription of any specific medication, including Ozempic, Mounjaro, Wegovy  or Rybelsus. All medical decisions are made at the discretion of the healthcare provider",
     ingredient: "GLP-1/GIP",
    tags: [
        "Dual-hormone mechanism for enhanced results",
        "Enhanced results vs other injectables",
    ],
  },
  WEGOVY: {
    id: "276274",
    name: "Wegovy",
    description: "Name Brand Semaglutide Injection",
    price: "$1869",
    details:
      "Wegovy is the brand name for semaglutide, an FDA-approved medication prescribed at a higher dose. It helps reduce appetite and keeps you feeling fuller for longer.",
    url: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Wegovy.jpg",
    uri_popup:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Wegovy - Popup.jpg",
    supplyAvailable: true,
    isPrescription: true,
    benefits: WL_PRODUCT_BENEFITS_DEFAULT,
    importantInfo:
      "MyRocky does not guarantee that patient will receive a prescription of any specific medication, including Ozempic, Mounjaro, Wegovy  or Rybelsus. All medical decisions are made at the discretion of the healthcare provider",
     ingredient: "GLP-1",
     tags: ["Same active ingredient as Ozempic", "Strong appetite control"],
  },
  RYBELSUS: {
    id: "369795",
    name: "Rybelsus",
    description: "Name Brand Oral Semaglutide Pill",
    price: "$1409",
    details:
      "Rybelsus is the brand name for semaglutide, an FDA-approved oral medication. It helps reduce appetite and keeps you feeling fuller for longer.",
    url: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Rybelsus.jpg",
    uri_popup:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Rybelsus - Popup.jpg",
    supplyAvailable: true,
    limitedSupply: true,
    isPrescription: true,
    benefits: WL_PRODUCT_BENEFITS_DEFAULT,
    importantInfo:
      "MyRocky does not guarantee that patient will receive a prescription of any specific medication, including Ozempic, Mounjaro, Wegovy  or Rybelsus. All medical decisions are made at the discretion of the healthcare provider",
     ingredient: "GLP-1",
    tags: [
        "Mild weight loss effect compared to injectables",
        "Best suited for patients who are needle-averse",
    ],
  },
};

const EDProducts = {
  cialisProduct: {
    id: 1,
    name: "Cialis",
    tagline: '"The weekender"',
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/webp-images/RockyHealth-cialis-400px.webp",
    activeIngredient: "Tadalafil",
    strengths: ["10mg", "20mg"],
    preferences: ["generic", "brand"],
    frequencies: {
      "monthly-supply": "One Month",
      "quarterly-supply": "Three Months",
    },
    pillOptions: {
      "monthly-supply": [
        {
          count: 6,
          genericPrice: 107,
          brandPrice: 150,
          variationId: "3287",
          brandVariationId: "548805",
        },
        {
          count: 8,
          genericPrice: 138,
          brandPrice: 195,
          variationId: "259",
          brandVariationId: "1422",
        },
        {
          count: 12,
          genericPrice: 204,
          brandPrice: 285,
          variationId: "1960",
          brandVariationId: "1962",
        },
      ],
      "quarterly-supply": [
        {
          count: 12,
          genericPrice: 204,
          brandPrice: 285,
          variationId: "260",
          brandVariationId: "1423",
        },
        {
          count: 24,
          genericPrice: 399,
          brandPrice: 555,
          variationId: "261",
          brandVariationId: "1424",
        },
        {
          count: 36,
          genericPrice: 595,
          brandPrice: 829,
          variationId: "1961",
          brandVariationId: "1420",
        },
      ],
    },
  },
  viagraProduct: {
    id: 2,
    name: "Viagra",
    tagline: '"The one-nighter"',
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/webp-images/RockyHealth-viagra-400px.webp",
    activeIngredient: "Sildenafil",
    strengths: ["50mg", "100mg"],
    preferences: ["generic", "brand"],
    frequencies: {
      "monthly-supply": "One Month",
      "quarterly-supply": "Three Months",
    },
    pillOptions: {
      "monthly-supply": [
        {
          count: 8,
          genericPrice: 108,
          brandPrice: 136,
          variationId: "233",
          brandVariationId: "1428",
        },
        {
          count: 12,
          genericPrice: 159,
          brandPrice: 199,
          variationId: "234",
          brandVariationId: "1429",
        },
      ],
      "quarterly-supply": [
        {
          count: 12,
          genericPrice: 159,
          brandPrice: 199,
          variationId: "235",
          brandVariationId: "1430",
        },
        {
          count: 24,
          genericPrice: 305,
          brandPrice: 388,
          variationId: "236",
          brandVariationId: "1431",
        },
        {
          count: 36,
          genericPrice: 449,
          brandPrice: 577,
          variationId: "237",
          brandVariationId: "1432",
        },
      ],
    },
  },
  chewalisProduct: {
    id: 3,
    name: "Chewalis",
    tagline: '"The weekender"',
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/chewalis-ed.webp",
    activeIngredient: "Tadalafil",
    strengths: ["10mg", "20mg"],
    preferences: ["generic"],
    frequencies: {
      "monthly-supply": "One Month",
      "quarterly-supply": "Three Months",
    },
    pillOptions: {
      "monthly-supply": [
        {
          count: 8,
          genericPrice: 138,
          brandPrice: 138,
          variationId: "219484",
        },
        {
          count: 12,
          genericPrice: 202,
          brandPrice: 202,
          variationId: "278229",
        },
      ],
      "quarterly-supply": [
        {
          count: 12,
          genericPrice: 202,
          brandPrice: 202,
          variationId: "278230",
        },
        {
          count: 24,
          genericPrice: 394,
          brandPrice: 394,
          variationId: "278231",
        },
        {
          count: 36,
          genericPrice: 586,
          brandPrice: 586,
          variationId: "219488",
        },
      ],
    },
  },
  varietyPackProduct: {
    id: 4,
    name: "Cialis + Viagra",
    tagline: '"The Variety Pack"',
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/RockyHealth-variety-400px%20(1).webp",
    activeIngredient: "Tadalafil + Sildenafil",
    strengths: ["50mg & 100mg (Viagra)", "10mg & 20mg (Cialis)"],
    preferences: ["generic", "brand"],
    frequencies: {
      "monthly-supply": "One Month",
      "quarterly-supply": "Three Months",
    },
    pillOptions: {
      "monthly-supply": [
        {
          count: "4/4",
          genericPrice: 134,
          brandPrice: 174,
          variationId: "37669,37668",
          brandVariationId: "1421,1427",
        },
        {
          count: "6/6",
          genericPrice: 183,
          brandPrice: 235,
          variationId: "3440,3287",
          brandVariationId: "3471,3467",
        },
      ],
      "quarterly-supply": [
        {
          count: "6/6",
          genericPrice: 183,
          brandPrice: 235,
          variationId: "3439,3438",
          brandVariationId: "3470,3466",
        },
        {
          count: "12/12",
          genericPrice: 363,
          brandPrice: 484,
          variationId: "37673,37674",
          brandVariationId: "1423,1430",
        },
        {
          count: "18/18",
          genericPrice: 469,
          brandPrice: 685,
          variationId: "3442,3437",
          brandVariationId: "3469,3465",
        },
      ],
    },
  },
  cialisProduct2: {
    id: 4,
    name: "Cialis",
    tagline: '"The weekender"',
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/webp-images/RockyHealth-cialis-400px.webp",
    activeIngredient: "Tadalafil",
    strengths: ["5mg"],
    preferences: ["generic"],
    frequencies: {
      "monthly-supply": "One Month",
    },
    pillOptions: {
      "monthly-supply": [
        {
          count: 30,
          genericPrice: 148,
          brandPrice: 148,
          variationId: "6119",
          brandVariationId: "1422",
        },
      ],
    },
  },
};

/**
 * Find an ED product entry by variation id.
 * Matches both variationId and brandVariationId (comma-separated values handled).
 * @param {string|number} variationId
 * @returns { { productKey: string, product: object, frequency: string, option: object } | null }
 */
function findEDProductByVariation(variationId) {
  if (variationId == null) return null;
  const vid = String(variationId).trim();

  for (const [productKey, product] of Object.entries(EDProducts)) {
    const pillOptions =
      product && product.pillOptions ? product.pillOptions : {};
    for (const frequencyKey of Object.keys(pillOptions)) {
      const options = pillOptions[frequencyKey] || [];
      for (const option of options) {
        // Collect all variation ids (handles comma-separated lists)
        const ids = [];
        if (option.variationId) {
          ids.push(
            ...String(option.variationId)
              .split(",")
              .map((s) => s.trim()),
          );
        }
        if (option.brandVariationId) {
          ids.push(
            ...String(option.brandVariationId)
              .split(",")
              .map((s) => s.trim()),
          );
        }
        if (ids.includes(vid)) {
          return {
            productKey,
            product,
            frequency: frequencyKey,
            option,
          };
        }
      }
    }
  }

  return null;
}
export { WLProducts, EDProducts, findEDProductByVariation };
