import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import currencyService from "../../services/currencyService";

interface CurrencyModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSuccess: () => void;
}

export default function CurrencyModal({ isOpen, closeModal, onSuccess }: CurrencyModalProps) {
  const [formData, setFormData] = useState({ code: "", name: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await currencyService.create(formData);
    setIsLoading(false);
    
    if (res.success) {
      setFormData({ code: "", name: "" }); // Reset
      onSuccess();
      closeModal();
    } else {
      alert("Błąd: " + res.error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6">
      <h4 className="text-xl font-bold mb-4 dark:text-white">Add currency</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Currency code (e.g. PLN, EUR)</Label>
          <Input 
            value={formData.code} 
            onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
            //maxLength={3}
            placeholder="PLN"
            required 
          />
        </div>
        <div>
          <Label>Full name</Label>
          <Input 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            placeholder="Polski Złoty"
            required 
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={closeModal} type="button">Cancel</Button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}