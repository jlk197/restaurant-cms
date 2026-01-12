import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/Loader";
import menuService from "../../services/menuService";
import MenuModal from "../../components/pages/MenuModal";
import { MenuItem } from "../../models/menu";

// Proste ikony
const PencilIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>);
const TrashIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(undefined);

  const fetchMenu = useCallback(async () => {
    setIsLoading(true);
    const res = await menuService.getAll();
    if (res.success) {
        // Opcjonalnie: sortowanie po pozycji na froncie, jeśli backend tego nie robi
        const sortedItems = res.data.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
        setMenuItems(sortedItems);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const handleDelete = async (id: number) => {
    if(!window.confirm("Delete this dish?")) return;
    await menuService.delete(id);
    fetchMenu();
  };

  return (
    <>
      <PageMeta title="Menu Management" description="Restaurant Menu" />
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Our Menu</h3>
          <button onClick={() => { setItemToEdit(undefined); setIsModalOpen(true); }} className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-sm">
            + Add New Dish
          </button>
        </div>

        {isLoading ? <Loader /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
                <div 
                    key={item.id} 
                    // USUNIĘTO: warunkowe dodawanie klas 'opacity-60 grayscale-[0.5]'
                    className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition bg-gray-50 dark:bg-gray-800/50"
                >
                    <div className="h-48 bg-gray-200 w-full overflow-hidden relative">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No Photo</div>
                        )}
                        
                        {/* CENA */}
                        <span className="absolute top-2 right-2 bg-white dark:bg-gray-900 px-3 py-1 rounded-full text-sm font-bold text-green-600 shadow-sm">
                            {item.price} {item.currency_code || 'PLN'}
                        </span>

                        {/* POZYCJA (ORDER) */}
                        <span className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-mono">
                            #{item.position || 0}
                        </span>

                        {/* USUNIĘTO: blok wyświetlający baner "HIDDEN" */}
                    </div>
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-lg dark:text-white truncate pr-2">{item.name}</h4>
                            
                            {/* NOWE: Wskaźnik isActive (kropka + tekst) */}
                            <div className="flex items-center ml-2 whitespace-nowrap flex-shrink-0">
                                <span className={`inline-block w-3 h-3 rounded-full mr-1 ${item.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {item.is_active ? 'Active' : 'Hidden'}
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{item.description}</p>
                        <div className="flex justify-end gap-2 border-t pt-3 dark:border-gray-700">
                            <button onClick={() => { setItemToEdit(item); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><PencilIcon /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><TrashIcon /></button>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>

      {isModalOpen && (
        <MenuModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} onSuccess={fetchMenu} itemToEdit={itemToEdit} />
      )}
    </>
  );
}