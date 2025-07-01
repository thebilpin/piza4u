"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { deleteMyAccount } from "@/interceptor/routes";
import { getUserData } from "@/events/getters";

const DeleteAccountModal = ({ isOpen, onOpenChange }) => {
  const userData = getUserData();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const response = await deleteMyAccount({ user_id: userData?.id });

      if (response.success) {
        
        router.push("/home");
      } else {
        alert(response.message || "Failed to delete account");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop={
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ease-out data-[closing]:duration-200 data-[closing]:ease-in data-[closing]:opacity-0" />
      }
      className="fixed inset-0 z-10 w-screen overflow-y-auto"
    >
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <ModalContent className="relative transform overflow-hidden rounded-lg text-left shadow-xl transition-all duration-300 ease-out data-[closing]:duration-200 data-[closing]:ease-in data-[closing]:translate-y-4 data-[closing]:opacity-0 sm:my-8 sm:w-full sm:max-w-lg data-[closing]:sm:translate-y-0 data-[closing]:sm:scale-95">
          {(onClose) => (
            <>
              <ModalHeader className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-lg font-semibold leading-6">
                      Delete Account
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        This action is irreversible. Your account and all
                        associated data will be permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>
              </ModalHeader>
              <ModalFooter className="px-4 py-3 sm:flex sm:flex-row-reverse justify-start sm:px-6">
                <Button
                  color="danger"
                  className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto"
                  onPress={handleDeleteAccount}
                  isLoading={loading}
                  isDisabled={true}
                >
                  Delete Account
                </Button>
                <Button
                  color="default"
                  variant="light"
                  className="mt-0 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 sm:mt-0 sm:w-auto"
                  onPress={onClose}
                >
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </div>
    </Modal>
  );
};

export default DeleteAccountModal;
