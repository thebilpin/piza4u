"use client";
import React, { useState } from "react";
import {
  Avatar,
  Card,
  Divider,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Button,
  Tabs,
  Tab,
  ModalFooter,
  ModalContent,
  Modal,
  ModalHeader,
  useDisclosure,
  Tooltip,
} from "@heroui/react";

import { useRouter } from "next/router";
import { useSelector } from "react-redux";

// icons

import {
  RiCloseLine,
  RiDeleteBin5Line,
  RiFile3Line,
  RiFileList3Line,
  RiGift2Line,
  RiHeart2Line,
  RiHome2Line,
  RiLinksLine,
  RiLogoutBoxLine,
  RiLogoutCircleLine,
  RiMapPinLine,
  RiSettings6Line,
  RiShieldUserLine,
  RiTruckLine,
  RiUser3Line,
  RiUserSettingsLine,
  RiWallet3Line,
} from "@remixicon/react";
import { logout } from "@/events/actions";
import { useTranslation } from "react-i18next";
import Logout from "@/components/Modals/Logout";
import DeleteAccountModal from "@/components/Modals/DeleteAccountModal";

const UserLayout = ({ children }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const userData = useSelector((state) => state.authentication?.userData);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  const { t } = useTranslation();

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  if (!isClient || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const sidebarItems = [
    { key: "home", label: t("home"), hasSubmenu: true, icon: <RiHome2Line /> },
    {
      key: "profile",
      label: t("my_profile"),
      hasSubmenu: true,
      icon: <RiUser3Line />,
    },
    { key: "orders", label: t("my_orders"), icon: <RiFileList3Line /> },
    {
      key: "favorites",
      label: t("favorite_items"),
      hasSubmenu: true,
      icon: <RiHeart2Line />,
    },
    { key: "address", label: t("addresses"), icon: <RiMapPinLine /> },
    { key: "wallet", label: t("wallet"), icon: <RiWallet3Line /> },
    { key: "refer", label: t("refer_and_earn"), icon: <RiGift2Line /> },
    {
      key: "delete",
      label: t("delete_your_account"),
      icon: <RiDeleteBin5Line />,
      onClick: () => {
        console.log("Opening Delete Modal");
        onDeleteOpen();
      },
    },
    {
      key: "logout",
      label: t("log_out"),
      icon: <RiLogoutBoxLine />,
      onClick: () => onOpen(),
    },
  ];

  const routePaths = {
    home: "/home",
    profile: "/user/profile",
    orders: "/user/my-orders",
    favorites: "/user/favorites",
    address: "/user/address",
    wallet: "/user/wallet",
    refer: "/user/refer",
  };

  const handleNavigation = (key) => {
    const route = routePaths[key];
    if (route) {
      router.push(route);
      setIsMenuOpen(false);
    }
  };

  const isActive = (key) => {
    const currentPath = router.pathname;
    const route = routePaths[key];

    return currentPath === route;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile Navbar */}
      <div className="md:hidden w-full sticky top-0 z-30">
        <Navbar
          onMenuOpenChange={setIsMenuOpen}
          isMenuOpen={isMenuOpen}
          className="shadow-sm"
        >
          <NavbarContent>
            <NavbarMenuToggle />
            <NavbarBrand>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{userData?.username}</span>
              </div>
            </NavbarBrand>
          </NavbarContent>

          <NavbarMenu className="pt-6 px-4 pb-6 mt-16 border-t border-gray-200">
            <Button
              className="absolute top-4 right-4"
              isIconOnly
              variant="light"
              onPress={() => setIsMenuOpen(false)}
            >
              <RiCloseLine className="w-6 h-6" />
            </Button>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200">
                <Avatar
                  src={userData?.image}
                  className="w-12 h-12 border-2 border-gray-200"
                  alt="User"
                />
                <div>
                  <p className="text-base font-medium">{userData?.username}</p>
                </div>
              </div>

              <Divider className="my-4 border-gray-200" />

              <div className="flex flex-col gap-2">
                {sidebarItems.map((item) => (
                  <Button
                    key={item.key}
                    className={`w-full justify-start gap-3 px-4 h-12 rounded-lg border border-transparent transition-all duration-200 ${
                      isActive(item.key)
                        ? "bg-primary-50 text-primary-600"
                        : "hover:bg-gray-50 hover:border-gray-200"
                    }`}
                    variant="light"
                    onPress={() => {
                      if (item.key === "logout") {
                        onOpen();
                      } else {
                        handleNavigation(item.key);
                      }
                    }}
                  >
                    <span className="w-5">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </NavbarMenu>
        </Navbar>
      </div>

      {/* Desktop Sidebar */}
      <Card className="hidden md:flex w-80 rounded-none h-screen overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 p-4 rounded shadow">
            <Avatar
              src={userData?.image}
              className="w-12 h-12 flex-shrink-0"
              alt="User"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{userData?.username}</p>
              <Tooltip content={userData?.email} placement="topStart">
                <p className="text-sm text-gray-500 truncate">
                  {userData?.email}
                </p>
              </Tooltip>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.key}
                className={`w-full justify-start gap-3 px-4 h-12 rounded-lg transition-all duration-200 ${
                  isActive(item.key)
                    ? "bg-primary-50 text-primary-600"
                    : "hover:bg-gray-50 hover:border-gray-200"
                }`}
                variant="light"
                onPress={() => {
                  if (item.key === "logout") {
                    onOpen();
                  } else if (item.key === "delete") {
                    onDeleteOpen();
                  } else {
                    handleNavigation(item.key);
                  }
                }}
              >
                <span className="w-5">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </Card>
      <DeleteAccountModal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
      />

      <Logout isOpen={isOpen} onOpenChange={onOpenChange} />
      <main className="flex-1 pl-0 sm:pl-4">
        <div className="mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default UserLayout;
