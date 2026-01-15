import React, { useEffect, useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { ContactType } from "../../models/contact_type";
import contactTypeService from "../../services/contactTypeService";
import ImageUpload from "../form/input/ImageUpload";
import administratorService from "../../services/administratorService";

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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setFormData(editedType);
  }, [editedType]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const response = await administratorService.getLoggedInUser();
      if (response.success && response.data) {
        setCurrentUserId(response.data.id);
      }
    };
    if (isOpen) {
      fetchCurrentUser();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData?.icon_url) {
      setShowError(true);
      return;
    }

    setShowError(false);
    const response = editedType
      ? await contactTypeService.update({
          ...formData,
          last_modificator_id: currentUserId,
        })
      : await contactTypeService.add({
          ...formData,
          creator_id: currentUserId,
        });
    if (response.success) {
      closeModal();
      setFormData(null);
      setShowError(false);
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
        <div>
          <Label>
            Icon 
          </Label>
          <div className="mt-1">
            <ImageUpload
              key={formData?.icon_url || "new"}
              currentImage={formData?.icon_url}
              onImageUploaded={(url) => {
                setFormData({ ...formData, icon_url: url });
                setShowError(false);
              }}
            />
          </div>
          {showError && (
            <p className="text-xs text-red-500 mt-1">
              Please upload an icon
            </p>
          )}
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
