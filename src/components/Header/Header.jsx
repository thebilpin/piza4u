"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Image,
  Input,
  Link,
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  useDisclosure,
  ModalFooter,
  ModalHeader,
  ModalContent,
  Modal,
  ModalBody,
  Badge,
  SelectItem,
  Select,
  Divider,
} from "@heroui/react";
import LocationModal from "../Modals/LocationModal";
import LoginModal from "../Modals/LoginModal";
import { logout } from "@/events/actions";
import SearchHeader from "../Modals/SearchProductsModal";

//  icons
import {
  RiArrowDownSLine,
  RiArrowRightFill,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiArrowRightWideLine,
  RiContactsLine,
  RiFile3Line,
  RiFileList3Line,
  RiHeart2Line,
  RiHome2Line,
  RiListUnordered,
  RiLogoutBoxLine,
  RiMapPinLine,
  RiMenuLine,
  RiNotification3Line,
  RiPercentLine,
  RiShoppingBagLine,
  RiShoppingCartLine,
  RiTruckLine,
  RiUserLine,
  RiWalletLine,
} from "@remixicon/react";
import { ThemeSwitch } from "../theme-switch";
import Logout from "../Modals/Logout";
import i18n, { languages } from "../../i18n";
import { setLanguage } from "@/store/reducers/languageSlice";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import Notifications from "@/views/Notifications";

