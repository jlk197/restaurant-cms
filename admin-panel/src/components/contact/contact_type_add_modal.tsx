import React, { useEffect, useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { ContactType } from "../../models/contact_type";
import contactTypeService from "../../services/contactTypeService";

interface ContactTypeModalProps {
  editedType?: ContactType;
  isOpen: boolean;
  closeModal: () => void;
  onSuccess?: () => void;
}

export default function ContactTypeAddModal({
  editedType,
  isOpen,
  closeModal,
  onSuccess,
}: ContactTypeModalProps) {
  const [formData, setFormData] = useState<ContactType>(editedType);

  useEffect(() => {
    setFormData(editedType);
  }, [editedType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = editedType
      ? await contactTypeService.update(formData)
      : await contactTypeService.add(formData);
    if (response.success) {
      closeModal();
      setFormData(null);
      onSuccess?.();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6 mx-4">
      <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        {editedType ? "Edit Contact Type" : "Add Contact Type"}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            type="text"
            placeholder="Enter name"
            value={formData?.value ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, value: e.target.value })
            }
            required
          />
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
