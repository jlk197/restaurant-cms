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

interface MenuItem {
  id?: number;
  name: string;
  description: string;
  price: string | number;
  currency_id?: number;
  image_url: string;
}

interface MenuModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSuccess: () => void;
  itemToEdit?: MenuItem;
}

export default function MenuModal({ isOpen, closeModal, onSuccess, itemToEdit }: MenuModalProps) {
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: "",
    description: "",
    price: "",
    currency_id: 1,
    image_url: "",
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
        setFormData({
            id: itemToEdit.id,
            name: itemToEdit.name || "",
            description: itemToEdit.description || "",
            price: itemToEdit.price || "",
            currency_id: itemToEdit.currency_id || 1,
            image_url: itemToEdit.image_url || ""
        });
      } else {
        setFormData({ name: "", description: "", price: "", currency_id: 1, image_url: "" });
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
        <div>
           <Label>Dish Name</Label>
           <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
        </div>

        <div>
            <Label>Description</Label>
            <textarea 
                className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            {/* CENA I WALUTA OBOK SIEBIE */}
            <div className="col-span-1">
                <Label>Price</Label>
                <div className="flex gap-2">
                    <Input 
                        type="number" 
                        step={0.01}
                        value={formData.price} 
                        onChange={(e) => setFormData({...formData, price: e.target.value})} 
                        required 
                        className="flex-grow"
                    />
                    {/* SELECT DO WYBORU WALUTY */}
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