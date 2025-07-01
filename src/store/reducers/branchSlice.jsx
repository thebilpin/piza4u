import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: 0,
};

const branchSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setBranchId: (state, action) => {
      state.id = action.payload;
    },
  },
});

export const { setBranchId } = branchSlice.actions;

export default branchSlice.reducer;
