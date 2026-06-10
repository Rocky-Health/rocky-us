import React, { useState, useRef } from "react";
import { uploadFileToS3WithProgress } from "@/utils/s3/frontend-upload";

const PhotoUploadStep = ({
  onContinue,
  onBack,
  isUploading = false,
  onPhotoUpload,
  questionnaire = "skincare", // Default questionnaire type
}) => {
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [sidePhoto, setSidePhoto] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [sidePreview, setSidePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [frontPhotoUrl, setFrontPhotoUrl] = useState(null);
  const [sidePhotoUrl, setSidePhotoUrl] = useState(null);
  const frontInputRef = useRef(null);
  const sideInputRef = useRef(null);

  const handleFrontPhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFrontPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setFrontPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSidePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSidePhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setSidePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!frontPhoto || !sidePhoto) {
      setUploadError("Please select both front and side photos");
      return;
    }

    try {
      setUploadError(null);
      setUploadProgress(0);

      // Upload front photo
      const frontUrl = await uploadFileToS3WithProgress(
        frontPhoto,
        "skincare-consultation",
        questionnaire,
        (progress) => {
          setUploadProgress(progress / 2); // Half progress for front photo
        }
      );
      setFrontPhotoUrl(frontUrl);

      // Upload side photo
      const sideUrl = await uploadFileToS3WithProgress(
        sidePhoto,
        "skincare-consultation",
        questionnaire,
        (progress) => {
          setUploadProgress(50 + progress / 2); // Second half progress for side photo
        }
      );
      setSidePhotoUrl(sideUrl);

      setUploadProgress(100);

      // Call onPhotoUpload with the URLs instead of file objects
      if (onPhotoUpload) {
        await onPhotoUpload(frontUrl, sideUrl);
      }

      // Continue to next step
      onContinue();
    } catch (error) {
      console.error("Photo upload error:", error);
      setUploadError(
        error.message || "Failed to upload photos. Please try again."
      );
    }
  };

  const canContinue = frontPhoto && sidePhoto;

  return (
    <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 mt-6 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <h1 className="headers-font text-[26px] font-[450] md:font-medium md:text-[32px] md:leading-[115%] leading-[120%] tracking-[-1%] md:tracking-[-2%]">
          Photo Upload
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-[14px] md:text-[16px] text-gray-600 mb-6">
        Please upload a clear image of your face or area of concern for
        assessment
      </p>

      <div className="w-full space-y-8">
        {/* Front Photo Upload */}
        <div className="w-full md:w-4/5 mx-auto">
          <input
            ref={frontInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleFrontPhotoSelect}
          />
          <label
            onClick={() => frontInputRef.current?.click()}
            className="flex items-center cursor-pointer p-5 border-2 border-gray-300 rounded-lg shadow-md hover:bg-gray-50"
          >
            <div className="flex w-full items-center">
              <img
                className="w-16 h-16 object-contain mr-4"
                src={
                  frontPreview ||
                  "https://wpbe.myrocky.com/wp-content/themes/salient-child/img/photo_upload_icon.png"
                }
                alt="Upload icon"
              />
              <span className="text-[#C19A6B]">
                Tap to upload Front View photo
              </span>
            </div>
          </label>
          <p className="text-center text-sm mt-2 mb-6">
            Please provide a clear photo of your front view.
          </p>
        </div>

        {/* Side Photo Upload */}
        <div className="w-full md:w-4/5 mx-auto">
          <input
            ref={sideInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleSidePhotoSelect}
          />
          <label
            onClick={() => sideInputRef.current?.click()}
            className="flex items-center cursor-pointer p-5 border-2 border-gray-300 rounded-lg shadow-md hover:bg-gray-50"
          >
            <div className="flex w-full items-center">
              <img
                className="w-16 h-16 object-contain mr-4"
                src={
                  sidePreview ||
                  "https://wpbe.myrocky.com/wp-content/themes/salient-child/img/photo_upload_icon.png"
                }
                alt="Upload icon"
              />
              <span className="text-[#C19A6B]">
                Tap to upload Side View photo
              </span>
            </div>
          </label>
          <p className="text-center text-sm mt-2">
            Please provide a clear photo of your side view
          </p>
          <p className="text-center text-xs mt-1 text-gray-500">
            It helps to use a mirror
          </p>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Uploading photos...</span>
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
        {uploadProgress === 100 && frontPhotoUrl && sidePhotoUrl && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">
              Photos uploaded successfully!
            </p>
          </div>
        )}

        {/* File format information */}
        <div className="text-center text-xs text-gray-400 mt-6">
          <p>Only JPG, JPEG, PNG, HEIF, and HEIC images are supported.</p>
          <p>Max allowed file size per image is 20MB</p>
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

export default PhotoUploadStep;
