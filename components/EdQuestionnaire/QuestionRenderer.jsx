import { QuestionLayout } from "./QuestionLayout";
import { QuestionOption } from "./QuestionOption";
import { logger } from "@/utils/devLogger";
import { QuestionAdditionalInput } from "./QuestionAdditionalInput";

export function QuestionRenderer({
  question,
  formData,
  handlers,
  currentPage,
  setFormData,
  setCurrentPage,
  updateLocalStorage,
}) {
  const {
    title,
    subtitle,
    subtitle2,
    pageNo,
    questionId,
    inputType,
    options = [],
    conditionalField,
    content,
    fileUpload,
  } = question;

  const showConditionalField =
    conditionalField && conditionalField.condition(formData);

  const renderContent = () => {
    if (!content) return null;

    if (questionId === "203") {
      return (
        <div className="text-left px-4">
          <h3 className="text-[12px] font-semibold pt-2">
            {content.benefitsTitle}
          </h3>
          <ul className="list-disc pl-4 mb-2">
            {content.benefits.map((benefit, idx) => (
              <li key={idx} className="text-sm font-normal">
                {benefit}
              </li>
            ))}
          </ul>

          <h3 className="text-[11px] font-normal pt-2 text-gray-600 mb-4">
            {content.benefitsNote}
          </h3>

          <h3 className="text-sm font-semibold pt-2">
            {content.sideEffectsTitle}
          </h3>
          <ul className="list-disc pl-4 mb-4">
            {content.sideEffects.map((effect, idx) => (
              <li key={idx} className="text-sm font-normal">
                {effect}
              </li>
            ))}
          </ul>

          <h3 className="text-[11px] font-normal pt-2 text-gray-600">
            {content.sideEffectsNote}
          </h3>
        </div>
      );
    }

    if (questionId === "204") {
      return (
        <div className="text-center px-4 mb-6">
          <p className="text-[#C19A6B] mb-4">{content.mainNote}</p>
          <p>{content.secondaryNote}</p>
        </div>
      );
    }

    return null;
  };

  const renderFileUpload = () => {
    if (!fileUpload) return null;

    return (
      <div className="text-center mb-6">
        <input
          type="file"
          id="photo-id-file"
          ref={handlers.fileInputRef}
          accept={fileUpload.accept}
          className="hidden"
          onChange={handlers.handlePhotoIdFileSelect}
        />

        <div
          onClick={handlers.handleTapToUpload}
          className="w-full max-w-md h-32 flex items-center justify-center border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 mb-6"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-2 border-[#C19A6B] rounded-lg flex items-center justify-center mb-2">
              <svg
                className="w-8 h-8 text-[#C19A6B]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <span className="text-[#C19A6B]">{fileUpload.label}</span>
          </div>

          <img
            id="photo-id-preview"
            src=""
            alt="ID Preview"
            className="hidden max-w-full max-h-28 object-contain"
          />
        </div>

        <p className="text-center text-sm mb-2">{fileUpload.noteText}</p>

        <p className="text-center text-xs text-gray-500 mb-8">
          {fileUpload.restrictions}
        </p>

        <button
          onClick={handlers.handlePhotoIdUpload}
          className="photo-upload-continue w-full py-3 px-4 rounded-full text-white bg-[#A7885A] hidden disabled:bg-gray-400"
          disabled={handlers.isUploading || !handlers.photoIdFile}
        >
          {handlers.isUploading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </span>
          ) : (
            "Upload and Finish"
          )}
        </button>
      </div>
    );
  };

  const renderAcknowledgement = () => {
    if (question.acknowledgement) {
      return (
        <div className="flex items-start mb-6 w-full px-4">
          <input
            id={question.acknowledgement.fieldId}
            type="checkbox"
            className="w-6 h-6 border border-gray-300 rounded mt-0.5"
            checked={handlers.photoIdAcknowledged}
            onChange={handlers.handlePhotoIdAcknowledgement}
          />
          <label
            htmlFor={question.acknowledgement.fieldId}
            className="ml-3 text-sm font-medium text-gray-700"
          >
            {question.acknowledgement.text}
          </label>

          <button
            onClick={handlers.handlePhotoIdAcknowledgeContinue}
            disabled={!handlers.photoIdAcknowledged}
            className={`w-full py-3 px-4 rounded-full text-white mt-4 ${
              handlers.photoIdAcknowledged ? "bg-[#A7885A]" : "bg-gray-400"
            }`}
          >
            Continue
          </button>
        </div>
      );
    }

    return null;
  };

  if (question.completionPage) {
    return (
      <div
        className="quiz-page page-thank-you quiz-page-22"
        data-pageno={pageNo}
        data-ques-id=""
        data-input-type=""
      >
        <div id="submit-message" className="py-4 text-center">
          <h1 className="text-[#814B00] text-2xl text-center font-semibold mb-6">
            {question.completionPage.title}
          </h1>

          <div className="mb-8">
            <img
              src="https://mycdn.myrocky.com/wp-content/uploads/20240212065206/pngegg.png"
              width={150}
              height={150}
              className="block mx-auto my-6 max-w-[150px] h-auto object-contain"
              alt="Success Checkmark"
            />

            <h2 className="text-center text-xl text-bold mb-4">
              {question.completionPage.message}
            </h2>

            <p className="text-center text-md text-gray-600 mb-6">
              {question.completionPage.subMessage}
            </p>
          </div>

          <div className="flex gap-2 justify-between items-center max-w-[300px] mx-auto mt-6">
            <h3 className="text-[#814B00] text-xl text-center font-medium">
              Follow us
            </h3>
          </div>

          <div className="flex justify-center gap-6 mt-4">
            {question.completionPage.socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#814B00]"
              >
                {social.platform === "facebook" && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20 12.05C19.9813 10.5255 19.5273 9.03809 18.6915 7.76295C17.8557 6.48781 16.673 5.47804 15.2826 4.85257C13.8921 4.2271 12.3519 4.01198 10.8433 4.23253C9.33473 4.45309 7.92057 5.10013 6.7674 6.09748C5.61422 7.09482 4.77005 8.40092 4.3343 9.86195C3.89856 11.323 3.88938 12.8781 4.30786 14.3442C4.72634 15.8103 5.55504 17.1262 6.69637 18.1371C7.83769 19.148 9.24412 19.8117 10.75 20.05V14.38H8.75001V12.05H10.75V10.28C10.7037 9.86846 10.7483 9.45175 10.8807 9.05931C11.0131 8.66687 11.23 8.30827 11.5161 8.00882C11.8022 7.70936 12.1505 7.47635 12.5365 7.32624C12.9225 7.17612 13.3368 7.11255 13.75 7.14003C14.3498 7.14824 14.9482 7.20173 15.54 7.30003V9.30003H14.54C14.3676 9.27828 14.1924 9.29556 14.0276 9.35059C13.8627 9.40562 13.7123 9.49699 13.5875 9.61795C13.4627 9.73891 13.3667 9.88637 13.3066 10.0494C13.2464 10.2125 13.2237 10.387 13.24 10.56V12.07H15.46L15.1 14.4H13.25V20C15.1399 19.7011 16.8601 18.7347 18.0985 17.2761C19.3369 15.8175 20.0115 13.9634 20 12.05Z"></path>
                  </svg>
                )}
                {social.platform === "instagram" && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                    ></path>
                    <path d="M18 5C17.4477 5 17 5.44772 17 6C17 6.55228 17.4477 7 18 7C18.5523 7 19 6.55228 19 6C19 5.44772 18.5523 5 18 5Z"></path>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M1.65396 4.27606C1 5.55953 1 7.23969 1 10.6V13.4C1 16.7603 1 18.4405 1.65396 19.7239C2.2292 20.8529 3.14708 21.7708 4.27606 22.346C5.55953 23 7.23969 23 10.6 23H13.4C16.7603 23 18.4405 23 19.7239 22.346C20.8529 21.7708 21.7708 20.8529 22.346 19.7239C23 18.4405 23 16.7603 23 13.4V10.6C23 7.23969 23 5.55953 22.346 4.27606C21.7708 3.14708 20.8529 2.2292 19.7239 1.65396C18.4405 1 16.7603 1 13.4 1H10.6C7.23969 1 5.55953 1 4.27606 1.65396C3.14708 2.2292 2.2292 3.14708 1.65396 4.27606Z"
                    ></path>
                  </svg>
                )}
                {social.platform === "twitter" && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M22.162 5.65593C21.3985 5.99362 20.589 6.2154 19.76 6.31393C20.6337 5.79136 21.2877 4.96894 21.6 3.99993C20.78 4.48793 19.881 4.82993 18.944 5.01493C18.3146 4.34151 17.4803 3.89489 16.5709 3.74451C15.6615 3.59413 14.7279 3.74842 13.9153 4.18338C13.1026 4.61834 12.4564 5.30961 12.0771 6.14972C11.6978 6.98983 11.6067 7.93171 11.818 8.82893C10.1551 8.74558 8.52832 8.31345 7.04328 7.56059C5.55823 6.80773 4.24812 5.75098 3.19799 4.45893C2.82628 5.09738 2.63095 5.82315 2.63199 6.56193C2.63199 8.01193 3.36999 9.29293 4.49199 10.0429C3.828 10.022 3.17862 9.84271 2.59799 9.51993V9.57193C2.59819 10.5376 2.93236 11.4735 3.54384 12.221C4.15532 12.9684 5.00647 13.4814 5.95299 13.6729C5.33661 13.84 4.6903 13.8646 4.06299 13.7449C4.32986 14.5762 4.85 15.3031 5.55058 15.824C6.25117 16.345 7.09712 16.6337 7.96999 16.6499C7.10247 17.3313 6.10917 17.8349 5.04687 18.1321C3.98458 18.4293 2.87412 18.5142 1.77899 18.3819C3.69069 19.6114 5.91609 20.2641 8.18899 20.2619C15.882 20.2619 20.089 13.8889 20.089 8.36193C20.089 8.18193 20.084 7.99993 20.076 7.82193C20.8949 7.2301 21.6016 6.49695 22.163 5.65693L22.162 5.65593Z"></path>
                  </svg>
                )}
              </a>
            ))}
          </div>

          <div id="go-home" className="text-center mx-auto mt-10">
            <a
              className="mt-3 py-2 px-10 h-[40px] rounded-md border border-[#814B00] bg-[#814B00] text-[#fefefe] font-medium text-md hover:bg-white hover:text-[#814B00]"
              href={question.completionPage.homeLink.url}
            >
              {question.completionPage.homeLink.text}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuestionLayout
      title={title}
      subtitle={subtitle}
      subtitle2={subtitle2}
      currentPage={currentPage}
      pageNo={pageNo}
      questionId={questionId}
      inputType={inputType}
    >
      {renderContent()}

      {options.map((option, index) => {
        const name = option.name || questionId;
        const isChecked =
          inputType === "checkbox"
            ? formData[name] === option.value
            : formData[questionId] === option.value;

        return (
          <QuestionOption
            key={option.id || `${questionId}_${index}`}
            id={option.id}
            name={name}
            value={option.value}
            label={option.label || option.value}
            checked={isChecked}
            onChange={() => {
              if (inputType === "checkbox") {
                if (option.isNoneOption) {
                  handlers.handleNoneOption(questionId, option);
                } else if (option.requiresConsent) {
                  logger.log("This option requires consent popup:", option);

                  const fieldName = option.name || questionId;
                  const currentValue = formData[fieldName];
                  const newValue =
                    currentValue === option.value ? "" : option.value;

                  setFormData((prev) => ({
                    ...prev,
                    [fieldName]: newValue,
                  }));

                  updateLocalStorage();

                  if (newValue !== "" && option.consentPopupContent) {
                    logger.log(
                      "Showing consent popup for option:",
                      option.value
                    );

                    setPopupConfig({
                      title: option.consentPopupContent.title || "Warning",
                      message:
                        option.consentPopupContent.message ||
                        "This selection requires your attention.",
                      acknowledgementRequired:
                        !!option.consentPopupContent.acknowledgementRequired,
                      acknowledgementField:
                        option.consentPopupContent.acknowledgementField || "",
                      blocksProceed: !!option.consentPopupContent.blocksProceed,
                      buttonText: option.consentPopupContent.buttonText || "OK",
                    });

                    if (option.consentPopupContent.acknowledgementRequired) {
                      setPopupAcknowledged(false);
                    }

                    setShowPopup(true);
                  }
                } else {
                  handlers.handleCheckboxSelect(questionId, option);
                }
              } else {
                if (option.requiresConsent) {
                  handlers.handleConsentOption(questionId, option);
                } else {
                  handlers.handleOptionSelect(questionId, option);
                }
              }
            }}
            type={inputType === "checkbox" ? "checkbox" : "radio"}
            isNoneOption={option.isNoneOption}
            isOtherOption={option.isOtherOption}
          />
        );
      })}

      {showConditionalField && (
        <QuestionAdditionalInput
          id={conditionalField.fieldId}
          name={conditionalField.name}
          placeholder={conditionalField.placeholder || ""}
          label={conditionalField.label || ""}
          value={formData[conditionalField.name] || ""}
          onChange={(e) =>
            handlers.handleInputChange(conditionalField.name, e.target.value)
          }
          type={conditionalField.type || "textarea"}
          disabled={!showConditionalField}
        />
      )}

      {inputType === "upload" && renderFileUpload()}

      {renderAcknowledgement()}
    </QuestionLayout>
  );
}
