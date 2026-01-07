import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/Loader";
import contentService from "../../services/contentService";
import { MasterContentItem }  from "../../models/content"
import PageContentModal from "../../components/content/PageContentModal";

// Ikony
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);

export default function ContentPage() {
  const [items, setItems] = useState<MasterContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Stan modala ustawień
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MasterContentItem | null>(null);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    const res = await contentService.getAll();
    if (res.success) setItems(res.data);
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const openSettings = (item: MasterContentItem) => {
    setSelectedItem(item);
    setIsSettingsOpen(true);
  };

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'chef_item': return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">Chef</span>;
      case 'menu_item': return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">Dish</span>;
      case 'page_item': return <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">Section</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">Other</span>;
    }
  };

  return (
    <>
      <PageMeta title="Zarządzanie Treścią (Master)" description="Przegląd i organizacja całej zawartości strony" />

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Site Content</h3>
            <button onClick={fetchContent} className="text-sm text-blue-600 hover:underline">Refresh list</button>
        </div>

        {isLoading ? <Loader /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 border-b dark:border-gray-700 text-xs uppercase bg-gray-50 dark:bg-gray-800">
                  <th className="py-3 px-4">Pos.</th>
                  <th className="py-3 px-4">Image</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Name / Title</th>
                  <th className="py-3 px-4">Information</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    {/* Pozycja */}
                    <td className="py-3 px-4 font-mono font-bold text-gray-500">
                      {item.position}
                    </td>

                    {/* Obrazek */}
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded overflow-hidden bg-gray-200 border dark:border-gray-700">
                         {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">None</div>
                         )}
                      </div>
                    </td>

                    {/* Typ */}
                    <td className="py-3 px-4">{getTypeBadge(item.item_type)}</td>

                    {/* Nazwa */}
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {item.display_name || "---"}
                    </td>

                    {/* Info Label */}
                    <td className="py-3 px-4 text-gray-500 truncate max-w-[150px]">
                      {item.info_label}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {item.is_active ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-green-600"></span> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-red-400"></span> Inactive
                        </span>
                      )}
                    </td>

                    {/* Akcje */}
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => openSettings(item)}
                        className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        title="Zmień pozycję / status"
                      >
                        <SettingsIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isSettingsOpen && selectedItem && (
        <PageContentModal 
          isOpen={isSettingsOpen}
          closeModal={() => setIsSettingsOpen(false)}
          onSuccess={fetchContent}
          item={selectedItem}
        />
      )}
    </>
  );
}