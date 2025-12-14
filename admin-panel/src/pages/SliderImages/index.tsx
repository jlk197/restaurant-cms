import { useCallback, useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import type { Configuration } from "../../models/configuration";
import ConfigForm from "../../components/configuration/config_form";
import { useApi } from "../../hooks/useApi";
import Loader from "../../components/Loader";
import configurationService from "../../services/configurationService";
import { SliderImage } from "../../models/slider_image";
import sliderImagesService from "../../services/sliderImagesService";
import { PlusIcon } from "../../icons";
import SliderImagesAddModal from "../../components/slider_images/slider_images_add_modal";
import SliderImageItem from "../../components/slider_images/slider_image_item";

export default function SliderImages() {
  const [isOpen, setIsOpen] = useState(false);
  const [editedImage, setEditedImage] = useState<SliderImage | null>(null);
  const [activeImages, setActiveImages] = useState<SliderImage[]>([]);
  const [inactiveImages, setInactiveImages] = useState<SliderImage[]>([]);

  const {
    data: sliderImages,
    isLoading,
    error,
    execute: fetchSliderImages,
    setData: setSliderImages,
  } = useApi<SliderImage[]>(
    useCallback(() => sliderImagesService.getAll(), []),
    "Cannot get configuration"
  );

  useEffect(() => {
    fetchSliderImages();
  }, [fetchSliderImages]);

  useEffect(() => {
    if (!sliderImages) return;
    setActiveImages(sliderImages.filter((e) => e.is_active));
    setInactiveImages(sliderImages.filter((e) => !e.is_active));
  }, [sliderImages]);

  const openModal = () => {
    setIsOpen(true);
  };

  const handleDelete = async (image: SliderImage) => {
    await sliderImagesService.delete(image.id);
    fetchSliderImages();
  };

  const handleEdit = (image: SliderImage) => {
    setIsOpen(true);
    setEditedImage(image);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditedImage(null);
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
            Slider Images
          </h3>
          <button
            onClick={openModal}
            className="hover:opacity-70 transition-opacity"
          >
            <PlusIcon className="w-10 h-10 fill-gray-800 dark:fill-white mr-2" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {activeImages.length > 0 && (
            <>
              <h4 className="text-lg font-semibold text-blue-500">Active</h4>
              <div className="flex flex-wrap gap-2">
                {activeImages.map((image) => (
                  <SliderImageItem
                    key={image.id}
                    image={image}
                    handleDelete={() => handleDelete(image)}
                    handleEdit={() => handleEdit(image)}
                  />
                ))}
              </div>
            </>
          )}

          {inactiveImages.length > 0 && (
            <>
              <h4 className="text-lg font-semibold text-blue-500">Inactive</h4>
              <div className="flex flex-wrap gap-2">
                {inactiveImages.map((image) => (
                  <SliderImageItem
                    key={image.id}
                    image={image}
                    handleDelete={() => handleDelete(image)}
                    handleEdit={() => handleEdit(image)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <SliderImagesAddModal
        editedImage={editedImage}
        isOpen={isOpen}
        closeModal={closeModal}
        onSuccess={fetchSliderImages}
      />
    </>
  );
}
