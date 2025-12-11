import React, { useState } from "react";
import API_CONFIG from "../../../config/api";

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (url: string) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageUploaded,
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [preview, setPreview] = useState<string>(currentImage || "");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File type validation
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Only image files are allowed (JPG, PNG, GIF, WebP)");
      return;
    }

    // File size validation (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const fullUrl = `${API_CONFIG.BASE_URL}${data.url}`;
        setPreview(fullUrl);
        onImageUploaded(fullUrl);
      } else {
        setError(data.error || "Error uploading file");
      }
    } catch (err) {
      setError("Error uploading file");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="max-w-xs h-auto border border-gray-200 rounded-lg dark:border-gray-800"
          />
        </div>
      )}

      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-none focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {uploading && <div className="text-sm text-blue-500">Uploading...</div>}

      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  );
};

export default ImageUpload;
