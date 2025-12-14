import React, { useState } from "react";
import { SliderImage } from "../../models/slider_image";

interface SliderImageItemProps {
  image: SliderImage;
  handleDelete: () => void;
  handleEdit: () => void;
}

export default function SliderImageItem({
  image,
  handleDelete,
  handleEdit,
}: SliderImageItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-max">
      {/* Obraz */}
      <div
        className="rounded border border-blue-500 p-2 cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <img src={image.image_url} alt="Slider Image" className="w-48 h-auto" />
      </div>

      {/* Menu */}
      {open && (
        <div className="absolute left-0 top-full mt-2 flex flex-col bg-white border border-gray-300 rounded shadow-md z-20 min-w-[120px]">
          <button
            className="px-3 py-2 text-left text-blue-600 hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              handleEdit();
            }}
          >
            Edit
          </button>
          <button
            className="px-3 py-2 text-left text-red-600 hover:bg-gray-100"
            onClick={() => {
              setOpen(false);
              handleDelete();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
