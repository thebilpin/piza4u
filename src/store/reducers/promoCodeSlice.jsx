import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [], // Initial language set to English
};

const promoCodeSlice = createSlice({
  name: "promoCodes",
  initialState,
  reducers: {
    setPromoCode: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setPromoCode } = promoCodeSlice.actions;

export default promoCodeSlice.reducer;
