import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/Loader";
import pageItemService from "../../services/pageItemService";
import PageItemModal from "../../components/pages/PageItemModal";
import { PageItem } from "../../models/pageItem";

const EditIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);
const TrashIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);

export default function PageItemPage() {
  const [items, setItems] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<PageItem | undefined>(undefined);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    const res = await pageItemService.getAll();
    if (res.success) {
        // Sortowanie po pozycji
        const sorted = res.data.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
        setItems(sorted);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    await pageItemService.delete(id);
    fetchItems();
  };

  const getTypeBadgeColor = (type: string) => {
      switch(type) {
          case 'hero': return 'bg-blue-100 text-blue-800';
          case 'promo': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  return (
    <>
      <PageMeta title="Content managment" description="Text and banner sections" />
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">All items</h3>
          <button onClick={() => { setItemToEdit(undefined); setIsModalOpen(true); }} className="px-5 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 shadow-sm">
            + Add Item
          </button>
        </div>

        {isLoading ? <Loader /> : (
            <div className="space-y-4">
            {items.map(item => (
                <div key={item.id} className="relative flex flex-col md:flex-row border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition">
                    
                    {/* POSITION BADGE */}
                    <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                        #{item.position || 0}
                    </div>

                    {/* Lewa strona: Zdjęcie */}
                    <div className="w-full md:w-48 h-32 md:h-auto bg-gray-200 flex-shrink-0 relative">
                        {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-xs text-gray-400">No IMG</div>
                        )}
                        {/* USUNIĘTO: Overlay "Ukryty" */}
                    </div>

                    {/* Prawa strona: Treść */}
                    <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-lg dark:text-white">{item.title}</h4>
                                <div className="flex items-center gap-2">
                                    {/* STATUS INDICATOR */}
                                    <div className="flex items-center">
                                        <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${item.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {item.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </div>

                                    {/* TYPE BADGE */}
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getTypeBadgeColor(item.type)}`}>
                                        {item.type}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                                {item.description}
                            </p>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-4 border-t pt-3 dark:border-gray-700">
                            <button onClick={() => { setItemToEdit(item); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium">
                                <EditIcon /> Edit
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium">
                                <TrashIcon /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>

      {isModalOpen && (
        <PageItemModal 
            isOpen={isModalOpen} 
            closeModal={() => setIsModalOpen(false)} 
            onSuccess={fetchItems} 
            itemToEdit={itemToEdit} 
        />
      )}
    </>
  );
}