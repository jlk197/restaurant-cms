import { useRef } from "react";
import AdminsTable, {
  AdminsTableRef,
} from "../../components/admins/admins_table";
import PageMeta from "../../components/common/PageMeta";
import { PlusIcon } from "../../icons";
import { useModal } from "../../hooks/useModal";
import AdminAddModal from "../../components/admins/admin_add_modal";

export default function UserProfiles() {
  const { isOpen, openModal, closeModal } = useModal();
  const tableRef = useRef<AdminsTableRef>(null);

  const handleAdminAdded = () => {
    tableRef.current?.refresh();
  };

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:p-6">
        <div className="flex flex-row justify-between">
          <h3 className="mb-5 text-2xl font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Administrators
          </h3>
          <button
            onClick={openModal}
            className="hover:opacity-70 transition-opacity"
          >
            <PlusIcon className="w-10 h-10 fill-gray-800 dark:fill-white mr-2" />
          </button>
        </div>
        <div className="space-y-6">
          <AdminsTable ref={tableRef} />
        </div>
      </div>
      <AdminAddModal
        isOpen={isOpen}
        closeModal={closeModal}
        onSuccess={handleAdminAdded}
      />
    </>
  );
}
