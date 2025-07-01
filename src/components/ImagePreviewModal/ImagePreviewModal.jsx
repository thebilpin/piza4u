import React from "react";
import { Modal, ModalBody, ModalContent , Image } from "@heroui/react";
import { RiArrowLeftSLine, RiArrowRightSLine, RiCloseLine } from "@remixicon/react";


const ImagePreviewModal = ({
  isOpen,
  images,
  selectedImage,
  onClose,
  setSelectedImage,
}) => {
  const handlePrevImage = () => {
    const newIndex = selectedImage.index - 1;
    if (newIndex >= 0) {
      setSelectedImage((prev) => ({ ...prev, index: newIndex }));
    }
  };

  const handleNextImage = () => {
    const newIndex = selectedImage.index + 1;
    if (newIndex < images[selectedImage.productId]?.length) {
      setSelectedImage((prev) => ({ ...prev, index: newIndex }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="rounded-lg" size="4xl">
      <ModalContent className="p-0">
        <ModalBody className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-gray-900 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
          >
            <RiCloseLine className="w-6 h-6" />
          </button>

          <div className="relative overflow-hidden min-h-[200px] max-h-[80vh]">
            <div
              className="flex transition-transform duration-300 ease-in-out h-full"
              style={{
                transform: `translateX(-${selectedImage.index * 100}%)`,
              }}
            >
              {images[selectedImage.productId]?.map((file, index) => (
                <div
                  key={index}
                  className="min-w-full flex items-center justify-center"
                >
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="max-w-full max-h-[80vh] object-contain transition-opacity duration-300"
                  />
                </div>
              ))}
            </div>

            {images[selectedImage.productId]?.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-gray-900 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all ${
                    selectedImage.index === 0 ? "invisible" : ""
                  }`}
                >
                  <RiArrowLeftSLine className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-gray-900 bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all ${
                    selectedImage.index ===
                    images[selectedImage.productId].length - 1
                      ? "invisible"
                      : ""
                  }`}
                >
                  <RiArrowRightSLine className="w-6 h-6" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImage.index + 1} /{" "}
                  {images[selectedImage.productId].length}
                </div>
              </>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ImagePreviewModal;
