import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import ImageUpload from "../form/input/ImageUpload";
import pageService from "../../services/pageService";

interface PageContentItem {
  id: number;
  type: string;
  label: string;
}

interface PageFormData {
  id?: number;
  title: string;
  description: string;
  slug: string;
  header_image_url: string;
  contents: number[];
}

interface PageModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSuccess: () => void;
  pageToEdit?: any; // Obiekt strony z listy (ma title, slug, id)
}

export default function PageModal({
  isOpen,
  closeModal,
  onSuccess,
  pageToEdit,
}: PageModalProps) {
  
  // 1. ZMIANA: Inicjalizujemy stan OD RAZU danymi z propsa (jeśli istnieją).
  // Dzięki temu modal od razu wie, czy edytuje, bez czekania na useEffect.
  const [formData, setFormData] = useState<PageFormData>({
    id: pageToEdit?.id, // Jeśli edytujemy, ID jest ustawione natychmiast
    title: pageToEdit?.title || "",
    slug: pageToEdit?.slug || "",
    description: "", // To dociągniemy z bazy
    header_image_url: "", // To dociągniemy z bazy
    contents: [], // To dociągniemy z bazy
  });

  const [availableContent, setAvailableContent] = useState<PageContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 2. ZMIANA: useEffect uruchamia się raz przy montowaniu modala (dzięki []).
  useEffect(() => {
    const init = async () => {
      // Zawsze pobierz listę dostępnych opcji (Kucharze, Menu)
      await loadContentOptions();

      // Jeśli jesteśmy w trybie edycji, pobierz pełne szczegóły (opis, zdjęcie, zaznaczone checkboxy)
      if (pageToEdit?.id) {
        await fetchPageDetails(pageToEdit.id);
      }
    };

    init();
  }, []); // Pusta tablica zależności - wykonaj tylko raz po otwarciu

  const loadContentOptions = async () => {
    try {
      const res = await pageService.getAvailableContent();
      if (res.success) setAvailableContent(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPageDetails = async (id: number) => {
    setIsLoading(true);
    try {
      const res = await pageService.getById(id);
      
      // DIAGNOSTYKA ZDJĘCIA
      console.log("[MODAL] Pobrane dane strony:", res.data);
      console.log("[MODAL] URL zdjęcia z bazy:", res.data.header_image_url);

      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          id: res.data.id,
          title: res.data.title,
          description: res.data.description || "",
          slug: res.data.slug,
          
          // UPEWNIJ SIĘ, ŻE TA LINIJKA JEST DOKŁADNIE TAKA:
          // Jeśli pole jest nullem, wstaw pusty string "", inaczej ImageUpload zgłupieje
          header_image_url: res.data.header_image_url || "", 
          
          contents: res.data.contents ? res.data.contents.map((c: any) => c.id) : [],
        }));
      }
    } catch (err) {
      setError("Failed to load page details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let response;
      // 3. LOGIKA ZAPISU: Decyzja na podstawie formData.id
      if (formData.id) {
        console.log("Saving changes to Page ID:", formData.id);
        response = await pageService.update(formData.id, formData);
      } else {
        console.log("Creating new Page");
        response = await pageService.create(formData);
      }

      if (response.success) {
        onSuccess();
        closeModal();
      } else {
        setError(response.error || "Operation failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContent = (id: number) => {
    setFormData((prev) => {
      const exists = prev.contents.includes(id);
      return {
        ...prev,
        contents: exists
          ? prev.contents.filter((cid) => cid !== id)
          : [...prev.contents, id],
      };
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl p-6 mx-4">
      <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        {formData.id ? "Edit Page" : "Add New Page"}
      </h4>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Page Title</Label>
            <Input
              type="text"
              placeholder="e.g. About Us"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Slug (URL)</Label>
            <Input
              type="text"
              placeholder="e.g. about-us"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="mb-4">
            <Label>Header Image</Label>
            <div className="mt-1">
                <ImageUpload
            key={formData.header_image_url || "new"}
            currentImage={formData.header_image_url}
            onImageUploaded={(url) => setFormData(prev => ({ ...prev, header_image_url: url }))}
        />
            </div>
        </div>

        <div>
           <Label>Assign Content</Label>
           <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {availableContent.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-2">No content available.</p>
              ) : (
                  <div className="space-y-2">
                      {availableContent.map((item) => (
                          <div 
                            key={item.id} 
                            className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-gray-800 rounded transition cursor-pointer" 
                            onClick={() => toggleContent(item.id)}
                          >
                              <input 
                                  type="checkbox"
                                  checked={formData.contents.includes(item.id)}
                                  onChange={() => {}} // Obsłużone w onClick diva
                                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                              />
                              <div className="text-sm">
                                  <span className="font-medium text-gray-800 dark:text-gray-200">{item.label}</span>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
           </div>
        </div>

        <div className="flex gap-3 pt-4 justify-end border-t border-gray-100 dark:border-gray-800 mt-4">
          <Button variant="outline" onClick={closeModal} type="button">
            Cancel
          </Button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium bg-blue-600 text-white shadow-theme-xs hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isLoading ? "Saving..." : (formData.id ? "Save Changes" : "Create Page")}
          </button>
        </div>
      </form>
    </Modal>
  );
}