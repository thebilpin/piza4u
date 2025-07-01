import { combineReducers, configureStore } from "@reduxjs/toolkit";
import homeSlice from "../store/reducers/Home/homeslice";
import { persistReducer, persistStore } from "redux-persist";
import rtlSlice from "../store/reducers/rtlSlice";
import storage from "redux-persist/lib/storage";
import settingsSlice from "./reducers/settingsSlice";
import branchSlice from "../store/reducers/branchSlice";
import authenticationSlice from "../store/reducers/authenticationSlice";
import cartSlice from "../store/reducers/cartSlice";
import favoritesSlice from "@/store/reducers/favoritesSlice";
import userAddressSlice from "@/store/reducers/userAddressSlice";
import selectedDeliverySlice from "@/store/reducers/selectedDeliverySlice";
import promoCodeSlice from "@/store/reducers/promoCodeSlice";
import paymentSettingsSlice from "@/store/reducers/paymentSettingsSlice"
import selectedMapAddressSlice from "@/store/reducers/selectedMapAddressSlice"
import languageSlice from "@/store/reducers/languageSlice"

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  settings: settingsSlice,
  homepage: homeSlice,
  branch: branchSlice,
  rtl: rtlSlice,
  authentication: authenticationSlice,
  cart: cartSlice,
  favorites: favoritesSlice,
  userAddresses: userAddressSlice,
  selectedDeliveryAddress: selectedDeliverySlice,
  promoCodes: promoCodeSlice,
  paymentSettings: paymentSettingsSlice,
  selectedCity: selectedMapAddressSlice,
  language: languageSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
  ],
});
export const persistor = persistStore(store);
