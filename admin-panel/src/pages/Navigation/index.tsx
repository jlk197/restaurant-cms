import { useRef, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PlusIcon } from "../../icons";
import { useModal } from "../../hooks/useModal";
import NavigationAddModal from "../../components/navigation/navigation_add_modal";
import NavigationTable, {
  NavigationTableRef,
} from "../../components/navigation/navigation_table";
import { Navigation as NavigationType } from "../../models/navigation";

export default function Navigation() {
  const { isOpen, openModal, closeModal } = useModal();
  const tableRef = useRef<NavigationTableRef>(null);
  const [editedNavigation, setEditedNavigation] =
    useState<NavigationType | null>(null);

  const handleNavigationAdded = () => {
    tableRef.current?.refresh();
  };

  const handleEdit = (navigation: NavigationType) => {
    setEditedNavigation(navigation);
    openModal();
  };

  const handleCloseModal = () => {
    closeModal();
    setEditedNavigation(null);
  };

  return (
    <>
      <PageMeta
        title="Navigation Management | Admin Panel"
        description="Manage navigation items for the website"
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
        <div className="flex flex-row justify-between">
          <h3 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Navigation
          </h3>
          <button
            onClick={openModal}
            className="hover:opacity-70 transition-opacity"
          >
            <PlusIcon className="w-10 h-10 fill-gray-800 dark:fill-white mr-2" />
          </button>
        </div>
        <div className="space-y-6">
          <NavigationTable ref={tableRef} onEdit={handleEdit} />
        </div>
      </div>
      <NavigationAddModal
        editedNavigation={editedNavigation}
        isOpen={isOpen}
        closeModal={handleCloseModal}
        onSuccess={handleNavigationAdded}
      />
    </>
  );
}
