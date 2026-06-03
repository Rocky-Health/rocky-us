// Bio-Age only — Gravity Form 12 (CRM field IDs per product spec)

export const quizConfig = {
    form_id: 12,
    action: "longevity_bio_age",
    api_endpoint: "/api/longevity-quiz",
    entrykey_field: "bio_age_entrykey",
    productName: "Bio-age",

    steps: {
        1: {
            id: "1200",
            type: "radio-text",
            title: "Do you take any medications?",
            field: "takesMedications",
            crmField: "1200",
            // When "Yes" is selected, the revealed textarea content is sent
            // to CRM under `textCrmField` (1201) — i.e. the same field the
            // standalone medication-list step used to use.
            textField: "currentMedications",
            textCrmField: "1201",
            required: true,
            options: [
                { id: "1200_no", label: "No", crmValue: "No" },
                {
                    id: "1200_yes",
                    label: "Yes",
                    crmValue: "Yes",
                    showTextInput: true,
                    textPlaceholder:
                        "Please list any medications you are currently taking. e.g. metformin, prednisone, Ozempic, atorvastatin, levothyroxine",
                },
            ],
        },

        // Former standalone step (CRM 1201 textarea) — folded into step 1's
        // conditional textarea above. Kept inline (commented out) for
        // reference / easy revert. NOT keyed (no leading "N:") so it doesn't
        // occupy a step slot in `steps`.
        // {
        //     id: "1201",
        //     type: "textarea",
        //     title: "Please list any medications you are currently taking.",
        //     field: "currentMedications",
        //     crmField: "1201",
        //     placeholder:
        //         "Example: metformin, prednisone, Ozempic, atorvastatin, levothyroxine",
        //     required: false,
        // },

        2: {
            id: "1202",
            type: "radio",
            title: "Are you currently taking any of the following medications?",
            field: "flaggedMedications",
            crmSubfieldRadio: true,
            required: true,
            exclusiveOptions: ["1202_6"],
            showPopupOnNonExclusiveSelect: "eligibilityBlock",
            options: [
                {
                    id: "1202_1",
                    label: "Corticosteroids (i.e prednisone, dexamethasone)",
                },
                {
                    id: "1202_2",
                    label: "Immunosuppressants (i.g. tacrolimus, mycophenolate)",
                },
                { id: "1202_3", label: "Methotrexate" },
                { id: "1202_4", label: "Biological therapy injections" },
                { id: "1202_5", label: "Chemotherapy" },
                { id: "1202_6", label: "None of the above" },
            ],
        },

        3: {
            id: "1203",
            type: "radio",
            title: "Have you been diagnosed with any of the following?",
            field: "flaggedDiagnoses",
            crmSubfieldRadio: true,
            required: true,
            exclusiveOptions: ["1203_8"],
            showPopupOnNonExclusiveSelect: "eligibilityBlock",
            options: [
                { id: "1203_1", label: "Cancer" },
                { id: "1203_2", label: "Chronic kidney disease" },
                { id: "1203_3", label: "Liver disease" },
                { id: "1203_4", label: "Bone marrow disorders" },
                { id: "1203_7", label: "Currently on dialysis" },
                { id: "1203_8", label: "None of the above" },
            ],
        },

        4: {
            id: "1204",
            type: "radio",
            title: "Do any of the following apply to you currently?",
            field: "flaggedSituations",
            crmSubfieldRadio: true,
            required: true,
            exclusiveOptions: ["1204_5"],
            showPopupOnNonExclusiveSelect: "eligibilityBlock",
            options: [
                { id: "1204_1", label: "Currently pregnant" },
                {
                    id: "1204_2",
                    label: "Hospitalized or major surgery within the past 8 weeks",
                },
                {
                    id: "1204_3",
                    label: "Serious infection within the past 8 weeks",
                },
                {
                    id: "1204_4",
                    label: "Blood transfusion within the past 4 weeks",
                },
                { id: "1204_5", label: "None of the above" },
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
                "We want to make sure your results are accurate.\n\nBased on your answers, the biological age test and/or NAD⁺ injections may not be appropriate at this time. Certain medications, medical conditions, or temporary health factors can affect the blood markers used to calculate biological age.\n\nPlease contact our support team and we'll review your case. If the biological age test isn't appropriate right now, we'll issue a full refund for the test.\n\ncontact@myrocky.com",
            buttons: [{ label: "Go Back", action: "close", primary: true }],
        },
    },
};
