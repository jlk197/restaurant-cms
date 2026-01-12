import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/Loader";
import chefService from "../../services/chefService";
import ChefModal from "../../components/pages/ChefModal";

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

interface Chef {
  id: number;
  name: string;
  surname: string;
  specialization: string;
  facebook_link: string;
  instagram_link: string;
  twitter_link: string;
  image_url: string;
  position: number;    // New field
  is_active: boolean;  // New field
}

export default function ChefPage() {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chefToEdit, setChefToEdit] = useState<Chef | undefined>(undefined);

  const fetchChefs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await chefService.getAll();
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        // Sortowanie po pozycji
        const sortedData = data.sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
        setChefs(sortedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChefs();
  }, [fetchChefs]);

  const handleCreate = () => {
    setChefToEdit(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (chef: Chef) => {
    setChefToEdit(chef);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm("Are you sure you want to remove this chef?")) return;
    try {
        await chefService.delete(id); 
        fetchChefs();
    } catch (error) {
        console.error("Delete failed", error);
        alert("Failed to delete chef");
    }
  };

  if (isLoading && !chefs.length) return <Loader />;

  return (
    <>
      <PageMeta title="Chef Management" description="Manage your team" />

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Chef Team</h3>
          <button 
            onClick={handleCreate} 
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            + Add New Chef
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {chefs.map((chef) => (
            <div key={chef.id} className="relative flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
              
              {/* POSITION BADGE (Top Left) */}
              <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded font-mono z-10">
                #{chef.position || 0}
              </div>

              {/* PHOTO */}
              <div className="flex-shrink-0 mt-3"> {/* Added mt-3 to give space for badge */}
                {chef.image_url ? (
                  <img 
                    src={chef.image_url} 
                    alt={chef.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-grow min-w-0 mt-1">
                <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    {chef.name} {chef.surname}
                    </h4>
                </div>

                {/* ACTIVE / HIDDEN INDICATOR */}
                <div className="flex items-center mb-1">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${chef.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {chef.is_active ? 'Active' : 'Hidden'}
                    </span>
                </div>

                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 truncate">
                  {chef.specialization || "No specialization"}
                </p>
                
                <div className="flex gap-2 text-xs text-gray-400">
                    {chef.facebook_link && <span title="Facebook">FB</span>}
                    {chef.instagram_link && <span title="Instagram">IG</span>}
                    {chef.twitter_link && <span title="Twitter">TW</span>}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-3">
                <button 
                  onClick={() => handleEdit(chef)} 
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                  title="Edit"
                >
                  <PencilIcon />
                </button>
                <button 
                   onClick={() => handleDelete(chef.id)}
                   className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                   title="Delete"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}

          {chefs.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <p>No chefs found.</p>
              <button onClick={handleCreate} className="mt-2 text-blue-600 hover:underline">Add your first chef</button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ChefModal
            isOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
            onSuccess={fetchChefs}
            chefToEdit={chefToEdit}
        />
      )}
    </>
  );
}