import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: null, 
};

const selectedDeliverySlice = createSlice({
  name: "delivery_address",
  initialState,
  reducers: {
    setDeliveryAddress: (state, action) => {
      state.value = action.payload;
    },
    clearDeliveryAddress: (state) => {
      state.value = null;
    },
  },
});

export const { setDeliveryAddress, clearDeliveryAddress } = selectedDeliverySlice.actions;

export default selectedDeliverySlice.reducer;
