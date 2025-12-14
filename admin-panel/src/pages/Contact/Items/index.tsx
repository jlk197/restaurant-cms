import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../../components/common/PageMeta";
import { useApi } from "../../../hooks/useApi";
import { PlusIcon } from "../../../icons";
import Loader from "../../../components/Loader";
import { ContactItem } from "../../../models/contact_item";
import contactItemService from "../../../services/contactItemService";
import ContactItemItem from "../../../components/contact/contact_item_item";
import ContactItemAddModal from "../../../components/contact/contact_item_add_modal";

const ContactItemsPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editedItem, setEditedItem] = useState<ContactItem | null>(null);
  const [categoriedItem, setCategoriedItem] =
    useState<Map<string, ContactItem[]>>(null);
  const {
    data: items,
    isLoading,
    error,
    execute: fetchItems,
    setData: setItems,
  } = useApi<ContactItem[]>(
    useCallback(() => contactItemService.getAll(), []),
    "Cannot get configuration"
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (!items) return;

    const map = new Map<string, ContactItem[]>();

    items.forEach((item) => {
      const key = item.contact_type_value ?? "Unknown";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(item);
    });

    setCategoriedItem(map);
  }, [items]);

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditedItem(null);
  };

  const handleEdit = (item: ContactItem) => {
    setIsOpen(true);
    setEditedItem(item);
  };

  const handleDelete = async (item: ContactItem) => {
    await contactItemService.delete(item.id);
    fetchItems();
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
            Contact items
          </h3>

          <button
            onClick={openModal}
            className="hover:opacity-70 transition-opacity"
          >
            <PlusIcon className="w-10 h-10 fill-gray-800 dark:fill-white mr-2" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {categoriedItem &&
            Array.from(categoriedItem.entries()).map(([key, value]) => {
              const activeItems = value.filter((e) => e.is_active);
              const inactiveItems = value.filter((e) => !e.is_active);

              return (
                <div key={key}>
                  <h4 className="text-lg font-semibold text-blue-500">{key}</h4>
                  {activeItems.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-md">Active</h3>
                      <div className="flex grid-flow-row gap-2">
                        {activeItems.map((item) => (
                          <ContactItemItem
                            item={item}
                            handleDelete={() => handleDelete(item)}
                            handleEdit={() => handleEdit(item)}
                            key={item.id}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {inactiveItems.length > 0 && (
                    <div className="mb-2">
                      <h3 className="text-md">Inactive</h3>
                      <div className="flex grid-flow-row gap-2">
                        {inactiveItems.map((item) => (
                          <ContactItemItem
                            item={item}
                            handleDelete={() => handleDelete(item)}
                            handleEdit={() => handleEdit(item)}
                            key={item.id}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
      <ContactItemAddModal
        editedItem={editedItem}
        onSuccess={fetchItems}
        isOpen={isOpen}
        closeModal={closeModal}
      />
    </>
  );
};

export default ContactItemsPage;
