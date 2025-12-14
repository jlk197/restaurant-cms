import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";

interface Chef {
  id: number;
  firstName: string;
  lastName: string;
  photoUrl: string;
  specialization: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
}

// 2. Dane przykładowe
const initialChefs: Chef[] = [
  {
    id: 1,
    firstName: "Gordon",
    lastName: "Ramsey",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Gordon_Ramsay.jpg",
    specialization: "Szef Kuchni / Kuchnia Międzynarodowa",
    facebookUrl: "https://facebook.com",
    instagramUrl: "https://instagram.com",
    twitterUrl: "https://twitter.com",
  },
  {
    id: 2,
    firstName: "Magda",
    lastName: "Gessler",
    photoUrl: "https://ocdn.eu/pulscms-transforms/1/Q79k9kpTURBXy9iMzQ3ZWQ0MGRiOGI4M2Y4NTlhNTI0MDcwNTBkODY2YS5qcGeSlQMAzQHuzRVwzQwRkwXNBLDNAqTeAAGhMAE",
    specialization: "Kuchnia Polska / Desery",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
  }
];

export default function ChefPage() {
  const [chefs, setChefs] = useState<Chef[]>(initialChefs);
  
  const [isEdit, setIsEdit] = useState(false);
  const [editedChefs, setEditedChefs] = useState<Chef[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleEditMode = () => {
    setIsEdit(true);
    setEditedChefs(JSON.parse(JSON.stringify(chefs))); // Głęboka kopia danych do edycji
    setSaveSuccess(false);
  };

  const exitEditMode = () => {
    setIsEdit(false);
    setEditedChefs([]);
    setSaveSuccess(false);
  };

  const handleChange = (index: number, key: keyof Chef, value: string) => {
    setEditedChefs((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [key]: value };
      return newData;
    });
  };

  const saveHandler = () => {
    setChefs(editedChefs);
    setIsEdit(false);
    setSaveSuccess(true);
    
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const renderInput = (label: string, value: string, index: number, fieldKey: keyof Chef, placeholder: string = "") => (
    <div className="mb-4">
      <label className="mb-2.5 block font-medium text-black dark:text-white">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value || ""}
        disabled={!isEdit}
        onChange={(e) => handleChange(index, fieldKey, e.target.value)}
        className={`w-full rounded-lg border bg-transparent py-3 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:bg-form-input dark:text-white dark:focus:border-primary
          ${isEdit 
            ? "border-stroke dark:border-strokedark" 
            : "border-transparent px-0 pl-0 cursor-default"
          }`}
      />
    </div>
  );

  return (
    <>
      <PageMeta
        title="Zarządzanie Kucharzami | Panel Restauracji"
        description="Edytuj dane zespołu kucharzy."
      />

      {saveSuccess && (
        <div className="mb-4 p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          Zapisano zmiany (lokalnie)!
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
        
        {/* NAGŁÓWEK SEKCJI */}
        <div className="flex flex-row justify-between mb-6 items-center">
          <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Zespół (Chefs)
          </h3>
          
          <div className="flex gap-4">
            {isEdit ? (
              <>
                <button 
                  onClick={exitEditMode} 
                  className="hover:opacity-70 transition-opacity border border-blue-500 rounded-lg px-6 py-2 text-blue-500 font-bold"
                >
                  Anuluj
                </button>
                <button 
                  onClick={saveHandler} 
                  className="hover:opacity-70 transition-opacity border border-green-500 rounded-lg px-6 py-2 text-green-500 font-bold"
                >
                  Zapisz
                </button>
              </>
            ) : (
              <button 
                onClick={toggleEditMode} 
                className="hover:opacity-70 transition-opacity border border-blue-500 rounded-lg px-6 py-2 text-blue-500 font-bold"
              >
                Edytuj
              </button>
            )}
          </div>
        </div>

        {/* LISTA KUCHARZY */}
        <div className="space-y-10">
          {(isEdit ? editedChefs : chefs).map((chef, index) => (
            <div key={chef.id} className="border-b border-stroke pb-8 last:border-0 dark:border-strokedark">
              
              {/* TYTUŁ KARTY KUCHARZA */}
              <div className="mb-6 flex items-center justify-between bg-gray-50 dark:bg-meta-4 p-3 rounded-lg">
                <h4 className="text-lg font-bold text-black dark:text-white">
                  Kucharz {index + 1}: {chef.firstName} {chef.lastName}
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                {/* IMIĘ I NAZWISKO */}
                {renderInput("Imię", chef.firstName, index, "firstName", "Podaj imię")}
                {renderInput("Nazwisko", chef.lastName, index, "lastName", "Podaj nazwisko")}
                
                {/* SPECJALIZACJA */}
                <div className="md:col-span-2">
                   {renderInput("Specjalizacja", chef.specialization, index, "specialization", "np. Desery")}
                </div>

                {/* ZDJĘCIE URL + PODGLĄD */}
                <div className="md:col-span-2">
                   {renderInput("Link do zdjęcia (URL)", chef.photoUrl, index, "photoUrl", "https://...")}
                   
                   {/* Podgląd zdjęcia */}
                   {chef.photoUrl && (
                     <div className="mt-2 flex items-center gap-4">
                        <img 
                          src={chef.photoUrl} 
                          alt="Podgląd" 
                          className="h-24 w-24 rounded-full object-cover border-2 border-stroke dark:border-strokedark"
                          onError={(e) => (e.currentTarget.style.display = 'none')} // Ukryj jeśli link uszkodzony
                        />
                        <span className="text-sm text-gray-500">Podgląd zdjęcia profilowego</span>
                     </div>
                   )}
                </div>

                {/* SOCIAL MEDIA - 3 KOLUMNY */}
                <div className="md:col-span-2 mt-4">
                  <h5 className="mb-4 border-b border-stroke pb-2 text-sm font-medium text-gray-500 dark:border-strokedark dark:text-gray-400">
                    Media Społecznościowe
                  </h5>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {renderInput("Facebook", chef.facebookUrl, index, "facebookUrl", "Link do FB")}
                    {renderInput("Instagram", chef.instagramUrl, index, "instagramUrl", "Link do IG")}
                    {renderInput("Twitter (X)", chef.twitterUrl, index, "twitterUrl", "Link do X")}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}