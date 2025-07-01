import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  availablePaymentMethods: [],
  currencyCodes: {},
  error: null,
  userData: null,
};

const paymentSettingsSlice = createSlice({
  name: "paymentSettings",
  initialState,
  reducers: {
    setPaymentSettings: (state, action) => {
      const { payment_method } = action.payload;

      const availablePaymentMethods = [
        {
          id: "stripe",
          name: "Stripe",
          isEnabled: payment_method.stripe_payment_method === "1",
          icon: "/stripe.svg",
          description: "Pay securely with Stripe",
          mode: payment_method.stripe_payment_mode,
          currencyCode: payment_method.stripe_currency_code,
          publishableKey: payment_method.stripe_publishable_key,
        },
        {
          id: "razorpay",
          name: "Razorpay",
          isEnabled: payment_method.razorpay_payment_method === "1",
          icon: "/razorpay.png",
          description: "Quick payments with Razorpay",
          keyId: payment_method.razorpay_key_id,
        },
        {
          id: "paystack",
          name: "Paystack",
          isEnabled: payment_method.paystack_payment_method === "1",
          icon: "/paystack.svg",
          description: "Secure payments via Paystack",
          keyId: payment_method.paystack_key_id,
        },
        {
          id: "cod",
          name: "Cash on Delivery",
          isEnabled: payment_method.cod_method === "1",
          description: "Pay when you receive",
        },
      ].filter((method) => method.isEnabled);

      state.availablePaymentMethods = availablePaymentMethods;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    updateWalletBalanceInStore: (state, action) => {
      if (state.userData) {
        state.userData.balance = action.payload;
      }
    },
    resetPaymentState: (state) => {
      state.error = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setPaymentSettings, setError, setUserData, resetPaymentState , updateWalletBalanceInStore } =
  paymentSettingsSlice.actions;

export default paymentSettingsSlice.reducer;
