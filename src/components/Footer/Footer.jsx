import { Image, Chip } from "@heroui/react";
import {
  RiFacebookBoxFill,
  RiFacebookCircleLine,
  RiInstagramFill,
  RiInstagramLine,
  RiTwitterLine,
  RiYoutubeFill,
  RiYoutubeLine,
} from "@remixicon/react";
import Link from "next/link";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const Footer = () => {
  const { t } = useTranslation();

  const settings = useSelector(
    (state) => state?.settings?.value?.web_settings?.[0]
  );

  return (
    <>
      <div className="relative mt-16 bg-background-footer">
        <svg
          className="absolute top-0 w-full h-6 -mt-5 sm:-mt-10 sm:h-16 text-background-footer"
          preserveAspectRatio="none"
          viewBox="0 0 1440 54"
        >
          <path
            fill="currentColor"
            d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"
          />
        </svg>

        <div className="px-4 pt-12 mx-auto sm:max-w-xl md:max-w-full lg:max-w-[1800px] md:px-24 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between gap-16 mb-8">
            <div className="md:max-w-md lg:w-1/3">
              <Image src={settings?.light_logo} width={80} alt="Logo" />
              <div className="mt-4 lg:max-w-sm">
                <p className="text-sm text-white">
                  {settings?.app_short_description}
                </p>
              </div>
            </div>

            <div className="lg:w-2/3 flex justify-end gap-16">
              <div className="mt-4 lg:mt-0">
                <p className="font-semibold tracking-wide text-white text-lg">
                  {t("quick_links")}
                </p>
                <ul className="mt-2 space-y-2">
                  <li>
                    <Link
                      href="/home"
                      className="transition-colors duration-300 text-white hover:text-white"
                    >
                      {t("home")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products"
                      className="transition-colors duration-300 text-white hover:text-white"
                    >
                      {t("products")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/categories"
                      className="transition-colors duration-300 text-white hover:text-white"
                    >
                      {t("categories")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about-us"
                      className="transition-colors duration-300 text-white hover:text-white"
                    >
                      {t("about")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="transition-colors duration-300 text-white hover:text-white"
                    >
                      {t("contact")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="mt-4 lg:mt-0">
                <p className="font-semibold tracking-wide text-white text-lg">
                  {t("contact")}
                </p>
                <ul className="text-white transition-all duration-500 grid gap-4">
                  <li>{settings?.support_email}</li>
                  <li>{settings?.support_number}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="py-7 text-white max-w-[1800px] mx-auto md:px-24 lg:px-8 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex justify-start items-center gap-2">
              <span className="text-sm sm:text-center dark:text-gray-400">
                {settings?.copyright_details}
              </span>
              <Chip>v 1.1.1</Chip>
            </div>
            <ul className="flex flex-wrap items-center mt-3 text-sm font-medium dark:text-gray-400 sm:mt-0">
              <li>
                <Link
                  href="/terms-conditions"
                  className="hover:underline me-4 md:me-6"
                >
                  {t("terms_conditions")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:underline me-4 md:me-6"
                >
                  {t("privacy_policy")}
                </Link>
              </li>

              <li>
                <Link href="/contact-us" className="hover:underline">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
