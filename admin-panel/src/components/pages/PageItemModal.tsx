import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import ImageUpload from "../form/input/ImageUpload";
import pageItemService from "../../services/pageItemService";
import { PageItemFormData } from "../../models/pageItem";

interface PageItemModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSuccess: () => void;
  itemToEdit?: any;
}

export default function PageItemModal({ isOpen, closeModal, onSuccess, itemToEdit }: PageItemModalProps) {
  const [formData, setFormData] = useState<PageItemFormData>({
    title: "",
    description: "",
    type: "text", // Domyślny typ
    image_url: "",
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setFormData({
            id: itemToEdit.id,
            title: itemToEdit.title || "",
            description: itemToEdit.description || "",
            type: itemToEdit.type || "text",
            image_url: itemToEdit.image_url || "",
            is_active: itemToEdit.is_active ?? true
        });
      } else {
        setFormData({ title: "", description: "", type: "text", image_url: "", is_active: true });
      }
      setError("");
    }
  }, [isOpen, itemToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let res;
      if (formData.id) {
        res = await pageItemService.updateSingle(formData.id, formData);
      } else {
        res = await pageItemService.create(formData);
      }

      if (res.success) {
        onSuccess();
        closeModal();
      } else {
        setError(res.error || "Save error");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-xl p-6">
      <h4 className="text-xl font-bold mb-6 dark:text-white">
        {formData.id ? "Edit section" : "Add section"}
      </h4>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
           <Label>Title</Label>
           <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label>Type</Label>
                <select 
                    className="w-full p-2 border rounded bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                    <option value="text">Text</option>
                    <option value="hero">Hero</option>
                    <option value="promo">Special offer</option>
                </select>
            </div>
            <div className="flex items-center pt-6">
                 <label className="flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        className="mr-2 w-5 h-5"
                    />
                    <span className="dark:text-white">IsActive</span>
                 </label>
            </div>
        </div>

        <div>
            <Label>Description</Label>
            <textarea 
                className="w-full p-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
        </div>

        <div>
             <Label>Image</Label>
             <div className="mt-1">
                <ImageUpload 
                    currentImage={formData.image_url}
                    onImageUploaded={(url) => setFormData(prev => ({...prev, image_url: url}))}
                />
             </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <Button variant="outline" onClick={closeModal} type="button">Cancel</Button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}