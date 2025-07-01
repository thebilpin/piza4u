import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  placeOrder,
  razorpay_create_order,
  addTransaction,
} from "@/interceptor/routes";
import { getUserData } from "@/events/getters";
import { clearDeliveryAddress } from "@/store/reducers/selectedDeliverySlice";
import {
  deleteOrderHandler,
  updateUserCart,
  updateWalletBalance,
} from "@/events/actions";
import { generateOrderId } from "@/helpers/functionHelper";
import { Button } from "@heroui/button";

const RazorpayPayment = ({
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
  isWalletUsed,
  walletAmountUsed,
}) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (type === "placeOrder") {
      if (deliveryType === "Delivery" && !selectedDeliveryAddress) {
        toast.error("Please select a delivery address before proceeding!");
        return;
      }
    } else if (type === "wallet") {
      if (!amount || amount <= 0) {
        toast.error("Please enter a valid recharge amount!");
        return;
      }
    }

    setLoading(true);

    let transactionData;

    try {
      let order_id;
      let razorpayOrderResponse;

      if (type === "wallet") {
        order_id = generateOrderId();
        razorpayOrderResponse = await razorpay_create_order({
          order_id,
          amount: amount * 100,
        });

        transactionData = {
          transaction_type: "wallet",
          order_id,
          type: "credit",
          payment_method: "razorpay",
          txn_id: null,
          amount,
          status: "pending",
          message: "Wallet Recharge",
          skip_verify_transaction: true,
        };
      } else {
        // Place the order first with wallet information
        const orderData = {
          branch_id,
          mobile: getUserData().mobile,
          product_variant_id: cartStoreData.variant_id.join(", "),
          quantity: cartStoreData.data
            .map((document) => document.qty)
            .join(", "),
          total: cartStoreData.overall_amount,
          final_total: finalTotal,
          latitude: selectedDeliveryAddress?.city_latitude,
          longitude: selectedDeliveryAddress?.city_longitude,
          payment_method: "razorpay",
          address_id:
            deliveryType === "Pick Up" ? 0 : selectedDeliveryAddress?.id,
          is_self_pick_up,
          delivery_charge: deliveryChargesResponse.delivery_charge,
          is_wallet_used: isWalletUsed ? 1 : 0,
          wallet_balance_used: walletAmountUsed || 0,
        };

        const placeOrderResponse = await placeOrder(orderData);

        if (placeOrderResponse.error) {
          toast.error(placeOrderResponse.message);
          if (placeOrderResponse.order_id) {
            await deleteOrderHandler(placeOrderResponse.order_id);
          }
          return;
        }

        order_id = placeOrderResponse.order_id;

        // Create Razorpay order for remaining amount
        razorpayOrderResponse = await razorpay_create_order({
          order_id,
          amount: finalTotal * 100,
        });
      }

      if (razorpayOrderResponse.error) {
        toast.error("Razorpay creation failed");
        await deleteOrderHandler(order_id);
        return;
      }

      const userData = getUserData();

      const options = {
        key: paymentMethodDetails.keyId,
        amount: Math.round((type === "wallet" ? amount : finalTotal) * 100),
        currency: "INR",
        name: "Your Company Name",
        description: type === "wallet" ? "Wallet Recharge" : "Product Purchase",
        order_id: razorpayOrderResponse.id,
        modal: {
          escape: false,
          ondismiss: function () {
            if (type == "placeOrder") {
              deleteOrderHandler(order_id, true);
            } else {
              toast.error("Payment Failed for Wallet!");
            }

            document.body.style.overflow = "auto";
          },
        },
        handler: async (response) => {
          try {
            if (type === "wallet") {
              await addTransaction({
                ...transactionData,
                txn_id: response.razorpay_payment_id,
                status: "Success",
                message: message,
              });
              updateWalletBalance();
              toast.success("Wallet recharge successful!");
            } else {
              if (isWalletUsed) {
                updateWalletBalance();
              }
              dispatch(clearDeliveryAddress());
              updateUserCart();
              toast.success("Payment Successful!");
            }
            onClose();
          } catch (error) {
            toast.error(error.message);
            console.error(error);

            if (order_id) {
              await deleteOrderHandler(order_id);
            }
          }
        },
        prefill: {
          name: userData?.name || "",
          email: userData?.email || "",
          contact: userData?.mobile || "",
        },
        notes: {
          order_id: order_id,
          wallet_used: isWalletUsed ? "yes" : "no",
          wallet_amount: walletAmountUsed || 0,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay Payment Error:", error);
      toast.error(error.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <Button
      id="razorpay-button"
      onPress={handlePayment}
      disabled={loading}
      className="w-full py-2 rounded disabled:opacity-50 hidden"
    >
      {loading
        ? "Processing..."
        : type === "wallet"
          ? "Recharge Wallet"
          : "Pay with Razorpay"}
    </Button>
  );
};

export default RazorpayPayment;
