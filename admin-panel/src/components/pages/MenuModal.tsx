import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import ImageUpload from "../form/input/ImageUpload";
import MenuService from "../../services/menuService";
import { MenuItemFormData } from "../../models/menu";
import { Currency } from "../../models/currency";
import currencyService from "../../services/currencyService"

// Definicja typów lokalnie (lub import z modelu)
interface MenuItem {
  id?: number;
  name: string;
  description: string;
  price: string | number;
  currency_id?: number;
  image_url: string;
  position: number;    // NOWE POLE
  is_active: boolean;  // NOWE POLE
}

interface MenuModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSuccess: () => void;
  itemToEdit?: MenuItem;
}

export default function MenuModal({ isOpen, closeModal, onSuccess, itemToEdit }: MenuModalProps) {
  // Rozszerzony stan formularza
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: "",
    description: "",
    price: "",
    currency_id: 1,
    image_url: "",
    position: 0,      // Default 0
    is_active: true,  // Default true
  });

  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrenciesData = async () => {
        const res = await currencyService.getAll();
        if (res.success) {
            setCurrencies(res.data);
            if (!itemToEdit && res.data.length > 0) {
                setFormData(prev => ({ ...prev, currency_id: res.data[0].id }));
            }
        }
    };

    if (isOpen) {
      fetchCurrenciesData();
      if (itemToEdit) {
        // Mapowanie istniejącego obiektu do formularza
        setFormData({
            id: itemToEdit.id,
            name: itemToEdit.name || "",
            description: itemToEdit.description || "",
            price: itemToEdit.price || "",
            currency_id: itemToEdit.currency_id || 1,
            image_url: itemToEdit.image_url || "",
            position: itemToEdit.position !== undefined ? itemToEdit.position : 0,
            is_active: itemToEdit.is_active !== undefined ? itemToEdit.is_active : true,
        });
      } else {
        // Reset formularza
        setFormData({ 
            name: "", 
            description: "", 
            price: "", 
            currency_id: 1, 
            image_url: "", 
            position: 0, 
            is_active: true 
        });
      }
      setError("");
    }
  }, [isOpen, itemToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let response;
      if (formData.id) {
        response = await MenuService.updateSingle(formData.id, formData);
      } else {
        response = await MenuService.create(formData);
      }

      if (response.success) {
        onSuccess();
        closeModal();
      } else {
        setError(response.error || "Operation failed");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-xl p-6">
      <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
        {formData.id ? "Edit Dish" : "Add New Dish"}
      </h4>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Wiersz 1: Nazwa */}
        <div>
           <Label>Dish Name</Label>
           <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        </div>

        {/* Wiersz 2: Opis */}
        <div>
            <Label>Description</Label>
            <textarea 
                className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
        </div>

        {/* Wiersz 3: Cena, Waluta, Pozycja */}
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
                <Label>Price & Currency</Label>
                <div className="flex gap-2">
                    <Input 
                        type="number" 
                        step={0.01}
                        value={formData.price} 
                        onChange={(e) => setFormData({...formData, price: e.target.value})} 
                        required 
                        className="flex-grow"
                        placeholder="0.00"
                    />
                    <select
                        className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-24"
                        value={formData.currency_id}
                        onChange={(e) => setFormData({...formData, currency_id: Number(e.target.value)})}
                    >
                        {currencies.map(curr => (
                            <option key={curr.id} value={curr.id}>{curr.code}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* NOWE POLE: POSITION */}
            <div className="col-span-1">
                <Label>Position (Order)</Label>
                <Input 
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: Number(e.target.value)})}
                    placeholder="0"
                />
            </div>
        </div>

        {/* Wiersz 4: Zdjęcie i Status */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                 <Label>Dish Photo</Label>
                 <div className="mt-1">
                    <ImageUpload 
                        key={formData.image_url || 'new'}
                        currentImage={formData.image_url}
                        onImageUploaded={(url) => setFormData(prev => ({...prev, image_url: url}))}
                    />
                 </div>
            </div>
            
            {/* NOWE POLE: IS ACTIVE */}
            <div className="flex flex-col justify-center">
                <Label>Status</Label>
                <label className="flex items-center cursor-pointer mt-2 p-3 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <input 
                        type="checkbox" 
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <span className="ml-3 font-medium text-gray-700 dark:text-gray-200">
                        {formData.is_active ? "Visible on Menu" : "Hidden"}
                    </span>
                </label>
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="outline" onClick={closeModal} type="button">Cancel</Button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {isLoading ? "Saving..." : "Save Dish"}
          </button>
        </div>
      </form>
    </Modal>
  );
}