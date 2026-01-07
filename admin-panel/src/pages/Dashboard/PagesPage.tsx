import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/Loader";
import pageService from "../../services/pageService";
import PageModal from "../../components/pages/PageModal";

// Prosta ikona ołówka (SVG)
const PencilIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="w-5 h-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

interface Page {
  id: number;
  title: string;
  slug: string;
  contentPreviews?: string[];
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageToEdit, setPageToEdit] = useState<Page | undefined>(undefined);

const fetchPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await pageService.getAll();
      if (res.success) {
        // --- DIAGNOSTYKA ---
        console.log("DANE Z SERWERA (Tabela):", res.data);
        if (res.data.length > 0) {
           console.log("Przykładowy rekord 0:", res.data[0]);
           console.log("Czy ma contentPreviews?", res.data[0].contentPreviews);
        }
        // -------------------
        setPages(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleCreate = () => {
    setPageToEdit(undefined); 
    setIsModalOpen(true);
  };

  const handleEdit = (page: Page) => {
    setPageToEdit(page); // Przekazujemy obiekt do edycji
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this page? This cannot be undone.")) {
      return;
    }

    try {
      const res = await pageService.delete(id);
      if (res.success) {
        // Odśwież listę po udanym usunięciu
        fetchPages(); 
      } else {
        alert("Failed to delete page: " + res.error);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting.");
    }
  };

  if (isLoading && !pages.length) return <Loader />;

 return (
    <>
      <PageMeta title="Pages Management" description="Create and manage website pages" />
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        {/* ... cała sekcja tabeli bez zmian ... */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Your Pages</h3>
          <button 
            onClick={handleCreate} 
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            + Add New Page
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-700 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-2">Title</th>
                <th className="py-4 px-2">Slug</th>
                <th className="py-4 px-2">Page Content</th>
                <th className="py-4 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id} className="border-b last:border-0 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <td className="py-4 px-2 font-medium text-gray-900 dark:text-white">{page.title}</td>
                  <td className="py-4 px-2 text-blue-500 text-sm">/{page.slug}</td>
                  <td className="py-4 px-2">
                    <div className="flex flex-wrap gap-1.5">
                      {page.contentPreviews && page.contentPreviews.length > 0 ? (
                        page.contentPreviews.map((preview, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                            {preview}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">Empty page</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button 
                      onClick={() => handleEdit(page)} 
                      title="Edit Page"
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                    >
                      <PencilIcon />
                    </button>
                    <button 
                          onClick={() => handleDelete(page.id)} 
                          title="Delete Page"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        >
                          <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPRAWKA TUTAJ: Warunkowe renderowanie */}
      {isModalOpen && (
        <PageModal 
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          onSuccess={fetchPages}
          pageToEdit={pageToEdit}
        />
      )}
    </>
  );
}