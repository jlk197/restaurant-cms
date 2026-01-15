import { useState, useEffect, useRef } from "react";
import { ContactType } from "../../models/contact_type";

interface ContactTypeItemProps {
  type: ContactType;
  handleEdit: () => void;
  handleDelete: () => void;
}

export default function ContactTypeItem({
  type,
  handleEdit,
  handleDelete,
}: ContactTypeItemProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Zamknięcie menu po kliknięciu poza element
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setMenuVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-max" ref={wrapperRef}>
      <div
        className="rounded border border-blue-500 p-2 cursor-pointer dark:text-white text-black hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        onClick={() => setMenuVisible((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          {type.icon_url ? (
            <img
              src={type.icon_url}
              alt={type.value}
              className="w-5 h-5 object-contain"
            />
          ) : (
            <div className="w-5 h-5 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
              <span className="text-xs text-gray-500 dark:text-gray-400">?</span>
            </div>
          )}
          <span>{type.value}</span>
        </div>
      </div>

      {menuVisible && (
        <div className="absolute left-0 top-full mt-1 flex flex-col bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-md z-10">
          <button
            className="px-2 py-1 text-blue-500 hover:text-blue-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-left w-full"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 text-red-500 hover:text-red-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-left w-full"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
