import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Divider,
  Checkbox,
  User,
  Chip,
  Avatar,
  Image,
} from "@heroui/react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { get_settings, placeOrder } from "@/interceptor/routes";
import { updateUserCart, updateWalletBalance } from "@/events/actions";
import {
  clearDeliveryAddress,
  setDeliveryAddress,
} from "@/store/reducers/selectedDeliverySlice";
import { getUserData } from "@/events/getters";
import {
  formatPrice,
  getCurrencySymbol,
  getCurrentLocation,
} from "@/helpers/functionHelper";
import {
  setPaymentSettings,
  setUserData,
  updateWalletBalanceInStore,
} from "@/store/reducers/paymentSettingsSlice";
import RazorpayPayment from "../PaymentMethods/RazorpayPayment";
import StripePayment from "../PaymentMethods/StripePayment";
import PaystackPayment from "../PaymentMethods/PaystackPayment";
import { useTranslation } from "react-i18next";
import { RiWallet3Line } from "@remixicon/react";

const PaymentModal = ({
  isOpen,
  onClose,
  deliveryType,
  orderSummary,
  deliveryChargesResponse,
  finalTotal,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [useWallet, setUseWallet] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(0);

  const cartStoreData = useSelector((state) => state.cart);

  const userData = useSelector((state) => state?.paymentSettings?.userData);
  const walletBalance = Number(userData?.balance || 0);
  const isWalletEnabled = walletBalance > 0;

  const is_cod_available = cartStoreData?.data.every(
    (product) => Number(product?.product_details[0]?.cod_allowed) !== 0
  );

  const availablePaymentMethods = useSelector(
    (state) => state.paymentSettings.availablePaymentMethods
  );

  const isWalletSufficient = walletBalance >= finalTotal;

  useEffect(() => {
    if (!isOpen) {
      setSelectedPayment(null);
      setUseWallet(false);
      setRemainingAmount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setLoading(true);
        await updateWalletBalance(true);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        toast.error("Failed to load wallet balance");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchWalletBalance();
    }
  }, [isOpen]);

  useEffect(() => {
    if (useWallet) {
      const remaining = finalTotal - walletBalance;
      setRemainingAmount(remaining > 0 ? remaining : 0);

      if (isWalletSufficient) {
        setSelectedPayment(null);
      }
    } else {
      setRemainingAmount(finalTotal);
    }
  }, [useWallet, finalTotal, walletBalance]);

  const selectedDeliveryAddress = useSelector(
    (state) => state.selectedDeliveryAddress
  )?.value;

  const is_self_pick_up = deliveryType === "Pick Up" ? 1 : 0;
  const branch_id = useSelector((state) => state.branch.id);

  const getFilteredPaymentMethods = () => {
    if (isWalletSufficient && useWallet) {
      return [];
    }

    return availablePaymentMethods.filter((method) =>
      method.id === "cod" ? is_cod_available : true
    );
  };

  const handleWalletToggle = (checked) => {
    if (!isWalletEnabled) return;
    setUseWallet(checked);
    if (!checked) {
      setRemainingAmount(finalTotal);
      setSelectedPayment(null);
    }
  };

  const createOrderData = (paymentMethod) => ({
    branch_id,
    mobile: getUserData().mobile,
    product_variant_id: cartStoreData.variant_id.join(", "),
    quantity: cartStoreData.data.map((item) => item.qty).join(", "),
    total: cartStoreData.overall_amount,
    final_total: useWallet ? remainingAmount : finalTotal,
    latitude: selectedDeliveryAddress?.city_latitude,
    longitude: selectedDeliveryAddress?.city_longitude,
    payment_method: paymentMethod,
    address_id: deliveryType === "Pick Up" ? 0 : selectedDeliveryAddress?.id,
    is_self_pick_up,
    delivery_charge: deliveryChargesResponse.delivery_charge,
    is_wallet_used: useWallet ? 1 : 0,
    wallet_balance_used: useWallet
      ? isWalletSufficient
        ? finalTotal
        : walletBalance
      : 0,
  });

  const handleOrderSuccess = (response) => {
    if (useWallet) {
      updateWalletBalance();
    }
    dispatch(clearDeliveryAddress());
    updateUserCart();
    toast.success(response.message);
    onClose();
  };

  const handlePlaceOrder = async () => {
    if (deliveryType === "Delivery" && !selectedDeliveryAddress) {
      toast.error("Please select a delivery address before proceeding!");
      return;
    }

    if (!useWallet && !selectedPayment) {
      toast.error("Please select a payment method!");
      return;
    }

    if (useWallet && !isWalletSufficient && !selectedPayment) {
      toast.error("Please select a payment method for the remaining amount!");
      return;
    }

    setLoading(true);
    try {
      const paymentMethod =
        isWalletSufficient && useWallet ? "wallet" : selectedPayment;
      const orderData = createOrderData(paymentMethod);
      const response = await placeOrder(orderData);

      if (response.error) {
        throw new Error(response.message);
      }

      handleOrderSuccess(response);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentOnline = async () => {
    if (deliveryType === "Delivery" && !selectedDeliveryAddress) {
      toast.error("Please select a delivery address before proceeding!");
      return;
    }

    const btn = document.getElementById(`${selectedPayment}-button`);
    btn?.click();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      size="lg"
      backdrop="blur"
      className="rounded-xl"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
    >
      <ModalContent className="md:max-h-none md:overflow-visible max-h-[90vh] overflow-y-auto">
        <ModalHeader className="text-2xl font-semibold mb-2">
          {t("order_summary")}
        </ModalHeader>
        <ModalBody className="space-y-0">
          <Card className="rounded border dark:border-gray-500">
            <CardBody className="space-y-4">
              <div className="flex justify-between">
                <span>{t("sub_total")}</span>
                <span className="font-semibold">
                  {formatPrice(
                    orderSummary.specialPriceTotal + orderSummary.addonsTotal
                  )}
                </span>
              </div>
              {deliveryType !== "Pick Up" &&
                deliveryChargesResponse.is_free_delivery === "0" && (
                  <div className="flex justify-between border-b dark:border-b-gray-500 pb-3">
                    <span>{t("delivery_charge")}</span>
                    <span>
                      {formatPrice(deliveryChargesResponse.delivery_charge)}
                    </span>
                  </div>
                )}
              {orderSummary.tax > 0 && (
                <div className="flex justify-between">
                  <span>{t("tax")}</span>
                  <span className="font-semibold">
                    {formatPrice(orderSummary.tax)}
                  </span>
                </div>
              )}
              {orderSummary.couponDiscount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>{t("coupon_discount")}</span>
                  <span>-{formatPrice(orderSummary.couponDiscount)}</span>
                </div>
              )}
              {orderSummary.tipAmount > 0 && (
                <div className="flex justify-between">
                  <span>{t("tip")}</span>
                  <span className="font-semibold">
                    {formatPrice(orderSummary.tipAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-lg font-semibold">
                <span>Total Payable</span>
                <span className="font-bold text-xl">
                  {formatPrice(finalTotal)}
                </span>
              </div>

              {useWallet && !isWalletSufficient && (
                <div className="flex justify-between ">
                  <span>Remaining Amount</span>
                  <span className="font-bold">
                    {formatPrice(remainingAmount)}
                  </span>
                </div>
              )}
            </CardBody>
          </Card>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold">
              {t("select_payment_method")}
            </h3>

            {/* Wallet Option */}
            <Checkbox
              isSelected={useWallet}
              onValueChange={handleWalletToggle}
              isDisabled={!isWalletEnabled}
              classNames={{
                base: "inline-flex w-full max-w-md items-center justify-start cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent data-[selected=true]:border-primary",
                label: "w-full",
              }}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <RiWallet3Line size={24} className="text-primary" />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="font-semibold">Wallet</span>
                  <span className="text-sm text-gray-500">
                    Available Balance:
                    {formatPrice(walletBalance)}
                  </span>
                </div>
              </div>
            </Checkbox>

            {/* Other Payment Methods */}
            {(!useWallet || !isWalletSufficient) && (
              <div className="space-y-3">
                {getFilteredPaymentMethods().map((option) => (
                  <Checkbox
                    key={option.id}
                    isSelected={selectedPayment === option.id}
                    onValueChange={() => setSelectedPayment(option.id)}
                    aria-label={option.name}
                    classNames={{
                      base: "inline-flex w-full max-w-md items-center justify-start cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent data-[selected=true]:border-primary",
                      label: "w-full",
                    }}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar
                        src={option.icon}
                        alt={option.name}
                        size="lg"
                        className="w-14 h-14 rounded-lg"
                      />
                      <div className="flex flex-col justify-center">
                        <span className="font-semibold">{option.name}</span>
                        <span className="text-sm text-gray-500">
                          {option.description}
                        </span>
                      </div>
                    </div>
                  </Checkbox>
                ))}
              </div>
            )}
          </div>
        </ModalBody>

        {/* Payment Gateway Components */}
        {selectedPayment === "razorpay" && (
          <RazorpayPayment
            finalTotal={useWallet ? remainingAmount : finalTotal}
            cartStoreData={cartStoreData}
            deliveryType={deliveryType}
            selectedDeliveryAddress={selectedDeliveryAddress}
            deliveryChargesResponse={deliveryChargesResponse}
            branch_id={branch_id}
            is_self_pick_up={is_self_pick_up}
            onClose={onClose}
            paymentMethodDetails={availablePaymentMethods.find(
              (method) => method.id === selectedPayment
            )}
            type="placeOrder"
            isWalletUsed={useWallet}
            walletAmountUsed={
              useWallet ? (isWalletSufficient ? finalTotal : walletBalance) : 0
            }
          />
        )}

        {selectedPayment === "stripe" && (
          <StripePayment
            finalTotal={useWallet ? remainingAmount : finalTotal}
            cartStoreData={cartStoreData}
            deliveryType={deliveryType}
            selectedDeliveryAddress={selectedDeliveryAddress}
            deliveryChargesResponse={deliveryChargesResponse}
            branch_id={branch_id}
            is_self_pick_up={is_self_pick_up}
            onClose={onClose}
            paymentMethodDetails={availablePaymentMethods.find(
              (method) => method.id === selectedPayment
            )}
            type="placeOrder"
            isWalletUsed={useWallet}
            walletAmountUsed={
              useWallet ? (isWalletSufficient ? finalTotal : walletBalance) : 0
            }
          />
        )}

        {selectedPayment === "paystack" && (
          <PaystackPayment
            finalTotal={useWallet ? remainingAmount : finalTotal}
            cartStoreData={cartStoreData}
            deliveryType={deliveryType}
            selectedDeliveryAddress={selectedDeliveryAddress}
            deliveryChargesResponse={deliveryChargesResponse}
            branch_id={branch_id}
            is_self_pick_up={is_self_pick_up}
            onClose={onClose}
            paymentMethodDetails={availablePaymentMethods.find(
              (method) => method.id === selectedPayment
            )}
            type="placeOrder"
            isWalletUsed={useWallet}
            walletAmountUsed={
              useWallet ? (isWalletSufficient ? finalTotal : walletBalance) : 0
            }
          />
        )}

        <ModalFooter className="pt-4">
          <Button
            variant="light"
            onPress={onClose}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>

          {(useWallet || selectedPayment) && (
            <>
              {(useWallet && isWalletSufficient) ||
              selectedPayment === "cod" ? (
                <Button
                  className="bg-primary-500 text-white w-full sm:w-auto rounded-lg mt-2 sm:mt-0"
                  onPress={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              ) : (
                selectedPayment && (
                  <Button
                    className="bg-primary-500 text-white w-full sm:w-auto rounded-lg mt-2 sm:mt-0"
                    disabled={loading}
                    onPress={handlePaymentOnline}
                  >
                    {loading ? "Processing..." : "Pay Now"}
                  </Button>
                )
              )}
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PaymentModal;
