import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  cn,
  Divider,
  Image,
  Input,
  Radio,
  RadioGroup,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  get_delivery_charges,
  getUserAddress,
  removeFromCart,
} from "../interceptor/routes";
import {
  add_to_cart,
  UpdateDeliveryCharges,
  updateDeliveryTip,
  updateUserCart,
} from "../events/actions";
import { toast } from "sonner";
import ProductModal from "../components/Modals/ProductModal";
import QuantitySelector from "../components/QuantitySelector";
import { useRouter } from "next/router";
import CouponModal from "@/components/Modals/CouponModal";
import { setPromoCode } from "@/store/reducers/promoCodeSlice";
import AddressSelector from "@/components/AddressSelector/AddressSelector";
import {
  setCustomTip,
  setCustomTipInputValue,
  setTip,
} from "@/store/reducers/cartSlice";
import TipSelector from "@/components/TipSelector/TipSelector";
import PaymentModal from "@/components/Modals/PaymentModal";
import { setDeliveryAddress } from "@/store/reducers/selectedDeliverySlice";

//  icons

import {
  RiLink,
  RiDeleteBinLine,
  RiCouponLine,
  RiCloseCircleLine,
  RiArrowLeftLine,
  RiPencilLine,
} from "@remixicon/react";
import { setUserAddresses } from "@/store/reducers/userAddressSlice";
import { getUserData } from "@/events/getters";
import DeleteConfirmationModal from "@/components/Modals/DeleteConfirmModal";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/helpers/functionHelper";
import NotFound from "@/components/NotFound/NotFound";
import PhoneCollectionModal from "@/components/Modals/PhoneNumberModal";

