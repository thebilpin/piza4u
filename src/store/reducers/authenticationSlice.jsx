import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: [], 
  isLogged: false,
  accessToken: "",
  userData: {}
};

const authenticationSlice = createSlice({
  name: "userDetails",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.accessToken = action.payload.token
      state.isLogged = !action.payload.error
      state.userData = action.payload.data
    },
    setLogout: (state, action) => {
      state.accessToken = initialState.accessToken
      state.isLogged = initialState.isLogged
      state.userData = initialState.userData
    },
    updateUserInfo: (state, action) => {
      state.userData = { ...state.userData, ...action.payload }
    }
  },
});

export const { setAuth, setLogout, updateUserInfo } = authenticationSlice.actions;
export default authenticationSlice.reducer;
