import React, { useState } from "react";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import { User } from "../../models/user";
import administratorService from "../../services/administratorService";

interface AdminAddModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSuccess?: () => void;
}

export default function AdminAddModal({
  isOpen,
  closeModal,
  onSuccess,
}: AdminAddModalProps) {
  const [formData, setFormData] = useState<Omit<User, "id">>({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await administratorService.add(formData);
    if (response.success) {
      closeModal();
      setFormData({ name: "", surname: "", email: "", password: "" });
      onSuccess?.();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} className="max-w-md p-6 mx-4">
      <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Add Administrator
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input
            type="text"
            placeholder="Enter name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Surname</Label>
          <Input
            type="text"
            placeholder="Enter surname"
            value={formData.surname}
            onChange={(e) =>
              setFormData({ ...formData, surname: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            minLength={8}
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
            title="Min. 8 znaków, mała i duża litera, cyfra oraz znak specjalny (@$!%*?&)"
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
            Add
          </button>
        </div>
      </form>
    </Modal>
  );
}