const CartView = () => {
  const cartStoreData = useSelector((state) => state.cart);
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState();

  const isLogged = useSelector((state) => state.authentication.isLogged);

  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const [selectedAddressId, setSelectedAddressId] = useState();
  const userAddresses = useSelector((state) => state.userAddresses?.values);
  const router = useRouter();
  const promoCode = useSelector((state) => state.promoCodes?.value[0]);

  const { t } = useTranslation();

  const tipAmount = useSelector((state) => state.cart.tip);
  const customTipAmount = useSelector((state) => state.cart.customTip);

  const customTipInputValue = useSelector(
    (state) => state.cart.customTipInputValue
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const [deliveryType, setDeliveryType] = useState(() => {
    const showDelivery = cartStoreData.data.some(
      (item) =>
        item.product_details?.[0]?.branch_detail?.[0]?.deliver_orders === "1"
    );

    const showPickUp = cartStoreData.data.some(
      (item) =>
        item.product_details?.[0]?.branch_detail?.[0]?.self_pickup === "1"
    );

    if (showDelivery) return "Delivery";
    if (showPickUp) return "Pick Up";

    return "";
  });

  const [deliveryCharges, setDeliveryCharges] = useState(0);

  useEffect(() => {
    if (!isLogged) {
      router.push("/home");
    }
  }, [isLogged, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const branchData = useSelector((state) => state.branch);
  const branch_id = branchData.id;

  const userData = getUserData();
  const userId = userData.id;
  const tip = useSelector((state) => state.cart.tip);
  const customTip = useSelector((state) => state.cart.customTip);

  const [isLoading, setIsLoading] = useState(true);

  const calculateOrderSummary = (items) => {
    const summary = items.reduce(
      (acc, item) => {
        const qty = parseInt(item.qty) || 0;
        const originalPrice = (parseFloat(item.price) || 0) * qty;

        const specialPrice =
          item.special_price && parseFloat(item.special_price) > 0
            ? parseFloat(item.special_price) * qty
            : originalPrice;

        const addonsTotal =
          item.addon_ids?.split(",").reduce((total, addonId) => {
            const addon = item.product_details[0]?.product_add_ons?.find(
              (a) => a.id === addonId
            );

            return total + (addon ? (parseFloat(addon.price) || 0) * qty : 0);
          }, 0) || 0;

        const taxableAmount = specialPrice + addonsTotal;
        const taxPercentage = parseFloat(item.tax_percentage) || 0;
        const tax = (taxableAmount * taxPercentage) / 100;

        return {
          originalTotal: acc.originalTotal + originalPrice,
          specialPriceTotal: acc.specialPriceTotal + specialPrice,
          savings: acc.savings + (originalPrice - specialPrice),
          tax: acc.tax + tax,
          addonsTotal: acc.addonsTotal + addonsTotal,
        };
      },
      {
        originalTotal: 0,
        specialPriceTotal: 0,
        savings: 0,
        tax: 0,
        addonsTotal: 0,
      }
    );

    // Calculate subtotal before coupon
    const subtotalBeforeCoupon =
      summary.specialPriceTotal + summary.addonsTotal;

    // Apply coupon discount if available
    const couponDiscount = parseFloat(promoCode?.final_discount) || 0;
    summary.couponDiscount = couponDiscount;

    // Add tip to the calculation
    const tipAmount = parseFloat(
      cartStoreData.tip || cartStoreData.customTip || 0
    );
    summary.tipAmount = tipAmount;

    // Calculate final total after coupon discount and tip
    const deliveryCharge =
      deliveryType === "Delivery"
        ? parseFloat(deliveryCharges.delivery_charge) || 0
        : 0;

    summary.total =
      subtotalBeforeCoupon +
      summary.tax -
      summary.couponDiscount +
      deliveryCharge +
      (deliveryType === "Delivery" ? summary.tipAmount : 0);

    return summary;
  };

  const orderSummary = calculateOrderSummary(cartStoreData.data || []);

  useEffect(() => {
    // Check if the promo code's minimum order amount requirement is met
    if (promoCode && orderSummary.total < promoCode.minimum_order_amount) {
      console.log("Minimum order amount not met. Removing promo code.");
      dispatch(setPromoCode([]));
    }
  }, [promoCode, orderSummary.total, dispatch]);

  const manageQty = async (
    addons,
    product_variant_id,
    qty,
    cart_id,
    branch_id
  ) => {
    if (qty < 0) toast.error("Quantity can not be less then 0!");
    else {
      add_to_cart({
        product_variant_id,
        qty,
        addons: addons,
        cart_id,
        branch_id,
      });
    }
  };

  const handleQuantityChange = async (itemId, cartId, newQty, addons) => {
    try {
      // Pass the addons string directly to manageQty
      await manageQty(addons, itemId, newQty, cartId, branch_id);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Error updating quantity");
    }
  };

  const handleRemoveItem = async (id, cart_id) => {
    try {
      const removeItem = await removeFromCart({
        branch_id,
        product_variant_id: id,
        cart_id,
      });
      if (removeItem.error) {
        toast.error(removeItem.message);
      } else {
        updateUserCart();
        toast.success(removeItem.message);
      }
    } catch (error) {
      console.log("error while removing item from cart:", error);
      toast.error("Failed to remove item");
    }
  };

  useEffect(() => {
    UpdateDeliveryCharges(deliveryCharges);

    if (tipAmount !== "Other") {
      updateDeliveryTip(tipAmount);
    } else {
      updateDeliveryTip(customTipAmount);
    }
  }, [deliveryCharges, tipAmount, customTipAmount]);

  useEffect(() => {
    const showDelivery = cartStoreData.data.some(
      (item) =>
        item.product_details?.[0]?.branch_detail?.[0]?.deliver_orders === "1"
    );

    const showPickUp = cartStoreData.data.some(
      (item) =>
        item.product_details?.[0]?.branch_detail?.[0]?.self_pickup === "1"
    );

    if (deliveryType === "") {
      if (showDelivery) setDeliveryType("Delivery");
      else if (showPickUp) setDeliveryType("Pick Up");
    }
  }, [cartStoreData.data]); 

  useEffect(() => {
    const fetchDeliveryCharges = async () => {
      if (deliveryType === "Delivery" && selectedAddressId) {
        try {
          const charges = await get_delivery_charges({
            address_id: selectedAddressId,
            final_total: cartStoreData.overall_amount,
          });
          setDeliveryCharges(charges);
        } catch (error) {
          console.error("Error fetching delivery charges:", error);
          setDeliveryCharges(0);
        }
      } else {
        setDeliveryCharges(0);
      }
    };

    fetchDeliveryCharges();
  }, [deliveryType, selectedAddressId, cartStoreData.overall_amount]);

  useEffect(() => {
    updateUserCart();
  }, [cartStoreData.overall_amount]);

  const isDeliveryAvailable = cartStoreData.data.some(
    (item) =>
      item.product_details?.[0]?.branch_detail?.[0]?.deliver_orders === "1"
  );

  const isPickUpAvailable = cartStoreData.data.some(
    (item) => item.product_details?.[0]?.branch_detail?.[0]?.self_pickup === "1"
  );

  if (!mounted) return null;

  const hasAnySpecialPrice = cartStoreData.data?.some(
    (item) => item.special_price && parseFloat(item.special_price) > 0
  );

  const handleTipChange = (amount) => {
    dispatch(setTip({ tip: amount }));
  };

  const handleCustomTipChange = (amount) => {
    dispatch(setCustomTip({ customTip: amount }));
  };

  const handleCustomTipInputChange = (value) => {
    dispatch(setCustomTipInputValue({ customTipInputValue: value }));
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const selectedAddress = userAddresses.find((addr) => addr.id === addressId);
    dispatch(setDeliveryAddress(selectedAddress));
  };

  const handleRemoveTip = () => {
    dispatch(setTip({ tip: 0 }));
    dispatch(setCustomTip({ customTip: 0 }));
    dispatch(setCustomTipInputValue({ customTipInputValue: "" }));
  };

  // checking the cart is empty and not

  if (!cartStoreData.data || cartStoreData.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <NotFound text={t("your_cart_is_empty")} />
        <Link
          href="/products"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
        >
          {t("continue_shopping")}
        </Link>
      </div>
    );
  }

  const handleCheckoutClick = () => {
    if (!userData.mobile && userData.type == "google") {
      setShowPhoneModal(true);
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  return (
    <div className="mx-auto">
      <Divider className="my-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <RadioGroup
            value={deliveryType}
            onChange={(e) => setDeliveryType(e.target.value)}
            orientation="horizontal"
            className="flex justify-center sm:justify-start gap-6 sm:gap-8"
          >
            <Radio
              value="Delivery"
              color="primary"
              isDisabled={!isDeliveryAvailable}
              classNames={{
                base: cn(
                  "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                  "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border dark:border-gray-500",
                  "data-[selected=true]:border-primary dark:data-[selected=true]:border-primary"
                ),
              }}
            >
              {t("delivery")}
            </Radio>
            <Radio
              value="Pick Up"
              color="primary"
              isDisabled={!isPickUpAvailable}
              classNames={{
                base: cn(
                  "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
                  "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border dark:border-gray-500",
                  "data-[selected=true]:border-primary dark:data-[selected=true]:border-primary"
                ),
              }}
            >
              {t("self_pick")}
            </Radio>
          </RadioGroup>

          <div className="flex justify-between items-center py-4 px-4 border-b border-gray-200 dark:border-gray-500 rounded-t-lg">
            <span className="text-lg font-bold">{t("your_cart")}</span>
            <span className="text-sm text-gray-500">
              {cartStoreData.data?.length ?? 0} Items
            </span>
          </div>

          <Table className="rounded-lg">
            <TableHeader>
              <TableColumn>{t("Product")}</TableColumn>
              <TableColumn>{t("name")}</TableColumn>
              <TableColumn>{t("add_ons")}</TableColumn>
              <TableColumn>Price</TableColumn>
              <TableColumn>Qty</TableColumn>
              <TableColumn>{t("actions")}</TableColumn>
            </TableHeader>
            <TableBody>
              {cartStoreData?.data?.map((item) => {
                const currentVariant = item.product_details[0]?.variants?.find(
                  (variant) => variant.id === item.product_variant_id
                );

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="w-20 object-cover rounded-lg"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Image
                            src={
                              item.product_details[0].indicator === "1"
                                ? "/assets/images/veg.png"
                                : "/assets/images/non-veg.png"
                            }
                            alt={
                              item.product_details[0].indicator === "1"
                                ? "veg"
                                : "non-veg"
                            }
                            className="w-5 h-5 object-cover rounded"
                          />
                          <span className="font-bold text-xl text-gray-800 dark:text-gray-100">
                            {item.name}
                          </span>
                        </div>

                        {currentVariant?.variant_values?.trim() !== "" && (
                          <span className="text-sm mt-1">
                            {currentVariant.variant_values}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {item.addon_ids && (
                        <div className="flex flex-wrap gap-2">
                          {item.addon_ids.split(",").map((addonId) => {
                            const addon =
                              item.product_details[0].product_add_ons.find(
                                (a) => a.id === addonId
                              );
                            return addon ? (
                              <Chip
                                key={addon.id}
                                variant="flat"
                                color="default"
                                size="sm"
                                className="rounded-full"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-primary-600">
                                    {addon.title}
                                  </span>
                                  <span className="text-sm font-bold">
                                    {formatPrice(addon.price)}
                                  </span>
                                </div>
                              </Chip>
                            ) : null;
                          })}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2">
                      {currentVariant ? (
                        currentVariant.special_price &&
                        currentVariant.special_price !== "0" ? (
                          <>
                            <span className="text-lg font-bold text-primary-600">
                              {formatPrice(currentVariant.special_price)}
                            </span>
                            <span className="text-sm text-gray-500 line-through mr-2">
                              {formatPrice(currentVariant.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-primary-600">
                            {formatPrice(currentVariant.price)}
                          </span>
                        )
                      ) : (
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <QuantitySelector
                        key={`${item.product_variant_id}-${item.cart_id}`}
                        initialValue={parseInt(item.qty)}
                        productVariantId={item.product_variant_id}
                        cart_id={item.cart_id}
                        branch_id={branch_id}
                        manageQty={manageQty}
                        onRemoveItem={handleRemoveItem}
                        item={item}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg border px-4 py-2"
                        onQuantityChange={(newQty, addons) =>
                          handleQuantityChange(
                            item.product_variant_id,
                            item.cart_id,
                            newQty,
                            addons
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <DeleteConfirmationModal
                        onConfirmDelete={() =>
                          handleRemoveItem(
                            item.product_variant_id,
                            item.cart_id
                          )
                        }
                      />
                      <ProductModal
                        image={item.image}
                        title={item?.product_details[0]?.name}
                        rating={item?.product_details[0]?.rating}
                        description={
                          item?.product_details[0]?.short_description
                        }
                        variants={item?.product_details[0]?.variants}
                        addOns={item?.product_details[0]?.product_add_ons}
                        simple={item?.product_details[0]?.type}
                        cart={true}
                        buttonText={t("edit")}
                        currentQty={Number(item.qty)}
                        cart_id={item.cart_id}
                        selectedVariantId={item.product_variant_id}
                        selectedAddOnIds={item?.addon_ids}
                        buttonProps={{
                          className:
                            "flex items-center gap-2 btn btn-outline-primary px-4 py-2 rounded-lg hover:bg-primary-500 hover:text-white",
                          variant: "outline",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="lg:col-span-1">
          <div>
            <CouponModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </div>

          <div>
            <PaymentModal
              isOpen={isPaymentModalOpen}
              onClose={() => setIsPaymentModalOpen(false)}
              deliveryType={deliveryType}
              deliveryChargesResponse={deliveryCharges}
              finalTotal={orderSummary.total}
              orderSummary={orderSummary}
              isLocationLoading={isLocationLoading}
            />
          </div>

          <div>
            {deliveryType === "Delivery" && (
              <AddressSelector
                addresses={userAddresses}
                selectedAddressId={selectedAddressId}
                onAddressSelect={handleAddressSelect}
                compact={true}
                showAddNew={true}
                isCartPage={true}
                userId={userId}
                itemsPerPage={2}
              />
            )}
          </div>

          {deliveryType === "Delivery" && (
            <TipSelector
              tip={tipAmount}
              customTip={customTipAmount}
              customTipInputValue={customTipInputValue}
              deliveryType={deliveryType}
              onTipChange={handleTipChange}
              onCustomTipChange={handleCustomTipChange}
              onCustomTipInputChange={handleCustomTipInputChange}
            />
          )}

          <PhoneCollectionModal
            isOpen={showPhoneModal}
            onClose={() => {
              setShowPhoneModal(false);
              const updatedUserData = getUserData();
              if (updatedUserData.mobile) {
                setIsPaymentModalOpen(true);
              }
            }}
          />

          <Card className="p-4 rounded shadow-lg my-4">
            <CardHeader className="text-2xl font-bold mb-6">
              {t("order_summary")}
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex justify-between font-medium">
                <span>{t("sub_total")}</span>
                <span>{formatPrice(cartStoreData.sub_total)}</span>
              </div>

              {promoCode && (
                <div className="space-y-3 pb-4 border-b dark:border-b-gray-500">
                  <div className="flex justify-between items-center text-green-500">
                    <span>{t("coupon_discount")}</span>

                    <div className="flex items-center space-x-2">
                      <span>-{formatPrice(orderSummary.couponDiscount)}</span>

                      <Button
                        isIconOnly
                        onPress={() => dispatch(setPromoCode([]))}
                        variant="light"
                        className="text-danger-500 hover:bg-danger-100 rounded-full p-1 transition-colors"
                      >
                        <RiCloseCircleLine />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 pb-4 border-b dark:border-b-gray-500">
                {orderSummary.tipAmount > 0 && deliveryType == "Delivery" && (
                  <div className="flex justify-between items-center">
                    <span>{t("delivery_partner_tip")}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">
                        {formatPrice(orderSummary.tipAmount)}
                      </span>
                      <Button
                        isIconOnly
                        onPress={handleRemoveTip}
                        variant="light"
                        className="text-danger-500 hover:bg-danger-100 rounded-full p-1 transition-colors"
                      >
                        <RiCloseCircleLine />
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>
                    {t("tax")} ({cartStoreData.data?.[0]?.tax_percentage}%)
                  </span>
                  <span>{formatPrice(cartStoreData.tax_amount)}</span>
                </div>
              </div>

              {deliveryType !== "Pick Up" &&
                deliveryCharges.is_free_delivery === "0" && (
                  <div className="flex justify-between border-b dark:border-b-gray-500 pb-4">
                    <span>{t("delivery_charge")}</span>
                    <span>{formatPrice(deliveryCharges.delivery_charge)}</span>
                  </div>
                )}

              <div className="text-start mt-4">
                <span
                  onClick={() => setIsModalOpen(true)}
                  className="text-primary-600 font-medium hover:text-primary-700 cursor-pointer"
                >
                  {t("coupons")} ?
                </span>
              </div>

              <div className="flex justify-between font-bold text-lg pt-4">
                <span>Total Payable</span>

                <span>{formatPrice(orderSummary.total)}</span>
              </div>
            </CardBody>

            <CardFooter>
              <Button
                className="w-full mt-4 bg-black text-white font-bold rounded-lg hover:bg-gray-900"
                onPress={handleCheckoutClick}
              >
                {t("proceed_to_checkout")}
              </Button>
            </CardFooter>

            <CardFooter className="text-center mt-6">
              <Link
                href="/products"
                className="text-primary-600 font-medium hover:text-primary-700 transition-colors inline-flex items-center gap-2"
              >
                <RiArrowLeftLine className="text-lg" /> {t("continue_shopping")}
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartView;
