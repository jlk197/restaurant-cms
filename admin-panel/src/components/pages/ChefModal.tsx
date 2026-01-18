import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import ImageUpload from "../form/input/ImageUpload";
import chefService from "../../services/chefService";

interface Chef {
  id?: number;
  name: string;
  surname: string;
  specialization: string;
  facebook_link: string;
  instagram_link: string;
  twitter_link: string;
  image_url: string;
  position: number;
  is_active: boolean;
  is_visible_in_menu: boolean; // NOWE POLE
}

interface ChefModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSuccess: () => void;
  chefToEdit?: Chef;
}

export default function ChefModal({
  isOpen,
  closeModal,
  onSuccess,
  chefToEdit,
}: ChefModalProps) {
  const [formData, setFormData] = useState<Chef>({
    name: "",
    surname: "",
    specialization: "",
    facebook_link: "",
    instagram_link: "",
    twitter_link: "",
    image_url: "",
    position: 0,
    is_active: true,
    is_visible_in_menu: false, // Domyślnie false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (chefToEdit) {
        setFormData({
            id: chefToEdit.id,
            name: chefToEdit.name || "",
            surname: chefToEdit.surname || "",
            specialization: chefToEdit.specialization || "",
            facebook_link: chefToEdit.facebook_link || "",
            instagram_link: chefToEdit.instagram_link || "",
            twitter_link: chefToEdit.twitter_link || "",
            image_url: chefToEdit.image_url || "",
            position: chefToEdit.position !== undefined ? chefToEdit.position : 0,
            is_active: chefToEdit.is_active !== undefined ? chefToEdit.is_active : true,
            // Obsługa nowego pola przy edycji
            is_visible_in_menu: chefToEdit.is_visible_in_menu !== undefined ? chefToEdit.is_visible_in_menu : false,
        });
      } else {
        // Reset formularza
        setFormData({
          name: "",
          surname: "",
          specialization: "",
          facebook_link: "",
          instagram_link: "",
          twitter_link: "",
          image_url: "",
          position: 0,
          is_active: true,
          is_visible_in_menu: false,
        });
      }
      setError("");
    }
  }, [isOpen, chefToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let response;
      if (formData.id) {
        response = await chefService.updateSingle(formData.id, formData);
      } else {
        response = await chefService.create(formData);
      }

      if (response.success) {
        onSuccess();
        closeModal();
      } else {
        setError(response.error || "Operation failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto">
      <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        {formData.id ? "Edit Chef" : "Add New Chef"}
      </h4>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>First Name</Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              type="text"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label>Specialization</Label>
          <Input
            type="text"
            placeholder="e.g. Head Chef, Pizza Master"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          />
        </div>

        {/* --- NOWA SEKCJA STATUSÓW --- */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Pozycja */}
                <div>
                    <Label>Position (Order)</Label>
                    <Input
                        type="number"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
                        placeholder="0"
                        className="bg-white"
                    />
                </div>

                {/* 2. Checkboxy Statusów */}
                <div className="flex flex-col gap-3 justify-center">
                    {/* Global Active */}
                    <label className="flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                        checked={formData.is_active}
                        onChange={(e) => {
                            const newActiveState = e.target.checked;
                              setFormData(prev => ({
                                ...prev,
                                is_active: newActiveState,
                                is_visible_in_menu: newActiveState ? prev.is_visible_in_menu : false
                              }));
                          }}
                      />
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">Is Active</span>
                            <span className="block text-xs text-gray-400">Available in system</span>
                        </div>
                    </label>

                    {/* Home Page Promo */}
                    <label className="flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        checked={formData.is_visible_in_menu}
                        disabled={!formData.is_active} 
                        onChange={(e) => setFormData({...formData, is_visible_in_menu: e.target.checked})}
                      />
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-700 dark:text-gray-200">Promote on Home Page</span>
                            <span className="block text-xs text-gray-400">Visible on Home Page</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <div className="mb-4">
            <Label>Profile Photo</Label>
            <div className="mt-1">
                <ImageUpload
                    key={formData.image_url || "new"}
                    currentImage={formData.image_url}
                    onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                />
            </div>
        </div>

        <div className="pt-2">
            <h5 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Social Media</h5>
            <div className="space-y-3">
                <Input
                    placeholder="Facebook URL"
                    value={formData.facebook_link}
                    onChange={(e) => setFormData({ ...formData, facebook_link: e.target.value })}
                />
                <Input
                    placeholder="Instagram URL"
                    value={formData.instagram_link}
                    onChange={(e) => setFormData({ ...formData, instagram_link: e.target.value })}
                />
                <Input
                    placeholder="Twitter/X URL"
                    value={formData.twitter_link}
                    onChange={(e) => setFormData({ ...formData, twitter_link: e.target.value })}
                />
            </div>
        </div>

        <div className="flex gap-3 pt-4 justify-end border-t border-gray-100 dark:border-gray-800 mt-4">
          <Button variant="outline" onClick={closeModal} type="button">
            Cancel
          </Button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium bg-blue-600 text-white shadow-theme-xs hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isLoading ? "Saving..." : (formData.id ? "Save Changes" : "Create Chef")}
          </button>
        </div>
      </form>
    </Modal>
  );
}