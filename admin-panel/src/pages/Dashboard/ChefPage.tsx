import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/Loader"; 

// 1. Model danych (DODANO currentPhotoUrl)
interface Chef {
  id: number;
  name: string;
  surname: string;
  // Zakładamy, że serwer API zwraca aktualny URL zdjęcia, nawet jeśli nie jest edytowany
  currentPhotoUrl?: string; 
  specialization: string;
  facebook_link: string; 
  instagram_link: string;
  twitter_link: string;
}

// Typ do przechowywania pliku i tymczasowego URL podglądu
interface FileData {
    file: File;
    previewUrl: string;
}

// ----------------------------------------------------
// KONFIGURACJA API
const API_BASE_URL = "http://localhost:5000/api/chefs"; 
// ----------------------------------------------------

export default function ChefPage() {
  // --- STANY ---
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Stany edycji
  const [isEdit, setIsEdit] = useState(false);
  const [editedChefs, setEditedChefs] = useState<Chef[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // NOWY STAN DLA PLIKÓW: Mapowanie ID Kucharza na dane pliku (File i URL podglądu)
  const [filesToUpload, setFilesToUpload] = useState<Map<number, FileData>>(new Map());

  // --- FUNKCJA POBIERANIA DANYCH (GET) ---
  const fetchChefs = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(API_BASE_URL);

      if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      let fetchedChefs: Chef[] = [];
      
      // Obsługa różnych formatów API (czysta tablica lub obiekt z polem 'data')
      const arrayData = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);

      fetchedChefs = arrayData.map((chef: any) => ({
          id: chef.id,
          name: chef.name,
          surname: chef.surname,
          specialization: chef.specialization,
          facebook_link: chef.facebook_link,
          instagram_link: chef.instagram_link,
          twitter_link: chef.twitter_link,
          // Zakładamy, że API zwraca URL do zdjęcia pod kluczem image_url lub photo_url
          currentPhotoUrl: chef.image_url || chef.photo_url || undefined,
      }));

      setChefs(fetchedChefs); 

    } catch (err) {
      console.error("Error loading chef data:", err);
      setError("Failed to connect to API or retrieve the list of chefs.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Pobierz dane przy ładowaniu komponentu
  useEffect(() => {
    fetchChefs();
  }, [fetchChefs]);
  
  // Cleanup dla tymczasowych URL-i podglądu
  useEffect(() => {
    return () => {
        filesToUpload.forEach(fileData => URL.revokeObjectURL(fileData.previewUrl));
    };
  }, [filesToUpload]);

  // --- FUNKCJA ZAPISYWANIA DANYCH (PUT/PATCH) ---
  const saveHandler = async () => {
  if (!editedChefs) return;
  setSaveSuccess(false);
  setSaveError("");

  try {
    const formData = new FormData();

    // Kluczowe: przesyłamy dane kucharzy jako string JSON
    formData.append("chefs", JSON.stringify(editedChefs));

    // Dodajemy pliki
    filesToUpload.forEach((fileData, chefId) => {
      formData.append(`photo`, fileData.file); 
      // Dodajemy też informację, do którego kucharza należy plik, 
      // aby backend wiedział co z nim zrobić
      formData.append(`chefIdsForPhotos`, chefId.toString());
    });

    const response = await fetch(API_BASE_URL, {
      method: "POST", // Jeśli nadal masz 404, spróbuj zmienić na "POST"
      body: formData,
      // WAŻNE: Nie dodawaj nagłówka Content-Type. 
      // Przeglądarka sama wstawi "multipart/form-data; boundary=..."
    });

    if (response.ok) {
      setSaveSuccess(true);
      setIsEdit(false);
      setFilesToUpload(new Map());
      await fetchChefs(); 
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      // Pobieramy treść błędu z serwera, żeby wiedzieć co jest nie tak
      const errorText = await response.text();
      console.error("Server response error:", errorText);
      throw new Error(`Server error: ${response.status}`);
    }
  } catch (err: any) {
    console.error("Save Error:", err);
    setSaveError(err.message || "Failed to save. Endpoint not found (404) or Server Error.");
  }
};


  // --- LOGIKA EDYCJI I UI HELPERY ---
  
  const exitEditMode = () => {
    setIsEdit(false);
    setEditedChefs(chefs); 
    setSaveSuccess(false);
    setSaveError("");
    // Wyczyść tymczasowe URL-e podglądu przy anulowaniu
    filesToUpload.forEach(fileData => URL.revokeObjectURL(fileData.previewUrl));
    setFilesToUpload(new Map());
  };

  const toggleEditMode = () => {
    setIsEdit(true);
    setEditedChefs(JSON.parse(JSON.stringify(chefs))); 
    setSaveSuccess(false);
    setSaveError("");
  };
  
  const handleChange = (index: number, key: keyof Chef, value: string) => {
    setEditedChefs((prevChefs) => {
      const newChefs = [...prevChefs];
      newChefs[index] = { ...newChefs[index], [key]: value };
      return newChefs;
    });
  };

  const renderInput = (label: string, value: string | undefined, index: number, fieldKey: keyof Chef, placeholder: string = "") => (
    <div className="mb-4 w-full">
      <label className="mb-2.5 block font-medium text-black dark:text-white">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value || ""}
        disabled={!isEdit}
        onChange={(e) => handleChange(index, fieldKey, e.target.value)}
        className={`w-full rounded-lg border bg-transparent py-3 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:bg-form-input dark:text-white dark:focus:border-primary
          ${isEdit ? "border-stroke dark:border-strokedark" : "border-transparent px-0 pl-0 cursor-default"}`}
      />
    </div>
  );

  // NOWA FUNKCJA DO OBSŁUGI ZMIANY PLIKU
  const handleFileChange = (chefId: number, file: File | null) => {
    setFilesToUpload(prevMap => {
        const newMap = new Map(prevMap);
        if (file) {
            // Generowanie tymczasowego URL do podglądu
            const previewUrl = URL.createObjectURL(file);
            // Anulowanie poprzedniego, jeśli istniał
            if (newMap.has(chefId)) {
                URL.revokeObjectURL(newMap.get(chefId)!.previewUrl);
            }
            newMap.set(chefId, { file, previewUrl });
        } else {
            // Czyszczenie URL, jeśli plik został usunięty
            if (newMap.has(chefId)) {
                URL.revokeObjectURL(newMap.get(chefId)!.previewUrl);
            }
            newMap.delete(chefId);
        }
        return newMap;
    });
  };

  // Zaktualizowany renderFileUpload z podglądem
  const renderFileUpload = (chefId: number, currentUrl: string | undefined) => {
    const fileData = filesToUpload.get(chefId);
    const displayUrl = fileData ? fileData.previewUrl : currentUrl;

    return (
        <div className="mb-4 w-full">
            <label className="mb-2.5 block font-medium text-black dark:text-white">Upload Photo</label>
            <div className="flex items-center space-x-4">
                <input 
                    type="file" 
                    disabled={!isEdit}
                    accept="image/*"
                    onChange={(e) => handleFileChange(chefId, e.target.files ? e.target.files[0] : null)}
                    className={`w-full text-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 
                        ${!isEdit ? "opacity-70 cursor-not-allowed" : ""}`}
                />
            </div>
            {displayUrl && (
                <div className="mt-3 flex items-center space-x-4">
                    <img 
                        src={displayUrl} 
                        alt="Photo Preview" 
                        className="h-20 w-20 rounded-full object-cover border border-dashed border-gray-400" 
                    />
                    <p className="text-sm text-gray-500">
                        {fileData ? `NEW: ${fileData.file.name}` : `CURRENT: ${currentUrl}`}
                    </p>
                </div>
            )}
            {!displayUrl && <p className="mt-1 text-sm text-gray-500">No photo uploaded yet.</p>}
        </div>
    );
  };


  if (isLoading) return <Loader />;

  return (
    <>
      <PageMeta
        title="Chef Management | Admin Panel"
        description="Edit the data of your restaurant's chef team."
      />

      {/* Notifications */}
      {error && <div className="mb-4 p-4 text-red-600 bg-red-50 border border-red-200 rounded">{error}</div>}
      {saveError && <div className="mb-4 p-4 text-red-600 bg-red-50 border border-red-200 rounded">{saveError}</div>}
      {saveSuccess && <div className="mb-4 p-4 text-green-600 bg-green-50 border border-green-200 rounded">Changes saved successfully!</div>}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
        
        {/* HEADER */}
        <div className="flex flex-row justify-between mb-6 items-center">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Chef Team Management
          </h3>
          
          <div className="flex gap-4">
            {isEdit ? (
              <>
                <button onClick={exitEditMode} className="text-blue-500 font-bold border border-blue-500 px-6 py-2 rounded-lg">Cancel</button>
                <button onClick={saveHandler} className="text-green-500 font-bold border border-green-500 px-6 py-2 rounded-lg">Save</button>
              </>
            ) : (
              <button onClick={toggleEditMode} className="text-blue-500 font-bold border border-blue-500 px-6 py-2 rounded-lg">Edit</button>
            )}
          </div>
        </div>

        {/* CHEF LIST */}
        <div className="space-y-8">
          {(isEdit ? editedChefs : chefs)?.map((chef, index) => (
            <div key={chef.id || index} className="border-b border-stroke pb-6 last:border-0 dark:border-strokedark">
              
              <h4 className="mb-4 text-lg font-semibold text-black dark:text-white bg-gray-100 dark:bg-meta-4 p-2 rounded">
                Chef #{index + 1}: {chef.name} {chef.surname}
              </h4>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                {renderInput("First Name", chef.name, index, "name", "Enter first name")}
                {renderInput("Last Name", chef.surname, index, "surname", "Enter last name")}
                
                <div className="md:col-span-2">
                   {renderInput("Specialization", chef.specialization, index, "specialization", "e.g., Desserts, Italian Cuisine")}
                </div>

                {/* Sekcja Uploadu Zdjęcia (z podglądem) */}
                <div className="md:col-span-2">
                   {renderFileUpload(chef.id, chef.currentPhotoUrl)}
                </div>

                {/* Social Media */}
                <div className="md:col-span-2 mt-2">
                  <h5 className="mb-3 font-medium text-gray-500 dark:text-gray-400">Social Media Links</h5>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {renderInput("Facebook", chef.facebook_link, index, "facebook_link", "Facebook Profile Link")}
                    {renderInput("Instagram", chef.instagram_link, index, "instagram_link", "Instagram Profile Link")}
                    {renderInput("Twitter (X)", chef.twitter_link, index, "twitter_link", "Twitter/X Profile Link")}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(!chefs || chefs.length === 0) && !isLoading && (
             <p className="text-center text-lg py-10">No chef data available. Check API connection.</p>
          )}
        </div>
      </div>
    </>
  );
}