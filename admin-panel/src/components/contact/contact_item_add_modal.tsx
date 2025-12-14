import React, { useCallback, useEffect, useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { ContactItem } from "../../models/contact_item";
import contactItemService from "../../services/contactItemService";
import { useApi } from "../../hooks/useApi";
import { ContactType } from "../../models/contact_type";
import contactTypeService from "../../services/contactTypeService";

interface ContactItemModalProps {
  editedItem?: ContactItem;
  isOpen: boolean;
  closeModal: () => void;
  onSuccess?: () => void;
}

export default function ContactItemAddModal({
  editedItem,
  isOpen,
  closeModal,
  onSuccess,
}: ContactItemModalProps) {
  const [formData, setFormData] = useState<Partial<ContactItem>>({
    value: "",
    contact_type_id: null,
    is_active: false,
  });

  const {
    data: types,
    isLoading,
    error,
    execute: fetchTypes,
    setData: setTypes,
  } = useApi<ContactType[]>(
    useCallback(() => contactTypeService.getAll(), []),
    "Cannot get configuration"
  );

  useEffect(() => {
    if (editedItem) {
      setFormData({
        value: editedItem.value ?? "",
        contact_type_id: editedItem.contact_type_id ?? null,
        is_active: editedItem.is_active ?? false,
        ...editedItem,
      });
    } else {
      setFormData({
        value: "",
        contact_type_id: null,
        is_active: false,
      });
    }
    fetchTypes();
  }, [editedItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = editedItem
      ? await contactItemService.update(formData)
      : await contactItemService.add(formData);
    if (response.success) {
      closeModal();
      setFormData(null);
      onSuccess?.();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6 mx-4">
      <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        {editedItem ? "Edit Contact Item" : "Add Contact Item"}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Contact Type</Label>
          <select
            value={formData?.contact_type_id ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                contact_type_id: Number(e.target.value),
              })
            }
            className="w-full rounded border border-gray-300 p-2"
            required
          >
            <option value="" disabled>
              Select type
            </option>
            {types?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Value</Label>
          <Input
            type="text"
            placeholder="Enter value"
            value={formData?.value ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, value: e.target.value })
            }
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData?.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <Label htmlFor="isActive" className="mb-0">
            Active
          </Label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
