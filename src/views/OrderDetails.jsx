import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider,
  Avatar,
  Image,
  CardHeader,
  CardFooter,
} from "@heroui/react";
import { getOrders } from "../interceptor/routes";

// icons

import jsPDFInvoiceTemplate from "../components/helpers/jsPDFInvoiceTemplate";

import {
  RiArrowLeftLine,
  RiCheckLine,
  RiCloseLine,
  RiDownload2Line,
  RiMailLine,
  RiPhoneLine,
  RiStarFill,
} from "@remixicon/react";
import { useSelector } from "react-redux";
import font from "@/config/fonts";
import OrderDetailsSkeleton from "@/components/Skeleton/OrderDetailsSkeleton";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { formatPrice, getCurrencySymbol } from "@/helpers/functionHelper";

const OrderDetails = ({ queryConstants }) => {
  const { t } = useTranslation();

  const currency = getCurrencySymbol();

  const router = useRouter();
  const [order, setOrder] = useState([]);

  const handleBack = () => {
    router.push("/user/my-order");
  };

  const getOrderDetails = useCallback(async () => {
    try {
      const orderDetails = await getOrders({ id: queryConstants.id });
      if (!orderDetails.error && orderDetails.data.length > 0) {
        setOrder(orderDetails.data[0]);
      }
    } catch (error) {
      console.error("Error occurred while getting order details:", error);
    }
  }, [queryConstants.id]);

  useEffect(() => {
    getOrderDetails();
  }, [getOrderDetails]);

  const settings = useSelector((state) => state.settings.value);

  const userDataRedux = useSelector((state) => state.authentication).userData;

  const generatePDF = async () => {
    // console.log(settings?.web_settings[0]);

    const getCurrentDate = () => {
      const date = new Date();

      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };

      const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
        date
      );

      return `Invoice Date: ${formattedDate}`;
    };

    const combinedItems = order?.order_items?.reduce((acc, item) => {
      acc.push(item);
      if (item.add_ons.length > 0) {
        acc.push(
          ...item.add_ons.map((addOn) => ({
            ...addOn,
            parentProduct: item.product_name,
          }))
        );
      }

      return acc;
    }, []);

    const table = combinedItems.map((item, index) => {
      if (item.parentProduct) {
        return [
          index + 1,
          `Add-on for ${item.parentProduct}: ${item.title}`,
          `${settings.currency[0]} ${item.price}`,
          `${item.qty}`,
          `${settings.currency[0]} ${item.price * item.qty}`,
        ];
      } else {
        return [
          index + 1,
          `${item.product_name}`,
          `${settings.currency[0]} ${item.price}`,
          `${item.quantity}`,
          `${settings.currency[0]} ${item.price * item.quantity}`,
        ];
      }
    });

    const props = {
      outputType: "save",
      returnJsPDFDocObject: true,
      onJsPDFDocCreation: (doc) => {
        doc.addFileToVFS("EnglishWithIndianRupee-gy5E.ttf.ttf", font);

        doc.addFont(
          "EnglishWithIndianRupee-gy5E.ttf.ttf",
          "IndianRupee1",
          "normal"
        );
        doc.setFont("IndianRupee1");

        doc.setFontSize(12);
      },
      fileName: settings?.web_settings[0]?.site_title,
      orientationLandscape: false,
      stamp: {
        inAllPages: true,
        width: 20,
        height: 20,
        margin: {
          top: 0,
          left: 0,
        },
      },

      business: {
        name: settings?.web_settings[0]?.site_title,
        address: settings?.web_settings[0]?.address,
        phone: settings?.web_settings[0]?.support_number,
        email: settings?.web_settings[0]?.support_email,
      },
      contact: {
        label: "Invoice issued for:",
        name: userDataRedux?.username,
        address: order?.address ? order?.address : "Address Not Available ",
        phone: userDataRedux?.mobile,
        email: userDataRedux?.email,
      },
      invoice: {
        label: "Order Id #:",
        num: order.id,
        text: `Branch Name: ${order.branch_details.branch_name}`,
        text1: `Branch Address:${order.branch_details.address}`,
        invDate: `Order Date: ${order.date_added}`,
        invGenDate: getCurrentDate(),
        headerBorder: false,
        tableBodyBorder: false,

        header: [
          { title: "#", style: { width: 10 } },
          { title: "Title", style: { width: 100, height: 100 } },

          // { title: "Description", style: { width: 80 } },
          { title: "Price" },
          { title: "Quantity" },
          { title: "Total" },
        ],

        table: table,

        additionalRows: [
          {
            col1: `Total Order Price (${settings.currency[0]}):`,
            col2: order?.total,
            style: { fontSize: 10 },
          },

          ...(order?.is_self_pick_up !== "1"
            ? [
                {
                  col1: `Delivery Charge (${settings.currency[0]}):`,
                  col2: order?.delivery_charge,
                  style: { fontSize: 10 },
                },
              ]
            : []),

          {
            col1: `Delivery Tip (${settings.currency[0]}):`,
            col2: order?.delivery_tip,
            style: { fontSize: 10 },
          },
          {
            col1: `Coupon Discount (${settings.currency[0]}):`,
            col2: order?.promo_discount,
            style: { fontSize: 10 },
          },
          {
            col1: "Tax:",
            col2: `${order?.total_tax_percent} %`,
            style: { fontSize: 10 },
          },
          {
            col1: "Total Pay:",
            col2: order?.total_payable,
            style: { fontSize: 14 },
          },
        ],

        invDescLabel: "Invoice Note",
        invDesc:
          "Thank you for choosing our service! We truly appreciate your support and hope to serve you again soon.",
      },
      footer: {
        text: "The invoice is created on a computer and is valid without the signature and stamp.",
      },
      pageEnable: true,
      pageLabel: "Page ",
    };

    jsPDFInvoiceTemplate(props);
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown Status";

    const formattedStatus = status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());

    return formattedStatus;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return (
          <Image
            src={"/assets/icons/pending.svg"}
            alt="Pending"
            className="w-4 h-4"
          />
        );
      case "preparing":
      case "confirmed":
        return (
          <Image
            src={"/assets/icons/confirmed.svg"}
            alt="Preparing"
            className="w-4 h-4"
          />
        );
      case "delivered":
        return <RiCheckLine />;
      case "cancelled":
        return <RiCloseLine />;

      case "out_for_delivery":
        return (
          <Image
            src={"/assets/icons/out_for_delivery.svg"}
            alt="Out for Delivery"
            className="w-4 h-4"
          />
        );
      default:
        return null; // Fallback if needed
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!order.id) {
    return <OrderDetailsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center p-6 rounded-lg">
          <div className="flex items-center gap-4">
            <Button
              variant="light"
              startContent={<RiArrowLeftLine size={16} />}
              onPress={() => router.push("/user/my-orders")}
            >
              {t("back_to_orders")}
            </Button>
            <div>
              <h1 className="text-2xl font-bold ">Order #{order.id}</h1>
              <p className="text-gray-400">
                {t("order_placed")}: {formatDate(order.date_added)}
              </p>
            </div>
          </div>
          <Button
            variant="flat"
            onPress={() => generatePDF(order.invoice_html)}
            className="bg-primary rounded text-white"
          >
            {t("show_invoice")}
          </Button>
        </div>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3 space-y-6">
          <Card className="rounded-lg">
            <CardHeader className="flex justify-between items-center px-6 py-4">
              <h3 className="text-xl font-semibold">{t("order_items")}</h3>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{t("order_otp")}:</span>
                <span className="text-orange-500 font-bold text-lg">
                  {order.otp}
                </span>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              {order.order_items?.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 border-b border-gray-800 py-4 last:border-0"
                >
                  <Image
                    src={item.image}
                    alt={item.product_name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold">
                      {item.product_name}
                    </h4>
                    <div className="flex gap-4 mt-2 text-gray-400">
                      <span>
                        {t("qty")}: {item.quantity}
                      </span>
                      <span>{formatPrice(Number(item.price))}</span>
                    </div>
                    {/* Add-ons Section */}
                    {item.add_ons?.length > 0 && (
                      <div className="mt-2 text-gray-400 text-sm">
                        <span className="font-medium">{t("add_ons")}:</span>
                        <ul className="list-disc list-inside ml-2">
                          {item.add_ons.map((addon, addonIndex) => (
                            <li key={addonIndex}>
                              {addon.title} -{formatPrice(Number(addon.price))}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Chip
                    startContent={getStatusIcon(order.active_status)}
                    color={
                      order.active_status === "pending"
                        ? "warning"
                        : order.active_status === "preparing" ||
                            order.active_status === "confirmed"
                          ? "warning"
                          : order.active_status === "delivered"
                            ? "success"
                            : order.active_status === "cancelled"
                              ? "danger"
                              : order.active_status === "out_for_delivery"
                                ? "primary"
                                : "neutral"
                    }
                    size="sm"
                    className="rounded text-xs"
                    variant="flat"
                  >
                    <span className="font-semibold">
                      {formatStatus(order.active_status)}
                    </span>
                  </Chip>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Rider Information */}
          {order?.is_self_pick_up == "0" && (
            <Card className="rounded-lg">
              <CardHeader className="px-6 py-4">
                <h3 className="text-xl font-semibold">
                  {t("rider_information")}
                </h3>
              </CardHeader>
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar src={order?.rider_image} className="w-16 h-16" />
                    <div>
                      <p className="text-gray-400">{t("rider_name")}:</p>
                      <p className="text-lg font-semibold">
                        {order.rider_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <RiStarFill className="text-yellow-500 text-xl" />
                    <span className="text-lg">{order.rider_rating ?? 0}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right Column - Delivery Details & Payment */}
        <div className="w-full lg:w-1/3 space-y-6">
          {/* Delivery Details */}
          <Card className="rounded-lg  ">
            <CardHeader className="px-6 py-4">
              <h3 className="text-xl font-semibold">{t("delivery_details")}</h3>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <p className=" leading-relaxed">{order.address}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <RiPhoneLine className="text-gray-400 text-xl" />
                  <span>{order.user_mobile}</span>
                </div>
                <div className="flex items-center gap-3">
                  <RiMailLine className="text-gray-400 text-xl" />
                  <span>{order.user_email}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Payment Summary */}
          <Card className="rounded-lg  ">
            <CardHeader className="px-6 py-4">
              <h3 className="text-xl font-semibold"> {t("payment_summary")}</h3>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>{t("total_price")}</span>
                  <span className="font-semibold">
                    {formatPrice(
                      order.payment_method === "wallet"
                        ? Number(order.wallet_balance)
                        : Number(order.total_payable)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{t("taxes_and_charges")}</span>
                  <span>{formatPrice(Number(order.total_tax_amount))}</span>
                </div>
                {order?.is_self_pick_up == "0" && (
                  <div className="flex justify-between text-gray-400">
                    <span>{t("delivery_charge")}</span>
                    <span>{formatPrice(order.delivery_charge)}</span>
                  </div>
                )}
                {order.delivery_tip > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span> {t("delivery_partner_tip")}</span>
                    <span>{formatPrice(order.delivery_tip)}</span>
                  </div>
                )}
                {order.promo_discount > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span> {t("coupon_discount")}</span>
                    <span>{formatPrice(order.promo_discount)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-800 flex justify-between text-gray-400">
                  <span>{t("payment_method")}</span>
                  <span>{order.payment_method}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
