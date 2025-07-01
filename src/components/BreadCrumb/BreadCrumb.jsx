import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { useTranslation } from "react-i18next";

const validRoutes = [
  "/home",
  "/about-us",
  "/categories",
  "/categories/[slug]",
  "/contact-us",
  "/feature-products",
  "/feature-products/[slug]",
  "/offer",
  "/privacy-policy",
  "/products",
  "/terms-conditions",
  "/user/address",
  "/user/cart",
  "/user/favorites",
  "/user/my-orders",
  "/user/my-orders/[id]",
  "/user/profile",
  "/user/refer",
  "/user/wallet",
];

const isValidRoute = (path) =>
  validRoutes.includes(path) ||
  validRoutes.some(
    (route) =>
      route.includes("[") && path.startsWith(route.replace(/\[.*?\]/, ""))
  );

const BreadCrumb = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const pathSegments = router.asPath
    .split("#")[0]
    .split("?")[0] 
    .split("/")
    .filter((segment) => segment);

  const breadcrumbItems = [
    { name: t("home"), link: "/home" },
    ...pathSegments.map((segment, index) => {
      const currentPath = `/${pathSegments.slice(0, index + 1).join("/")}`;
      return {
        name: t(segment.toLowerCase()),
        link: isValidRoute(currentPath) ? currentPath : null, // Only link to valid routes
      };
    }),
  ];

  return (
    <div className="p-0 rounded-md my-4 px-2 sm:px-6 lg:px-0">
      <Breadcrumbs
        itemClasses={{
          item: "text-gray-600 dark:text-gray-300 text-lg",
          separator: "px-1 text-xs",
          root: "bg-transparent",
        }}
        className="p-0"
      >
        {breadcrumbItems.map((item, index) => {
          const isLastItem = index === breadcrumbItems.length - 1;

          return (
            <BreadcrumbItem key={index} isLast={isLastItem} size="lg">
              {item.link && !isLastItem ? (
                <Link href={item.link}>{item.name}</Link>
              ) : (
                <span>{item.name}</span>
              )}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumbs>
    </div>
  );
};

export default BreadCrumb;
