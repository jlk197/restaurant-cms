import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/Loader";
import chefService from "../../services/chefService";
import ImageUpload from "../../components/form/input/ImageUpload";

interface Chef {
  id: number;
  name: string;
  surname: string;
  specialization: string;
  facebook_link: string;
  instagram_link: string;
  twitter_link: string;
  image_url?: string;
}

export default function ChefPage() {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  // Kopia robocza do edycji
  const [editedChefs, setEditedChefs] = useState<Chef[]>([]);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // --- POBIERANIE DANYCH ---
  const fetchChefs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await chefService.getAll();
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setChefs(data);
      } else {
        setSaveError(response.error || "Failed to load chefs");
      }
    } catch (err) {
      setSaveError("Connection error while fetching data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChefs();
  }, [fetchChefs]);

  // --- OBSŁUGA TRYBU EDYCJI ---
  const toggleEditMode = () => {
    setIsEdit(true);
    // Tworzymy głęboką kopię danych do edycji
    setEditedChefs(JSON.parse(JSON.stringify(chefs)));
    setSaveError("");
    setSaveSuccess(false);
  };

  const exitEditMode = () => {
    setIsEdit(false);
    setEditedChefs([]);
    setSaveError("");
  };

  // --- OBSŁUGA ZMIAN DANYCH ---
  const handleTextChange = (index: number, key: keyof Chef, value: string) => {
    setEditedChefs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  // Nowa, uproszczona obsługa zmiany zdjęcia
  // Komponent ImageUpload już wgrał plik i dał nam gotowy URL
  const handleImageUploaded = (index: number, newUrl: string) => {
    setEditedChefs(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], image_url: newUrl };
      return updated;
    });
  };

  const saveHandler = async () => {
    setSaveSuccess(false);
    setSaveError("");
    setIsLoading(true);

    try {
      for (const chef of editedChefs) {
        console.log(`Próba zapisu kucharza: ${chef.name} (ID: ${chef.id})`);
        
        const response = await chefService.updateSingle(chef.id, chef);
        
        // --- TUTAJ JEST KLUCZOWA ZMIANA DIAGNOSTYCZNA ---
        if (!response.success) {
          // Logujemy pełny błąd w konsoli przeglądarki (F12)
          console.error("Błąd zapisu z backendu:", response);
          
          // Wyświetlamy konkretny powód błędu na ekranie
          throw new Error(
            `Błąd zapisu kucharza ${chef.name}: ${response.error || "Nieznany błąd serwera"}`
          );
        }
      }

      setSaveSuccess(true);
      setIsEdit(false);
      await fetchChefs();
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (err: any) {
      console.error("Save Error:", err);
      setSaveError(err.message); // Teraz zobaczysz prawdziwy komunikat SQL (np. "column image_url does not exist")
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDERING HELPER ---
  const renderInput = (label: string, value: string, index: number, field: keyof Chef) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type="text"
        value={value || ""}
        disabled={!isEdit}
        onChange={(e) => handleTextChange(index, field, e.target.value)}
        className={`w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white transition-colors
          ${isEdit 
            ? 'border-blue-300 focus:ring-2 focus:ring-blue-500' 
            : 'border-transparent bg-gray-50 dark:border-gray-700'
          }`}
      />
    </div>
  );

  if (isLoading && !isEdit) return <Loader />;

  return (
    <>
      <PageMeta title="Chef Management" description="Restaurant CMS" />

      {saveError && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">
          {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="p-4 mb-4 bg-green-100 text-green-700 border border-green-200 rounded-lg">
          Changes saved successfully!
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Chef Team</h3>
          <div className="space-x-4">
            {isEdit ? (
              <>
                <button 
                  onClick={exitEditMode} 
                  className="px-6 py-2 text-gray-600 dark:text-gray-300 font-bold border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveHandler} 
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </>
            ) : (
              <button 
                onClick={toggleEditMode} 
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
              >
                Edit Team
              </button>
            )}
          </div>
        </div>

        <div className="space-y-12">
          {(isEdit ? editedChefs : chefs).map((chef, index) => (
            <div key={chef.id} className="pb-8 border-b last:border-0 border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* --- SEKCJA ZDJĘCIA --- */}
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Profile Photo
                  </label>
                  
                  {isEdit ? (
                    /* TRYB EDYCJI: Używamy nowego komponentu ImageUpload */
                    <div className="w-full max-w-xs">
                      <ImageUpload
                        currentImage={chef.image_url}
                        onImageUploaded={(url) => handleImageUploaded(index, url)}
                        className="flex flex-col items-center"
                      />
                    </div>
                  ) : (
                    /* TRYB PODGLĄDU: Zwykły tag img */
                    <div className="relative w-40 h-40">
                      <img 
                        src={chef.image_url || '/default-avatar.png'} 
                        alt={`${chef.name} ${chef.surname}`} 
                        className="w-full h-full rounded-full object-cover border-4 border-gray-100 dark:border-gray-700 shadow-sm"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* --- DANE TEKSTOWE --- */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {renderInput("First Name", chef.name, index, "name")}
                  {renderInput("Last Name", chef.surname, index, "surname")}
                  
                  <div className="sm:col-span-2">
                    {renderInput("Specialization", chef.specialization, index, "specialization")}
                  </div>
                  
                  <div className="sm:col-span-2 pt-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Social Media Links</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {renderInput("Facebook URL", chef.facebook_link, index, "facebook_link")}
                      {renderInput("Instagram URL", chef.instagram_link, index, "instagram_link")}
                      {renderInput("Twitter URL", chef.twitter_link, index, "twitter_link")}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
          
          {chefs.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-10">
              No chefs found. Add one in the database.
            </div>
          )}
        </div>
      </div>
    </>
  );
}