const Header = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [slug, setSlug] = useState();
  const settings = useSelector((state) => state.settings);
  const logoSrc = settings?.value?.web_settings?.[0]?.light_logo;
  const cartStoreData = useSelector((state) => state.cart);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const selectedCity = useSelector((state) => state.selectedCity);
  const router = useRouter();

  const {
    isOpen: isLogoutOpen,
    onOpen: onLogoutOpen,
    onOpenChange: onLogoutOpenChange,
  } = useDisclosure();
  const {
    isOpen: isCategoryOpen,
    onOpen: onCategoryOpen,
    onOpenChange: onCategoryOpenChange,
  } = useDisclosure();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const homeStoreData = useSelector((state) => state.homepage);
  const categories = homeStoreData.categories;
  const authStoreData = useSelector((state) => state.authentication);
  const [isHovered, setIsHovered] = useState(false);
  const dispatch = useDispatch();

  const imageFromRedux = useSelector(
    (state) => state.authentication.userData.image
  );

  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onOpen();
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onOpenChange(false);
    }, 150);
  };
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (router.query.slug) {
      setSlug(router.query.slug);
    }
  }, [router.query.slug]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenLoginModal = () => setIsLoginModalOpen(true);
  const handleCloseLoginModal = () => setIsLoginModalOpen(false);

  const menuItems = [
    {
      name: t("home"),
      icon: <RiHome2Line size={20} />,
      route: "/home",
    },
    {
      name: t("offer"),
      icon: <RiPercentLine size={20} />,
      route: "/offer",
    },
    {
      name: t("products"),
      icon: <RiShoppingBagLine size={20} />,
      route: "/products",
    },
    {
      name: t("contact"),
      icon: <RiContactsLine size={20} />,
      route: "/contact-us",
    },
  ];

  const [Open, setOpen] = useState(false);

  const handleOpen = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(true);
  };

  const handleClose = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 300); // Increased delay for better user experience
  };

  const isActive = (route) => {
    return router.pathname === route ? "text-primary" : "";
  };

  const handleMenuItemClick = (route) => {
    router.push(route);
  };

  return (
    <header className="relative">
      <Navbar
        maxWidth="full"
        isBlurred={true}
        disableAnimation
        onMenuOpenChange={setIsMenuOpen}
        isMenuOpen={isMenuOpen}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        <div className="mx-auto w-full max-w-[1800px] px-0 sm:px-6 md:px-8">
          <NavbarContent className="gap-4">
            <NavbarMenuToggle className="sm:hidden" />

            <NavbarItem className="flex-grow sm:flex-grow-0 justify-center sm:justify-start">
              <Link href="/home" className="flex items-center">
                {logoSrc && (
                  <Image
                    src={logoSrc}
                    alt="Logo"
                    width={50}
                    height="auto"
                    className="max-w-[120px] sm:max-w-[150px] object-contain"
                  />
                )}
              </Link>
            </NavbarItem>

            <NavbarContent justify="end" className="gap-2 sm:gap-4">
              <NavbarItem className="hidden sm:flex">
                <LanguageSwitcher />
              </NavbarItem>

              <NavbarItem className="hidden sm:flex">
                <Button
                  isIconOnly
                  variant="light"
                  radius="full"
                  onPress={() => router.push("/notifications")}
                  className="text-foreground"
                >
                  <RiNotification3Line size={22} />
                </Button>
              </NavbarItem>

              <NavbarItem className="hidden sm:flex">
                <SearchHeader />
              </NavbarItem>

              <NavbarItem>
                <ThemeSwitch className="hidden sm:flex" />
              </NavbarItem>

              {authStoreData.isLogged && (
                <NavbarItem>
                  <Badge
                    content={cartStoreData.data.length}
                    color="primary"
                    // shape="circle"
                    // isInvisible={totalCartItems === 0}
                  >
                    <Button
                      isIconOnly
                      aria-label="Cart"
                      variant="light"
                      radius="full"
                      onPress={() => router.push("/user/cart")}
                      className="text-foreground"
                    >
                      <RiShoppingCartLine size={22} />
                    </Button>
                  </Badge>
                </NavbarItem>
              )}

              <NavbarItem>
                <Button
                  onPress={handleOpenModal}
                  className="min-w-0 px-2 sm:px-4"
                  variant="light"
                  startContent={<RiMapPinLine />}
                >
                  <span className="hidden sm:inline">
                    {selectedCity?.value?.city || t("select_location")}
                  </span>
                </Button>
              </NavbarItem>

              <NavbarItem>
                {!authStoreData.isLogged ? (
                  <Button
                    variant="flat"
                    onPress={handleOpenLoginModal}
                    className="font-bold"
                  >
                    {t("login")}
                  </Button>
                ) : (
                  <>
                    <div className="flex justify-center items-center gap-2">
                      <Dropdown placement="top-end">
                        <DropdownTrigger>
                          <Avatar
                            radius="md"
                            src={imageFromRedux}
                            className={"cursor-pointer"}
                          />
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="Profile Actions"
                          variant="flat"
                        >
                          <DropdownItem key="profile" className="h-14 gap-2">
                            <p className="font-semibold">Signed in as:</p>
                            <div className="font-semibold max-w-40 break-all">
                              {authStoreData?.userData?.email}
                            </div>
                          </DropdownItem>

                          <DropdownItem
                            key="settings"
                            onPress={() => router.push("/user/profile")}
                            startContent={<RiUserLine />}
                          >
                            {t("my_profile")}
                          </DropdownItem>
                          <DropdownItem
                            key="team_settings"
                            onPress={() => router.push("/user/my-orders")}
                            startContent={<RiFileList3Line />}
                          >
                            {t("my_orders")}
                          </DropdownItem>
                          <DropdownItem
                            key="analytics"
                            onPress={() => router.push("/user/favorites")}
                            startContent={<RiHeart2Line />}
                          >
                            {t("favorites")}
                          </DropdownItem>
                          <DropdownItem
                            key="system"
                            onPress={() => router.push("/user/address")}
                            startContent={<RiMapPinLine />}
                          >
                            {t("addresses")}
                          </DropdownItem>

                          <DropdownItem
                            key="help_and_feedback"
                            onPress={() => router.push("/user/wallet")}
                            startContent={<RiWalletLine />}
                          >
                            {t("wallet")}
                          </DropdownItem>
                          <DropdownItem
                            key="logout"
                            color="danger"
                            onPress={onLogoutOpen}
                            className="text-danger"
                            startContent={<RiLogoutBoxLine />}
                          >
                            {t("log_out")}
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>

                      <Logout
                        isOpen={isLogoutOpen}
                        onOpenChange={onLogoutOpenChange}
                      />
                    </div>
                  </>
                )}
              </NavbarItem>
            </NavbarContent>
          </NavbarContent>
        </div>

        {/* Mobile Menu */}
        <NavbarMenu className="pt-6">
          {menuItems.map((item) => (
            <NavbarMenuItem key={item.name}>
              <Link
                className={`w-full py-2 flex items-center gap-3 text-foreground ${isActive(item.route)}`}
                onPress={() => {
                  handleMenuItemClick(item.route);
                  setIsMenuOpen(false);
                }}
              >
                {item.icon}
                <span className="font-semibold">{item.name}</span>
              </Link>
            </NavbarMenuItem>
          ))}

          <NavbarMenuItem>
            <Link
              className="w-full py-2 flex items-center gap-3 text-foreground"
              onPress={() => {
                router.push("/categories");
                setIsMenuOpen(false);
              }}
            >
              <RiArrowRightWideLine size={20} />
              <span className="font-semibold">{t("categories")}</span>
            </Link>
          </NavbarMenuItem>

          <NavbarMenuItem className="sm:hidden">
            <SearchHeader />
          </NavbarMenuItem>

          <NavbarMenuItem className="sm:hidden mt-4">
            <ThemeSwitch />
          </NavbarMenuItem>

          <NavbarMenuItem className="mt-2">
            <LanguageSwitcher />
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>

      {/* Second Navbar - Desktop Only */}
      <Navbar maxWidth="full" className="hidden sm:flex">
        <div className="mx-auto w-full max-w-[1800px] px-2 sm:px-6 md:px-8">
          <NavbarContent className="gap-4" justify="start">
            {/* Desktop Menu Items */}
            {menuItems.map((item) => (
              <NavbarItem key={item.name}>
                <Link
                  className={`font-semibold cursor-pointer flex items-center gap-2 text-foreground ${isActive(item.route)}`}
                  onPress={() => handleMenuItemClick(item.route)}
                >
                  <span>{item.name}</span>
                </Link>
              </NavbarItem>
            ))}

            {/* Categories Dropdown */}
            <NavbarItem>
              <div
                className="relative group"
                onMouseEnter={handleOpen}
                onMouseLeave={handleClose}
              >
                <button className="flex items-center gap-2 px-4 py-2 font-semibold rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                  <RiArrowRightWideLine size={20} />
                  {t("categories")}
                </button>

                <div
                  className={`absolute top-full left-0 w-screen max-w-xl bg-content1 shadow-xl rounded-lg mt-2 z-50 
                   transform origin-top-left transition-all duration-200 ease-in-out
                   ${Open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                  onMouseEnter={handleOpen}
                  onMouseLeave={handleClose}
                >
                  <div className="grid grid-cols-4 gap-6 p-6">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="group/item space-y-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                      >
                        <div
                          onClick={() => {
                            router.push(`/categories/${category.slug}`);
                            setOpen(false);
                          }}
                          className="block cursor-pointer text-sm group-hover/item:text-primary transition-colors duration-200 truncate max-w-[150px] overflow-hidden"
                          title={category.name}
                        >
                          {category.name}
                        </div>
                      </div>
                    ))}
                    <div className="col-span-full pt-4 border-t mt-2">
                      <Button
                        variant="light"
                        startContent={<RiArrowRightLine size={16} />}
                        onPress={() => {
                          router.push("/categories");
                          setOpen(false);
                        }}
                        className="text-center font-bold text-md hover:text-primary transition-colors w-full justify-center"
                      >
                        {t("see_all")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </NavbarItem>
          </NavbarContent>
        </div>
      </Navbar>

      <LocationModal isOpen={isModalOpen} onClose={handleCloseModal} />
      <LoginModal isOpen={isLoginModalOpen} onClose={handleCloseLoginModal} />
      <Logout isOpen={isLogoutOpen} onOpenChange={onLogoutOpenChange} />
    </header>
  );
};

export default Header;
