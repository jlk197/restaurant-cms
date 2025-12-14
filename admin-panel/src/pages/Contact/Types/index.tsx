import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../../components/common/PageMeta";
import { useApi } from "../../../hooks/useApi";
import { PlusIcon } from "../../../icons";
import { ContactType } from "../../../models/contact_type";
import contactTypeService from "../../../services/contactTypeService";
import ContactTypeAddModal from "../../../components/contact/contact_type_add_modal";
import ContactTypeItem from "../../../components/contact/contact_type_item";
import Loader from "../../../components/Loader";

const ContactTypesPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editedType, setEditedType] = useState<ContactType | null>(null);
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
    fetchTypes();
  }, [fetchTypes]);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditedType(null);
  };

  const handleEdit = (type: ContactType) => {
    setIsOpen(true);
    setEditedType(type);
  };

  const handleDelete = async (type: ContactType) => {
    await contactTypeService.delete(type.id);
    fetchTypes();
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      {error && (
        <div className="mb-4 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
        <div className="flex flex-row justify-between">
          <h3 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Contact types
          </h3>

          <button
            onClick={openModal}
            className="hover:opacity-70 transition-opacity"
          >
            <PlusIcon className="w-10 h-10 fill-gray-800 dark:fill-white mr-2" />
          </button>
        </div>
        <div className="flex grid-flow-row gap-2">
          {types?.map((type) => (
            <ContactTypeItem
              type={type}
              handleDelete={() => handleDelete(type)}
              handleEdit={() => {
                handleEdit(type);
              }}
              key={type.id}
            />
          ))}
        </div>
      </div>
      <ContactTypeAddModal
        editedType={editedType}
        onSuccess={fetchTypes}
        isOpen={isOpen}
        closeModal={closeModal}
      />
    </>
  );
};

export default ContactTypesPage;
