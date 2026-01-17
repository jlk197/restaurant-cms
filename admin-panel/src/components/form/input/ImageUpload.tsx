import React, { useEffect, useState } from "react";
import API_CONFIG from "../../../config/api";

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (url: string) => void;
  className?: string; // Opcjonalnie: do przekazywania dodatkowych klas z zewnątrz
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageUploaded,
  className = "",
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [preview, setPreview] = useState<string>(currentImage || "");

  useEffect(() => {
    setPreview(currentImage || "");
  }, [currentImage]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Walidacja typu
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only image files are allowed (JPG, PNG, GIF, WebP)");
      return;
    }

    // 2. Walidacja rozmiaru (5MB)
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
      // Upewniamy się, że nie ma podwójnego slash w URL
      const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, "");
      
      const response = await fetch(`${baseUrl}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Konstrukcja pełnego URL (zakładając, że backend zwraca ścieżkę względną)
        const relativeUrl = data.url.startsWith("/") ? data.url : `/${data.url}`;
        const fullUrl = `${baseUrl}${relativeUrl}`;
        
        setPreview(fullUrl);
        onImageUploaded(fullUrl);
      } else {
        setError(data.error || "Error uploading file");
        // Reset inputa w przypadku błędu (opcjonalne)
        event.target.value = "";
      }
    } catch (err) {
      setError("Server connection failed during upload");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      
      {/* --- SEKCJA PODGLĄDU --- */}
      {/* Ten kontener pilnuje, żeby zdjęcie nie było za duże */}
      <div className="mb-4 w-full flex justify-center bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden relative min-h-[150px]">
        
        {uploading ? (
          // Stan ładowania (Spinner)
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium text-blue-600">Uploading...</span>
          </div>
        ) : preview ? (
          // Wyświetlanie zdjęcia
          <div className="relative w-full flex justify-center p-2">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 w-auto object-contain rounded-md shadow-sm" 
              // max-h-64 to klucz: zdjęcie nigdy nie będzie wyższe niż 256px
            />
          </div>
        ) : (
          // Placeholder gdy brak zdjęcia
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="text-sm">No image selected</span>
          </div>
        )}
      </div>

      {/* --- SEKCJA INPUTA --- */}
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2.5 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer disabled:cursor-not-allowed disabled:opacity-50
          "
        />
      </div>

      {/* --- SEKCJA BŁĘDÓW --- */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;