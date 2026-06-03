import React from "react";

/**
 * Combined Yes/No radio + conditional textarea. The textarea is only shown
 * when the selected option declares `showTextInput: true`. The radio value
 * is stored in `userData[config.field]`; the textarea value is stored in
 * `userData[config.textField]`. CRM payload routing (sending the text under
 * a different CRM field id than the radio) is handled by
 * `buildLongevityCrmFormPayload` via `step.textCrmField`.
 */
const LongevityRadioTextQuestion = ({ config, userData, setUserData }) => {
    const selectedValue = userData[config.field];
    const selectedOption = (config.options || []).find(
        (opt) => opt.id === selectedValue,
    );
    const showTextInput = !!selectedOption?.showTextInput;
    const textValue = userData[config.textField] || "";

    const handleSelect = (optionId) => {
        const nextOption = (config.options || []).find(
            (opt) => opt.id === optionId,
        );
        setUserData((prev) => {
            const next = { ...prev, [config.field]: optionId };
            // If the newly selected option doesn't reveal a textarea, drop
            // any previously-typed text from state (and therefore from
            // localStorage) so:
            //   1) Toggling back to the textarea option later starts blank
            //      instead of showing stale input.
            //   2) The next CRM submit cannot include the text under
            //      `textCrmField` — the payload builder already gates on
            //      the currently-selected option's `showTextInput`, but
            //      clearing here removes the data entirely as a second line
            //      of defence.
            if (!nextOption?.showTextInput && config.textField) {
                delete next[config.textField];
            }
            return next;
        });
    };

    const handleTextChange = (e) => {
        const next = e.target.value;
        setUserData((prev) => ({ ...prev, [config.textField]: next }));
    };

    return (
        <>
            <div className="space-y-4">
                {(config.options || []).map((option) => {
                    const isSelected = selectedValue === option.id;
                    return (
                        <button
                            key={option.id}
                            type="button"
                            className={`w-full text-left px-4 py-5 md:py-6 border-[1px] rounded-lg flex items-center gap-3 transition-colors ${
                                isSelected
                                    ? "border-[#A7885A] bg-[#FFFBF7]"
                                    : "border-[#E2E2E1] bg-white"
                            }`}
                            onClick={() => handleSelect(option.id)}
                        >
                            <div
                                className={`w-5 h-5 border rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                                    isSelected
                                        ? "border-[#A7885A]"
                                        : "border-gray-300"
                                }`}
                            >
                                {isSelected && (
                                    <div className="w-3 h-3 rounded-full bg-[#A7885A]" />
                                )}
                            </div>
                            <span className="text-[14px] md:text-[16px] font-medium leading-[140%] tracking-[0%] text-black">
                                {option.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {showTextInput && (
                <div className="mt-6">
                    <textarea
                        value={textValue}
                        onChange={handleTextChange}
                        placeholder={
                            selectedOption?.textPlaceholder ||
                            config.textPlaceholder ||
                            "Please specify..."
                        }
                        rows={5}
                        className="w-full p-4 border border-[#E2E2E1] rounded-lg text-[14px] md:text-[16px] focus:outline-none focus:border-[#A7885A] resize-none leading-[140%]"
                    />
                </div>
            )}
        </>
    );
};

export default LongevityRadioTextQuestion;
