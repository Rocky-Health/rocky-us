export const nadPlusQuizConfig = {
    productId: "490774",

    steps: {
        // Step 1: NAD+ Priority
        1: {
            id: "nadPlusPriority",
            type: "nadPlusPriority",
            title: "",
            field: "nadPlusPriority",
            required: true,
            subtitle: "Which of these is your priority?",
            options: [
                { id: "boost-energy", label: "Boost Energy", icon: "lightning" },
                { id: "improve-memory", label: "Improve Memory", icon: "lightbulb" },
                { id: "look-younger", label: "Look Younger", icon: "smiley" },
            ],
        },
        // Step 2: Energy Level
        2: {
            id: "energyLevel",
            type: "nadPlusEnergy",
            title: "",
            field: "energyLevel",
            required: true,
            options: [
                { id: "very-low", label: "Very Low", icon: "battery-low" },
                { id: "need-more", label: "I need more energy", icon: "battery-medium" },
                { id: "good-want-more", label: "Good, but I want more", icon: "battery-full" },
            ],
        },
        // Step 3: Mental Performance
        3: {
            id: "mentalPerformance",
            type: "nadPlusMentalPerformance",
            title: "",
            field: "mentalPerformance",
            required: true,
            imageSrc: "/nad+/women-quiz.png",
            options: [
                { id: "constant-brain-fog", label: "Constant brain fog" },
                { id: "frequently-scattered", label: "Frequently scattered" },
                { id: "occasionally-foggy", label: "Occasionally foggy" },
                { id: "sharp-and-focused", label: "Sharp and focused" },
            ],
        },
        // Step 4: Cellular Science (info page)
        4: {
            id: "cellularScience",
            type: "nadPlusCellularScience",
            title: "",
            required: false,
        },
        // Step 5: Testimonial
        5: {
            id: "testimonial",
            type: "nadPlusTestimonial",
            title: "",
            required: false,
        },
        // Step 6: Gender + Height & Weight (combined)
        6: {
            id: "genderHeightWeight",
            type: "nadPlusGenderHeightWeight",
            title: "",
            field: "gender",
            required: true,
        },
        // Step 7: Female Safety (only shown if female)
        7: {
            id: "femaleSafety",
            type: "nadPlusFemaleSafety",
            title: "",
            field: "femalePregnancySafety",
            required: true,
            skipIf: { sex: "male" },
        },
        // Step 8: Aging Effects (multi-select, heading changes by gender)
        8: {
            id: "agingEffects",
            type: "nadPlusAgingEffects",
            title: "",
            field: "agingEffects",
            required: true,
            options: [
                { id: "low-libido", label: "Low Libido or Erectile Dysfunction", icon: "arrow-down" },
                { id: "hair-loss", label: "Hair Loss", icon: "comb" },
                { id: "skin-issues", label: "Skin Issues", subtitle: "Wrinkles, Dry Skin, Etc", icon: "skin" },
                { id: "cognition-issues", label: "Cognition Issues", subtitle: "Brain Fog, Trouble Focusing, Memory Loss", icon: "brain" },
                { id: "low-energy", label: "Low Energy", icon: "battery-low" },
                { id: "none", label: "None of these", icon: "none" },
            ],
        },
        // Step 9: Medical Conditions
        9: {
            id: "medicalConditions",
            type: "nadPlusMedicalConditions",
            title: "",
            field: "medicalConditions",
            required: true,
            options: [
                { id: "none", label: "None of these" },
                { id: "end-stage-kidney", label: "End-stage kidney disease" },
                { id: "end-stage-liver", label: "End-stage liver disease (cirrhosis)" },
                { id: "active-cancer", label: "Active cancer" },
            ],
        },
        // Step 10: Weight Changed
        10: {
            id: "weightChanged",
            type: "nadPlusWeightChanged",
            title: "",
            field: "weightChanged",
            required: true,
            imageSrc: "/nad+/weightloss-scale.png",
            options: [
                { id: "lost-significant", label: "Lost a significant amount" },
                { id: "lost-little", label: "Lost a little" },
                { id: "about-same", label: "About the same" },
                { id: "gained-little", label: "Gained a little" },
                { id: "gained-significant", label: "Gained a significant amount" },
            ],
        },
        // Step 11: Last Question (medical team info)
        11: {
            id: "lastQuestion",
            type: "nadPlusLastQuestion",
            title: "",
            field: "hasInfoForMedicalTeam",
            detailsField: "medicalTeamDetails",
            required: true,
        },
        // Step 12: Personal Info + DOB (combined)
        12: {
            id: "personalInfoDob",
            type: "nadPlusPersonalInfo",
            title: "",
            required: true,
        },
        // Step 13: Contact / Auth (only shown if not authenticated)
        13: {
            id: "contactAuth",
            passIf: "authenticate",
            type: "glp2ContactAuth",
            required: true,
        },
        // Step 14: Select Your NAD+ Plan (single product, no recommendation needed)
        14: {
            id: "selectNadPlusPlan",
            type: "planSelection",
            title: "Your NAD+ Plan",
            field: "selectedPlan",
            required: true,
        },
    },

    navigation: {
        1: 2,
        2: 3,
        3: 4,
        4: 5,
        5: 6,
        6: 7,
        7: 8,
        8: 9,
        9: 10,
        10: 11,
        11: 12,
        12: 13,
        13: 14,
        14: 100,
    },

    progressMap: {
        1: 7,
        2: 14,
        3: 21,
        4: 29,
        5: 36,
        6: 43,
        7: 50,
        8: 57,
        9: 64,
        10: 71,
        11: 79,
        12: 86,
        13: 93,
        14: 100,
    },

    progressPhases: [
        {
            key: "start",
            label: "Start",
            steps: [1, 2, 3, 4, 5],
        },
        {
            key: "details",
            label: "Details",
            steps: [6, 7, 8, 9, 10, 11],
        },
        {
            key: "eligibility",
            label: "Eligibility",
            steps: [12, 13, 14],
        },
    ],

    stepTitles: {
        1: "Your Priority",
        2: "Energy Level",
        3: "Mental Performance",
        4: "Cellular Science",
        5: "Testimonial",
        6: "Gender & Body",
        7: "Safety First",
        8: "Aging Effects",
        9: "Health Screening",
        10: "Weight Changed",
        11: "Last Question",
        12: "Your Info",
        13: "Contact & Account",
        14: "Your NAD+ Plan",
    },

    popups: {},
};
