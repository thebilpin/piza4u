import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  layoutDirection: "ltr",
};

const rtlSlice = createSlice({
  name: "rtl",
  initialState,
  reducers: {
    toggleRTL: (state, action) => {
      state.layoutDirection = action.payload; // Update layout direction based on the payload
    },
  },
});

export const { toggleRTL } = rtlSlice.actions;

export default rtlSlice.reducer;
