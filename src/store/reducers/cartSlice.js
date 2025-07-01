import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  total_quantity: 0,
  sub_total: 0,
  tax_percentage: 0,
  tax_amount: 0,
  overall_amount: 0,
  total_arr: 0,
  delivery_charges: {},
  delivery_tip: 0,
  orderNote: "",
  variant_id: [],
  data: [],
  tip: 0,
  customTip: 0,
  customTipInputValue: "",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.total_quantity = action.payload.total_quantity;
      state.sub_total = action.payload.sub_total;
      state.tax_percentage = action.payload.tax_percentage;
      state.tax_amount = action.payload.tax_amount;
      state.overall_amount = action.payload.overall_amount;
      state.total_arr = action.payload.total_arr;
      state.variant_id = action.payload.variant_id;
      state.data = action.payload.data;
    },

    setTip: (state, action) => {
      state.tip = action.payload.tip;
    },

    setCustomTip: (state, action) => {
      state.customTip = action.payload.customTip;
    },

    setCustomTipInputValue: (state, action) => {
      state.customTipInputValue = action.payload.customTipInputValue;
    },

    setDeliveryCharges: (state, action) => {
      state.delivery_charges = action.payload;
    },

    setDeliveryTip: (state, action) => {
      state.delivery_tip = action.payload;
    },
  },
});

export const {
  setCart,
  setTip,
  setCustomTip,
  setCustomTipInputValue,
  setDeliveryCharges,
  setDeliveryTip,
} = cartSlice.actions;
export default cartSlice.reducer;
