import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { MasterContentItem }  from "../../models/content"
import contentService from "../../services/contentService";

interface ContentSettingsModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSuccess: () => void;
  item: MasterContentItem;
}

export default function ContentSettingsModal({ isOpen, closeModal, onSuccess, item }: ContentSettingsModalProps) {
  const [position, setPosition] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setPosition(item.position || 0);
      setIsActive(item.is_active);
    }
  }, [item]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await contentService.updateSettings(item.id, position, isActive);
    setIsLoading(false);
    if (res.success) {
      onSuccess();
      closeModal();
    } else {
      alert("Błąd: " + res.error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-sm p-6">
      <h4 className="text-xl font-bold mb-4 dark:text-white">Element settings</h4>
      <p className="text-sm text-gray-500 mb-6">Editing: <span className="font-bold text-gray-800 dark:text-gray-200">{item.display_name}</span></p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <Label>Type</Label>
          <input disabled value={item.item_type} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 dark:text-gray-400 text-sm" />
        </div>

        <div>
          <Label>Position</Label>
          <Input 
            type="number" 
            value={position} 
            onChange={(e) => setPosition(parseInt(e.target.value) || 0)} 
          />
          <p className="text-xs text-gray-400 mt-1">The lower the number, the higher up on the list.</p>
        </div>

        <div className="flex items-center pt-2">
           <label className="flex items-center cursor-pointer">
              <input 
                  type="checkbox" 
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mr-3 w-5 h-5 accent-blue-600"
              />
              <span className="dark:text-white font-medium">Is Active</span>
           </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700 mt-4">
          <Button variant="outline" onClick={closeModal} type="button">Cancel</Button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {isLoading ? "Zapisywanie..." : "Zapisz"}
          </button>
        </div>
      </form>
    </Modal>
  );
}