import React, { useEffect, useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { User } from "../../models/user";
import administratorService from "../../services/administratorService";
import { SliderImage } from "../../models/slider_image";
import ImageUpload from "../form/input/ImageUpload";
import sliderImagesService from "../../services/sliderImagesService";

interface SliderAddModalProps {
  editedImage?: SliderImage;
  isOpen: boolean;
  closeModal: () => void;
  onSuccess?: () => void;
}

export default function SliderImagesAddModal({
  editedImage,
  isOpen,
  closeModal,
  onSuccess,
}: SliderAddModalProps) {
  const [formData, setFormData] = useState<Partial<SliderImage>>({
    image_url: "",
    is_active: false,
  });

  useEffect(() => {
    if (editedImage) {
      setFormData({
        image_url: editedImage.image_url ?? "",
        is_active: editedImage.is_active ?? false,
        ...editedImage,
      });
    } else {
      setFormData({
        image_url: "",
        is_active: false,
      });
    }
  }, [editedImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = editedImage
      ? await sliderImagesService.update(formData)
      : await sliderImagesService.add(formData);
    if (response.success) {
      closeModal();
      setFormData({ image_url: "", is_active: false });
      onSuccess?.();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6 mx-4">
      <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        {editedImage ? "Edit Slider Image" : "Add Slider Image"}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <ImageUpload
            currentImage={formData.image_url}
            onImageUploaded={(url) =>
              setFormData({ ...formData, image_url: url })
            }
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
