// NAD+ only — Gravity Form 12

export const quizConfig = {
    form_id: 12,
    action: "longevity_nad",
    api_endpoint: "/api/longevity-quiz",
    entrykey_field: "nad_entrykey",
    productName: "NAD+",
    /** Final CRM Full submit runs on thank-you (step 99), not on ID upload. */
    submitOnThankYou: true,

    steps: {
        1: {
            id: "1205",
            type: "radio",
            title: "Do you currently have any of the following conditions?",
            field: "flaggedConditions",
            crmSubfieldRadio: true,
            required: true,
            exclusiveOptions: ["1205_6"],
            showPopupOnNonExclusiveSelect: "eligibilityBlock",
            options: [
                { id: "1205_1", label: "Cancer" },
                { id: "1205_2", label: "Liver disease" },
                { id: "1205_3", label: "Kidney disease" },
                {
                    id: "1205_4",
                    label: "Uncontrolled cardiovascular disease",
                },
                { id: "1205_5", label: "Autoimmune disease" },
                { id: "1205_6", label: "None of the above" },
            ],
        },

        2: {
            id: "1206",
            type: "radio",
            title: "Are you currently pregnant, planning pregnancy, or breastfeeding?",
            field: "isPregnant",
            crmField: "1206",
            required: true,
            blockContinueOnValues: ["1206_yes"],
            conditionalActions: {
                "1206_yes": {
                    action: "showPopup",
                    popupType: "eligibilityBlock",
                },
            },
            options: [
                { id: "1206_yes", label: "Yes", crmValue: "Yes" },
                { id: "1206_no", label: "No", crmValue: "No" },
            ],
        },

        3: {
            id: "1207",
            type: "radio",
            title: "Have you had major surgery, hospitalization, or a significant illness within the past 30 days?",
            field: "hadRecentSurgery",
            crmField: "1207",
            required: true,
            blockContinueOnValues: ["1207_yes"],
            conditionalActions: {
                "1207_yes": {
                    action: "showPopup",
                    popupType: "eligibilityBlock",
                },
            },
            options: [
                { id: "1207_yes", label: "Yes", crmValue: "Yes" },
                { id: "1207_no", label: "No", crmValue: "No" },
            ],
        },

        4: {
            id: "1208",
            type: "radio",
            title: "Have you ever had an allergic reaction or sensitivity to NAD⁺ or injectable vitamin therapies?",
            field: "hasAllergyToNad",
            crmField: "1208",
            required: true,
            blockContinueOnValues: ["1208_yes"],
            conditionalActions: {
                "1208_yes": {
                    action: "showPopup",
                    popupType: "eligibilityBlock",
                },
            },
            options: [
                { id: "1208_yes", label: "Yes", crmValue: "Yes" },
                { id: "1208_no", label: "No", crmValue: "No" },
            ],
        },

        98: {
            id: "photo-id",
            type: "id-upload",
            field: "photoIdUrl",
            crmField: "196",
        },
    },

    navigation: {
        1: 2,
        2: 3,
        3: 4,
        4: 98,
        98: 99,
    },

    progressMap: {
        1: 0,
        2: 25,
        3: 50,
        4: 75,
        98: 90,
        99: 100,
    },

    popups: {
        eligibilityBlock: {
            title: "Test Eligibility",
            titleColor: "#C19A6B",
            message:
                "We want to make sure your results are accurate.\n\nBased on your answers, the biological age test and/or NAD⁺ injections may not be appropriate at this time. Certain medications, medical conditions, or temporary health factors can affect the blood markers used to calculate biological age.\n\nPlease contact our support team and we'll review your case. If the biological age test isn't appropriate right now, we'll issue a full refund for the test.\n\ncontact@myrocky.ca",
            buttons: [{ label: "Go Back", action: "close", primary: true }],
        },
    },
};
