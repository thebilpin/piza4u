import { createSlice } from "@reduxjs/toolkit";

const userAddressSlice = createSlice({
  name: "userAddress",
  initialState: {
    values: [],
  },
  reducers: {
    setUserAddresses: (state, action) => {
      state.values = action.payload;
    },
  },
});

export const { setUserAddresses } = userAddressSlice.actions;

export default userAddressSlice.reducer;
