import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
  Avatar,
  Textarea,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import StripePayment from "../PaymentMethods/StripePayment";
import RazorpayPayment from "../PaymentMethods/RazorpayPayment";
import PaystackPayment from "../PaymentMethods/PaystackPayment";
import { useTranslation } from "react-i18next";
import { getCurrencySymbol } from "@/helpers/functionHelper";
import {
  setError,
  setPaymentSettings,
} from "@/store/reducers/paymentSettingsSlice";
import { get_settings } from "@/interceptor/routes";
import { getUserData } from "@/events/getters";

const WalletRechargeModal = ({ isOpen, onOpenChange }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const currency = useSelector((state) => state.settings.value.currency);
  const dispatch = useDispatch();

  const availablePaymentMethods = useSelector(
    (state) => state.paymentSettings.availablePaymentMethods
  );

  const paymentMethodsMap = Object.fromEntries(
    availablePaymentMethods.map((method) => [method.id, method])
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedPayment(null);
      setRechargeAmount("");
      setMessage("");
      setMessageError(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        setLoading(true);
        const userData = getUserData();

        const response = await get_settings({
          type: "payment_method",
          user_id: userData?.id,
        });

        dispatch(setPaymentSettings(response.data));
      } catch (error) {
        console.error("Error fetching payment settings:", error);
        dispatch(setError(error.message));
        toast.error("Failed to load payment methods");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPaymentSettings();
    }
  }, [isOpen, dispatch]);

  const handlePaymentOnline = async () => {
    if (!rechargeAmount || rechargeAmount <= 0) {
      toast.error("Please enter a valid amount!");
      return;
    }

    if (!message?.trim()) {
      setMessageError(true);
      toast.error("Please enter a message!");
      return;
    }

    if (!selectedPayment) {
      toast.error("Please select a payment method!");
      return;
    }

    const btn = document.getElementById(`${selectedPayment}-button`);
    btn?.click();
  };

  const handleRechargeAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setRechargeAmount(Number(value));
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    setMessageError(!value?.trim());
  };

  const handlePaymentMethodSelect = (methodId) => {
    if (!message?.trim()) {
      setMessageError(true);
      toast.error("Please enter a message first!");
      return;
    }
    setSelectedPayment(methodId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      backdrop="blur"
      className="rounded"
      isDismissable={false}
      isKeyboardDismissDisabled={false}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("recharge_wallet")}
            </ModalHeader>
            <ModalBody>
              <Input
                isRequired
                label="Recharge Amount"
                placeholder="Enter amount"
                type="number"
                value={rechargeAmount}
                onChange={handleRechargeAmountChange}
                min="0"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">
                      {currency}
                    </span>
                  </div>
                }
              />
              <p className="text-sm text-gray-500">
                {t("enter_amount_wallet")}
              </p>
              <Textarea
                isRequired
                isClearable
                className="max-w-md"
                label="Message"
                labelPlacement="inside"
                value={message}
                onChange={handleMessageChange}
                isInvalid={messageError}
                errorMessage={messageError ? "Message is required" : ""}
              />
              <div className="space-y-3">
                {availablePaymentMethods
                  .filter((option) => option?.id !== "cod")
                  .map((option) => (
                    <Checkbox
                      key={option.id}
                      aria-label={option.name}
                      classNames={{
                        base: "inline-flex w-full max-w-md items-center justify-start cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent data-[selected=true]:border-primary",
                        label: "w-full",
                      }}
                      isSelected={selectedPayment === option.id}
                      onValueChange={() => handlePaymentMethodSelect(option.id)}
                      isDisabled={!message?.trim()}
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
            </ModalBody>

            {selectedPayment === "stripe" && (
              <StripePayment
                type="wallet"
                finalTotal={rechargeAmount}
                amount={rechargeAmount}
                paymentMethodDetails={paymentMethodsMap["stripe"]}
                onClose={() => onOpenChange(false)}
                message={message}
              />
            )}

            {selectedPayment === "razorpay" && (
              <RazorpayPayment
                type="wallet"
                finalTotal={rechargeAmount}
                amount={rechargeAmount}
                paymentMethodDetails={paymentMethodsMap["razorpay"]}
                onClose={() => onOpenChange(false)}
                message={message}
              />
            )}

            {selectedPayment === "paystack" && (
              <PaystackPayment
                type="wallet"
                finalTotal={rechargeAmount}
                amount={rechargeAmount}
                paymentMethodDetails={paymentMethodsMap["paystack"]}
                onClose={() => onOpenChange(false)}
                message={message}
              />
            )}

            <ModalFooter>
              <Button
                variant="light"
                onPress={onClose}
                className="w-full sm:w-auto"
              >
                {t("cancel")}
              </Button>
              <Button
                className="bg-primary-500 text-white w-full sm:w-auto rounded-lg mt-2 sm:mt-0"
                disabled={loading || !selectedPayment || !rechargeAmount || !message?.trim()}
                onPress={handlePaymentOnline}
              >
                {loading ? "Processing..." : "Recharge"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default WalletRechargeModal;