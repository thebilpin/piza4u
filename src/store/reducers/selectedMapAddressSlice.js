import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [], 
};

const selectedMapAddressSlice = createSlice({
  name: "selectedMapAddress",
  initialState,
  reducers: {
    setAddress: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setAddress } = selectedMapAddressSlice.actions;

export default selectedMapAddressSlice.reducer;
