import React, { useState } from "react";
import { Modal, ModalContent, Input, Button } from "@heroui/react";
import { get_settings, send_withdraw_request } from "@/interceptor/routes";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { getUserData } from "@/events/getters";
import { setUserSettings } from "@/store/reducers/settingsSlice";
import { useTranslation } from "react-i18next";

const WithDrawModal = ({ isOpen, onOpenChange }) => {

    const { t } = useTranslation();
  
  // State for form inputs
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(0);
  const [paymentAddress, setPaymentAddress] = useState("");

  const dispatch = useDispatch();
  const userData = getUserData();
  const user_id = userData.id;
  
  const getUserSettings = async () => {
    const userSettings = await get_settings({ user_id });
    dispatch(setUserSettings(userSettings.data));
  };


  const handleWithdraw = async () => {
    if (amount <= 0) {
      return toast.error("Amount must not be less than or equal 0!");
    }
    if (paymentAddress === "") {
      return toast.error("Payment Address field is required");
    }
    
    const sendRequest = await send_withdraw_request({
      amount,
      payment_address: paymentAddress,
    });

    if (sendRequest.error) {
      toast.error(sendRequest.message);
    } else {
      toast.success(sendRequest.message);
      onOpenChange(false);
      getUserSettings();
      setAmount(0);
      setPaymentAddress("");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setAmount("");
          setPaymentAddress("");
        }
      }}
      placement="auto"
      backdrop="blur"
      className="rounded"
    >
      <ModalContent className="p-6">
        <h2 className="text-xl font-bold mb-4">{t("withdraw_funds")}</h2>
        <div className="space-y-4">
          {/* Payment Address Input */}
          <Input
            label="Payment Address"
            value={paymentAddress}
            onChange={(e) => setPaymentAddress(e.target.value)}
            placeholder="Enter your payment address"
            required
          />

          {/* Amount Input */}
          <Input
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to withdraw"
            type="number"
            min="1"
            required
          />
        </div>
        <div className="flex justify-end mt-6 space-x-4">
          <Button
            variant="ghost"
            color="default"
            onPress={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            variant="solid"
            color="primary"
            onPress={handleWithdraw}
            
          >
            {t("withdraw")}
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default WithDrawModal;
