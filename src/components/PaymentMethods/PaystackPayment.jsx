import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { placeOrder, addTransaction } from "@/interceptor/routes";
import { clearDeliveryAddress } from "@/store/reducers/selectedDeliverySlice";
import { updateUserCart, updateWalletBalance } from "@/events/actions";
import { getUserData } from "@/events/getters";
import { generateOrderId } from "@/helpers/functionHelper";

const PaystackPayment = ({
  finalTotal,
  cartStoreData,
  deliveryType,
  selectedDeliveryAddress,
  deliveryChargesResponse,
  branch_id,
  is_self_pick_up,
  onClose,
  paymentMethodDetails,
  type = "placeOrder",
  amount,
  message,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const paymentMethods = useSelector(
    (state) => state.paymentSettings.availablePaymentMethods
  );

  const paystackMethod = paymentMethods.find(
    (method) => method.id === "paystack"
  );

  if (!paymentMethodDetails) {
    toast.error("Paystack payment method is not configured");
    return null;
  }

  const handlePaystackSuccessAction = async (reference) => {
    setLoading(true);
    try {
      const userData = getUserData();
      let orderId;

      if (type === "wallet") {
        if (!amount || amount <= 0) {
          toast.error("Please enter a valid recharge amount");
          return;
        }

        const orderIdResponse = await generateOrderId();
        if (orderIdResponse.error) {
          throw new Error(orderIdResponse.message);
        }
        orderId = orderIdResponse;

        const res = {
          transaction_type: "wallet",
          order_id: orderId,
          type: "credit",
          payment_method: "paystack",
          txn_id: reference.reference,
          amount,
          status: "Success",
          message: message,
        };

        await addTransaction(res);
        updateWalletBalance();
        toast.success("Wallet Recharged Successfully");
        onClose();
      } else {
        const orderData = {
          branch_id,
          mobile: userData.mobile,
          product_variant_id: cartStoreData.variant_id.join(", "),
          quantity: cartStoreData.data
            .map((document) => document.qty)
            .join(", "),
          total: cartStoreData.overall_amount,
          final_total: finalTotal,
          latitude: selectedDeliveryAddress?.city_latitude,
          longitude: selectedDeliveryAddress?.city_longitude,
          payment_method: "paystack",
          payment_reference: reference.reference,
          address_id:
            deliveryType === "Pick Up" ? 0 : selectedDeliveryAddress?.id,
          is_self_pick_up,
          delivery_charge: deliveryChargesResponse.delivery_charge,
        };

        const response = await placeOrder(orderData);

        if (response.error) {
          throw new Error(response.message);
        }

        orderId = response.order_id;
        dispatch(clearDeliveryAddress());
        updateUserCart();
        toast.success("Order placed successfully");
        onClose();
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    try {
      const paystack = window.PaystackPop.setup({
        key: paymentMethodDetails.keyId,
        email: getUserData().email,
        amount: Math.round((type === "wallet" ? amount : finalTotal) * 100),
        onClose: () => {
          toast.info("Payment window closed");
        },
        callback: (response) => {
          handlePaystackSuccessAction(response);
        },
      });

      paystack.openIframe();
    } catch (error) {
      console.error("Paystack initialization error:", error);
      toast.error("Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  if (scriptError) {
    return (
      <div className="w-full flex justify-center my-4">
        <div className="text-red-500">
          Failed to load payment system. Please refresh the page or try again
          later.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <button
        id="paystack-button"
        onClick={handlePayment}
        className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed hidden"
      >
        {loading
          ? "Processing..."
          : !scriptLoaded
            ? "Loading..."
            : type === "wallet"
              ? "Recharge Wallet"
              : "Pay with Paystack"}
      </button>
    </div>
  );
};

export default PaystackPayment;
