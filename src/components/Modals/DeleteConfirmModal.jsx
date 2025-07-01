import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { RiDeleteBinLine, RiCloseCircleLine } from "@remixicon/react";
import { useTranslation } from "react-i18next";

const DeleteConfirmationModal = ({
  onConfirmDelete,
  buttonProps = {},
  buttonText = "",
}) => {
  const { t } = useTranslation();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleConfirmDelete = () => {
    onConfirmDelete();
    onOpenChange();
  };

  return (
    <>
      <Button
        type="button"
        color="error"
        variant="light"
        onPress={onOpen}
        startContent={<RiDeleteBinLine size={20} />}
        {...buttonProps}
      >
        {buttonText}
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="auto"
        backdrop="blur"
        className="rounded"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2 text-danger-600">
                <RiDeleteBinLine size={24} />
                {t("confirm_deletion")}
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-700">{t("delete_item_confirmation")}</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  startContent={<RiCloseCircleLine size={20} />}
                  className="rounded"
                >
                  {t("cancel")}
                </Button>
                <Button
                  color="danger"
                  onPress={handleConfirmDelete}
                  startContent={<RiDeleteBinLine size={20} />}
                  className="rounded"
                >
                  {t("delete")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeleteConfirmationModal;
