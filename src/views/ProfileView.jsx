"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Input,
  CardHeader,
  CardBody,
  Avatar,
} from "@heroui/react";
import { useSelector } from "react-redux";
import { updateUserData } from "../events/actions";
import { toast } from "sonner";
import {
  RiCamera2Line,
  RiDeleteBin6Line,
  RiMailLine,
  RiPencilLine,
  RiSmartphoneLine,
} from "@remixicon/react";
import { useTranslation } from "react-i18next";
import { getUserData } from "@/events/getters";

const ProfileView = () => {
  const { t } = useTranslation();

  // Initialize with null or empty values
  const [prefill, setPrefill] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country: "",
    phone: "",
    date_of_birth: "",
    gender: "",
  });

  const [image, setImage] = useState("");
  const [settings, setSettings] = useState(null);
  const imageRef = useRef(null);

  // Get data from Redux
  const prefillData = useSelector((state) => state.authentication.userData);
  const settingsData = useSelector((state) => state.settings.value);

  const userData = getUserData();
  const userId = userData.id;

  const imageFromRedux = useSelector(
    (state) => state.authentication.userData.image
  );

  // Use useEffect to update state after initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPrefill({
        first_name: prefillData?.username || "James",
        last_name: prefillData?.last_name || "Carter",
        email: prefillData?.email || "test.user@mail.com",
        country: prefillData?.country_code || "IN",
        phone: prefillData?.mobile || "+919876543210",
        date_of_birth: prefillData?.date_of_birth || "",
        gender: prefillData?.gender || "Male",
      });

      setImage(
        imageFromRedux || "https://ui-avatars.com/api/?background=random"
      );

      if (settingsData?.web_settings?.length > 0) {
        setSettings(settingsData.web_settings[0]);
      }
    }
  }, [prefillData, imageFromRedux, settingsData]);

  const handleSubmit = async () => {
    try {
      const formData = {
        first_name: prefill.first_name,
        image: imageRef.current?.files[0] || null,

        // Don't include delete_image flag when submitting normally
      };

      const response = await updateUserData(formData);

      if (response?.data) {
        toast.success(response.data.message || "Profile updated successfully");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error while saving data:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // file size validation (1MB = 1024 * 1024 bytes)
      if (file.size > 1024 * 1024) {
        toast.error("Image size should not exceed 1MB");
        if (imageRef.current) {
          imageRef.current.value = "";
        }

        return;
      }

      // Add file type validation
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, JPEG, and PNG files are allowed");
        if (imageRef.current) {
          imageRef.current.value = "";
        }

        return;
      }

      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-0 space-y-8">
      <Card className="p-8 rounded-lg">
        <CardBody>
          <div className="border-b pb-4 mb-4">
            <h2 className="text-2xl font-bold">{t("personal_info")}</h2>
            <p className="text-sm mt-1">{t("manage_personal_info")}</p>
          </div>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 md:gap-8 items-center">
              <label className="text-sm">Avatar</label>
              <div className="flex flex-col items-center md:items-start space-y-4">
                <div className="relative group">
                  <Avatar
                    src={prefillData.image}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-2"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    ref={imageRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black bg-opacity-50 rounded-full w-full h-full flex items-center justify-center">
                      <Button
                        isIconOnly
                        className="bg-transparent"
                        onPress={() => imageRef.current?.click()}
                      >
                        <RiCamera2Line className="w-6 h-6 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    size="sm"
                    onPress={() => imageRef.current?.click()}
                    className="rounded font-semibold"
                  >
                    {t("change_picture")}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {t("allowed_file_types")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 md:gap-8 items-start">
              <label className="text-sm">{t("name")}</label>
              <Input
                className="w-full md:w-3/4"
                variant="flat"
                value={prefill.first_name}
                onChange={(e) =>
                  setPrefill({ ...prefill, first_name: e.target.value })
                }
                startContent={<RiPencilLine />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 md:gap-8 items-start">
              <label className="text-sm">{t("mobile")}</label>
              <Input
                className="w-full md:w-3/4"
                variant="flat"
                type="tel"
                value={prefill.phone}
                onChange={(e) =>
                  setPrefill({ ...prefill, phone: e.target.value })
                }
                startContent={<RiSmartphoneLine />}
                disabled={userData.type !== "google"}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 md:gap-8 items-start">
              <label className="text-sm">{t("email")}</label>
              <Input
                className="w-full md:w-3/4"
                type="email"
                variant="flat"
                value={prefill.email}
                onChange={(e) =>
                  setPrefill({ ...prefill, email: e.target.value })
                }
                startContent={<RiMailLine />}
                disabled={userData.type == "google"}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="flex justify-start">
        <Button
          color="primary"
          onPress={handleSubmit}
          className="rounded font-bold"
        >
          {t("save_changes")}
        </Button>
      </div>
    </div>
  );
};

export default ProfileView;
