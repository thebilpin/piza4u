import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import {
  addTransaction,
  paymentIntentGenerator,
  placeOrder,
} from "@/interceptor/routes";
import { getUserData } from "@/events/getters";
import { generateOrderId, getCurrencySymbol } from "@/helpers/functionHelper";
import { clearDeliveryAddress } from "@/store/reducers/selectedDeliverySlice";
import {
  deleteOrderHandler,
  updateUserCart,
  updateWalletBalance,
} from "@/events/actions";

const StripePaymentForm = ({
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
  amount = 0,
  message,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const currency = getCurrencySymbol();

  const handleStripePayment = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe has not loaded properly");
      return;
    }

    if (type === "wallet") {
      if (!amount || amount <= 0) {
        toast.error("Please enter a valid recharge amount!");
        return;
      }
    }

    if (!paymentMethodDetails) {
      toast.error("Stripe payment method is not configured");
      return;
    }

    if (type === "placeOrder") {
      if (
        deliveryType !== "Pick Up" &&
        (!selectedDeliveryAddress || !selectedDeliveryAddress.isValid)
      ) {
        toast.error("Delivery is not available for the selected address");
        return;
      }
    }

    setLoading(true);
    let order_id;

    try {
      if (type === "wallet") {
        // Generate a unique order ID for wallet recharge
        order_id = generateOrderId();
      } else if (type === "placeOrder") {
        // Existing order placement logic
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
          payment_method: "stripe",
          address_id:
            deliveryType === "Pick Up" ? 0 : selectedDeliveryAddress?.id,
          is_self_pick_up,
          delivery_charge: deliveryChargesResponse.delivery_charge,
        };

        const orderResponse = await placeOrder(orderData);
        order_id = orderResponse.order_id;

        if (orderResponse.error || !orderResponse.order_id) {
          toast.error(orderResponse.message);
          setLoading(false);
          return;
        }
      }

      // Create Payment Intent
      const paymentIntentResponse = await paymentIntentGenerator({
        order_id: order_id,
        type: "stripe",
        amount: type === "wallet" ? amount : finalTotal,
        transaction_type: type,
      });

      const clientSecret = paymentIntentResponse.data.client_secret;

      if (!clientSecret) {
        throw new Error("Failed to retrieve client secret from payment intent");
      }

      // Confirm Card Payment
      const cardElement = elements.getElement(CardElement);

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: getUserData().name,
            email: getUserData().email,
            phone: getUserData().mobile,
          },
        },
      });

      if (result.error) {
        try {
          if (type == "placeOrder") {
            toast.error("Payment Failed");
            deleteOrderHandler(order_id);
            return;
          }
        } catch (deleteError) {
          console.error("Error deleting order:", deleteError);
          toast.error("Error deleting order: " + deleteError.message);
          if (type == "placeOrder") {
            await deleteOrderHandler(ORDER_ID);
          }
        } finally {
        }

        return;
      }

      const paymentIntent = result.paymentIntent;
      const txn_id = result.paymentIntent.id;

      // Verify payment status
      if (paymentIntent && paymentIntent.status === "succeeded") {
        const transaction = await addTransaction({
          transaction_type: type === "placeOrder" ? "transaction" : "wallet",
          order_id,
          type: type === "placeOrder" ? "stripe" : "credit",
          payment_method: "stripe",
          txn_id,
          amount: type === "wallet" ? amount : finalTotal,
          status: "Pending",
          message: message,
          skip_verify_transaction: true,
        });

        if (type === "placeOrder") {
          toast.success("Payment successful and order placed!");
          dispatch(clearDeliveryAddress());
          updateUserCart();
          onClose();
        }

        if (type === "wallet") {
          toast.success("Amount Successfully Credited in your Wallet");
          updateWalletBalance();
          onClose();
        }
      } else {
        toast.error(`Payment status: ${paymentIntent?.status || "Unknown"}`);
      }
    } catch (error) {
      console.error("Payment Processing Error:", error);
      toast.error(error.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleStripePayment} className="space-y-4">
      <div className="p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      <button
        id="stripe-button"
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-gray-200 py-2 rounded hidden"
      >
        {loading
          ? "Processing..."
          : `Pay ${currency} ${type === "wallet" ? amount : finalTotal}`}
      </button>
    </form>
  );
};

const StripePayment = (props) => {
  const [stripeInstance, setStripeInstance] = useState(null);

  useEffect(() => {
    const initializeStripe = async () => {
      if (props.paymentMethodDetails?.publishableKey) {
        try {
          const stripe = await loadStripe(
            props.paymentMethodDetails.publishableKey
          );
          setStripeInstance(stripe);
        } catch (error) {
          console.error("Failed to load Stripe:", error);
          toast.error("Failed to initialize Stripe payment");
        }
      }
    };

    initializeStripe();
  }, [props.paymentMethodDetails?.publishableKey]);

  if (!stripeInstance) {
    return (
      <div className="p-4 text-center">Initializing Stripe Payment...</div>
    );
  }

  return (
    <Elements stripe={stripeInstance}>
      <StripePaymentForm {...props} />
    </Elements>
  );
};

export default StripePayment;
