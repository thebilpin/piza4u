"use client";

import {
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerBody,
} from "@heroui/react";
import { RiSettings2Line } from "@remixicon/react";
import Image from "next/image";

const themeUrl = process.env.NEXT_PUBLIC_THEME_URL;

const SideDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE;

  const handleTheme = () => {
    if (themeUrl) {
      window.open(themeUrl, "_blank");
    }
  };

  return (
    <div>
      {demoMode == "true" && (
        <>
          <button
            onClick={onOpen}
            className={`fixed left-0 top-0 z-50 p-0 rounded-lg transition-all duration-700 ${
              !isOpen ? "animate-spin-slow" : ""
            }`}
            aria-label="Open menu"
          >
            <div className="flex justify-center items-center h-screen">
              <RiSettings2Line className="text-primary" size={34} />
            </div>
          </button>
          <Drawer isOpen={isOpen} onClose={onClose} size="xs" placement="left">
            <DrawerContent
              className="w-64 h-[60vh] 
                     absolute left-0 top-1/2 -translate-y-1/2 flex flex-col"
            >
              <DrawerBody className="p-4 space-y-8 overflow-visible">
                {[
                  { src: "/Classic_theme.png", alt: "Classic Theme" },
                  { src: "/Modern_theme.png", alt: "Modern Theme" },
                ].map((image, index) => (
                  <div
                    key={index}
                    className="rounded-lg shadow-md group text-center"
                    onClick={
                      image.alt === "Classic Theme" ? handleTheme : undefined
                    }
                  >
                    {/* Theme Name */}
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-200">
                      {image.alt}
                    </h3>

                    <div
                      className="h-44 overflow-hidden hover:overflow-y-auto relative rounded-lg p-1 cursor-pointer"
                      style={{ scrollBehavior: "smooth" }}
                    >
                      <div className="relative">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          width={500}
                          height={900}
                          className="w-full transition-all duration-300 group-hover:opacity-95"
                          priority
                        />
                        {/* Scroll Indicator */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-100 to-transparent opacity-75 pointer-events-none group-hover:opacity-0 transition-opacity duration-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </DrawerBody>
            </DrawerContent>
          </Drawer>{" "}
        </>
      )}
    </div>
  );
};

export default SideDrawer;
