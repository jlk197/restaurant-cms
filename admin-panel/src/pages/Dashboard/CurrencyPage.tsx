import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Loader from "../../components/Loader";
import currencyService from "../../services/currencyService";
import CurrencyModal from "../../components/pages/CurrencyModal";
import { Currency } from "../../models/currency";

const TrashIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>);

export default function CurrencyPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCurrencies = async () => {
    setIsLoading(true);
    const res = await currencyService.getAll();
    if (res.success) setCurrencies(res.data);
    setIsLoading(false);
  };

  useEffect(() => { fetchCurrencies(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Usunąć walutę? Jeśli jest używana w menu, operacja się nie uda.")) return;
    await currencyService.delete(id);
    fetchCurrencies();
  };

  return (
    <>
      <PageMeta title="Zarządzanie Walutami" description="Dodaj waluty dostępne w menu" />
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Available currencies</h3>
          <button onClick={() => setIsModalOpen(true)} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Add currency
          </button>
        </div>

        {isLoading ? <Loader /> : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b dark:border-gray-700 text-gray-500 text-xs uppercase">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {currencies.map((c) => (
                <tr key={c.id} className="border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4">{c.id}</td>
                  <td className="py-3 px-4 font-bold">{c.code}</td>
                  <td className="py-3 px-4">{c.name}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><TrashIcon /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <CurrencyModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} onSuccess={fetchCurrencies} />
    </>
  );
}