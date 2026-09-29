import React, { useState, useRef } from "react";
import { uploadFileToS3WithProgress } from "@/utils/s3/frontend-upload";
import { logger } from "@/utils/devLogger";

const IdUploadStep = ({
  onContinue,
  onBack,
  isUploading = false,
  onIdUpload,
  questionnaire = "skincare", // Default questionnaire type
}) => {
  const [idPhoto, setIdPhoto] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [idPhotoUrl, setIdPhotoUrl] = useState(null);
  const idInputRef = useRef(null);

  const handleIdPhotoSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadError(null);

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();

    const supportedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heif",
      "image/heic",
    ];

    const supportedExtensions = ["jpg", "jpeg", "png", "heif", "heic"];

    const isSupportedMimeType = supportedMimeTypes.includes(fileType);
    const isSupportedExtension = supportedExtensions.includes(fileExtension);

    if (!isSupportedMimeType && !isSupportedExtension) {
      setUploadError(
        "Only JPG, JPEG, PNG, HEIF, and HEIC images are supported"
      );
      event.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError("Maximum file size is 20MB");
      event.target.value = "";
      return;
    }

    setIdPhoto(file);

    const isHeifFile = fileExtension === "heif" || fileExtension === "heic";
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isHeifFile && !isSafari) {
      setIdPreview(
        `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/photo_upload_icon.png`
      );
    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        setIdPreview(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!idPhoto) {
      setUploadError("Please select an ID photo");
      return;
    }

    try {
      setUploadError(null);
      setUploadProgress(0);

      // Upload ID photo
      const idUrl = await uploadFileToS3WithProgress(
        idPhoto,
        "skincare-consultation-ids",
        questionnaire,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      setIdPhotoUrl(idUrl);

      setUploadProgress(100);

      // Call onIdUpload with the URL
      if (onIdUpload) {
        await onIdUpload(idUrl);
      }

      // Continue to next step
      onContinue();
    } catch (error) {
      logger.error("ID photo upload error:", error);
      setUploadError(
        error.message || "Failed to upload ID photo. Please try again."
      );
    }
  };

  const canContinue = idPhoto;

  return (
    <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 mt-6 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="headers-font text-[26px] font-[450] md:font-medium md:text-[32px] md:leading-[115%] leading-[120%] tracking-[-1%] md:tracking-[-2%]">
          ID Verification
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-[14px] md:text-[16px] text-gray-600 mb-6">
        Please upload a clear photo of your government-issued ID for
        verification purposes
      </p>

      <div className="w-full space-y-8">
        {/* ID Photo Upload */}
        <div className="w-full md:w-4/5 mx-auto">
          <input
            ref={idInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleIdPhotoSelect}
          />
          <div
            onClick={() => idInputRef.current?.click()}
            className="w-full h-40 flex items-center justify-center border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 mb-6 mx-auto"
          >
            {!idPhoto ? (
              <div className="flex flex-row items-center w-full justify-center px-4">
                <div className="w-14 h-14 md:w-20 md:h-20 flex items-center justify-center">
                  <img
                    src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/ID-icon.png"
                    alt="ID"
                    className="w-14 h-14 md:w-20 md:h-20"
                  />
                </div>
                <span className="text-[#C19A6B] text-base md:text-lg ml-3 md:ml-5 break-words">
                  Tap to upload the ID photo
                </span>
              </div>
            ) : (
              <img
                id="photo-id-preview"
                src={idPreview}
                alt="ID Preview"
                className="max-w-full max-h-36 object-contain"
              />
            )}
          </div>
          <p className="text-center text-sm mt-2 mb-6">
            Please provide a clear photo of your government-issued ID (driver's
            license, passport, etc.)
          </p>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Uploading ID photo...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#C19A6B] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Upload Error */}
        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{uploadError}</p>
          </div>
        )}

        {/* Success Message */}
        {uploadProgress === 100 && idPhotoUrl && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">
              ID photo uploaded successfully!
            </p>
          </div>
        )}

        {/* File format information */}
        <div className="text-center text-xs text-gray-400 mt-6">
          <p>Only JPG, JPEG, PNG, HEIF, and HEIC images are supported.</p>
          <p>Max allowed file size is 20MB</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onBack}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50"
          >
            Back
          </button>

          <button
            onClick={handleUpload}
            disabled={!canContinue || uploadProgress > 0}
            className={`flex-1 py-3 rounded-full font-medium ${
              canContinue && uploadProgress === 0
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {uploadProgress > 0 ? (
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
                Uploading... {Math.round(uploadProgress)}%
              </span>
            ) : (
              "Upload and Continue"
            )}
          </button>
        </div>
      </div>

      {/* Privacy text */}
      <div className="text-[10px] my-6 text-[#00000059] text-left font-[400] leading-[140%] tracking-[0%]">
        We respect your privacy. All of your information is securely stored on
        our HIPAA Compliant server.
      </div>
    </div>
  );
};

export default IdUploadStep;
