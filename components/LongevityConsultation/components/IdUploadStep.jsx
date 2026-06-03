"use client";

import React, { useRef, useState } from "react";

const IdUploadStep = ({ onComplete, isSubmitting }) => {
  const fileInputRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleTap = () => fileInputRef.current?.click();

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    const supportedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heif",
      "image/heic",
    ];
    const supportedExtensions = ["jpg", "jpeg", "png", "heif", "heic"];
    const ext = file.name.toLowerCase().split(".").pop();

    if (!supportedMimeTypes.includes(file.type) && !supportedExtensions.includes(ext)) {
      setError("Only JPG, JPEG, PNG, HEIF, and HEIC images are supported");
      e.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError("Maximum file size is 20MB");
      e.target.value = "";
      return;
    }

    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => setPreviewSrc(ev.target?.result || "");
    reader.readAsDataURL(file);
  };

  const handleUploadAndContinue = async () => {
    if (!photoFile) {
      setError("Please upload your photo ID to continue");
      return;
    }

    setError("");
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { uploadFileToS3WithProgress } = await import(
        "@/utils/s3/frontend-upload"
      );

      const s3Url = await uploadFileToS3WithProgress(
        photoFile,
        "questionnaire/longevity-photo-ids",
        "longevity",
        (progress) => setUploadProgress(progress),
      );

      await onComplete(s3Url);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const isBusy = isUploading || isSubmitting;

  return (
    <div className="px-4 pt-6 pb-36 max-w-lg mx-auto">
      <h1 className="text-3xl text-center text-[#AE7E56] font-bold mb-6">
        Upload Photo ID
      </h1>
      <h3 className="text-lg text-center font-medium mb-6">
        Please upload a photo of your ID
      </h3>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/jpg,image/png,image/heif,image/heic"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div
        onClick={handleTap}
        className="w-full h-40 flex items-center justify-center border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 mb-6 mx-auto relative"
      >
        {!photoFile ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 flex items-center justify-center mb-2">
              <img
                src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/ID-icon.png"
                alt="ID"
                className="w-20 h-20"
              />
            </div>
            <span className="text-[#C19A6B] text-lg">
              Tap to upload the ID photo
            </span>
          </div>
        ) : previewSrc ? (
          <>
            <img
              src={previewSrc}
              alt="ID Preview"
              className="max-w-full max-h-36 object-contain"
            />
            {isUploading && uploadProgress > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-lg font-medium">
                  Uploading... {Math.round(uploadProgress)}%
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-xs text-center px-2">
              Preview not available
            </div>
            <span className="text-[#C19A6B] text-lg">Tap to change</span>
          </div>
        )}
      </div>

      {photoFile && (
        <p className="text-center text-xs text-gray-500 mb-4 break-words px-2">
          Photo selected: {photoFile.name}
        </p>
      )}

      {!photoFile && (
        <p className="text-center text-sm text-gray-500 mb-6">
          Only JPG, JPEG, PNG, HEIF, and HEIC images are supported.
          <br />
          Maximum file size per image is 20MB
        </p>
      )}

      {error && (
        <p className="text-red-500 text-center text-sm mb-4">{error}</p>
      )}

      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg"
        style={{ zIndex: 99999 }}
      >
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={handleUploadAndContinue}
            disabled={!photoFile || isBusy}
            className="w-full py-3 rounded-full font-medium bg-black text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading
              ? `Uploading... ${Math.round(uploadProgress)}%`
              : isSubmitting
                ? "Saving…"
                : "Upload & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdUploadStep;
