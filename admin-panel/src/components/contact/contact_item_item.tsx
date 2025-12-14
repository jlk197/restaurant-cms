import { useState, useEffect, useRef } from "react";
import { ContactItem } from "../../models/contact_item";

interface ContactItemItemProps {
  item: ContactItem;
  handleEdit: () => void;
  handleDelete: () => void;
}

export default function ContactItemItem({
  item,
  handleEdit,
  handleDelete,
}: ContactItemItemProps) {
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
      {/* Kliknij, aby otworzyć menu */}
      <div
        className="rounded border border-blue-500 p-2 cursor-pointer dark:text-white text-black"
        onClick={() => setMenuVisible((prev) => !prev)}
      >
        {item.value}
      </div>

      {/* Menu absolutne */}
      {menuVisible && (
        <div className="absolute left-0 top-full mt-1 flex flex-col bg-white border border-gray-300 rounded shadow-md z-10">
          <button
            className="px-2 py-1 text-blue-500 hover:text-blue-700 hover:bg-gray-100 text-left w-full"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className="px-2 py-1 text-red-500 hover:text-red-700 hover:bg-gray-100 text-left w-full"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
