import api, {
  deleteOrder,
  get_settings,
  getUserAddress,
} from "../interceptor/routes";
import { setUserSettings } from "../store/reducers/settingsSlice";
import { getBranchId, getUserData } from "../events/getters";
import { store } from "../store/store";
import { setBranchId } from "../store/reducers/branchSlice";
import {
  setAuth,
  setLogout,
  updateUserInfo,
} from "../store/reducers/authenticationSlice";
import { toast } from "sonner";
import {
  setCart,
  setDeliveryCharges,
  setDeliveryTip,
} from "../store/reducers/cartSlice";
import { setUserAddresses } from "@/store/reducers/userAddressSlice";
import { onBranchIdChange, onLoggedIn } from "./events";
import { getFirebaseConfig } from "@/helpers/functionHelper";
import {
  setPaymentSettings,
  setUserData,
} from "@/store/reducers/paymentSettingsSlice";

export const updateUserSettings = async () => {
  try {
    const userData = getUserData();
    const user_id = userData.id;
    const settings = await get_settings();
    if (!settings.error) {
      store.dispatch(setUserSettings(settings.data));
    }
  } catch (error) {
    console.error("failed to load user's addresses", error);
  }
};

export const updateWalletBalance = async (includePaymentMethods = false) => {
  try {
    const userData = getUserData();

    const userDataResponse = await get_settings({
      user_id: userData?.id,
    });

    if (includePaymentMethods) {
      const paymentMethodsResponse = await get_settings({
        type: "payment_method",
      });
      store.dispatch(setPaymentSettings(paymentMethodsResponse.data));
    }

    if (userDataResponse?.data?.user_data?.[0]) {
      store.dispatch(setUserData(userDataResponse.data.user_data[0]));
      return userDataResponse.data.user_data[0].balance;
    }
    return null;
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    return null;
  }
};

export const changeBranchId = async ({ branch_id, force = false } = {}) => {
  const prev_branch_id = getBranchId();
  if (branch_id !== prev_branch_id || force) {
    store.dispatch(setBranchId(force ? prev_branch_id : branch_id));

    // Immediately trigger data updates
    await onBranchIdChange({ branch_id: force ? prev_branch_id : branch_id });
  }
};

export const logout = async () => {
  try {
    const formData = new FormData();

    const res = await api.post("/update_fcm", formData);

    const firebaseConfig = getFirebaseConfig();
    if (!firebaseConfig) {
      console.error("Firebase configuration is missing.");
      return;
    }

    const app = await initializeApp(firebaseConfig);
    const auth = await getAuth(app);
    await auth.signOut();
    await toast.error("Logout successfully");
  } catch (error) {
    store.dispatch(setLogout(false));
  }
};

export const sign_up = async ({ name, email, type }) => {
  const formData = new FormData();

  // Retrieve fcm_id from localStorage and add it to formData if it exists
  const fcm_id = localStorage.getItem("fcm_id");
  if (fcm_id) formData.append("web_fcm_id", fcm_id);

  formData.append("name", name);
  formData.append("email", email);
  formData.append("type", type);

  const response = await api.post("/sign_up", formData);

  if (response.data.error) return response.data;
  else {
    store.dispatch(setAuth(response.data));
    onLoggedIn();
    return response.data;
  }
};

export const register = async ({ name, email, mobile, country_code }) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("mobile", mobile);
  formData.append("country_code", country_code);

  const res = await api.post("/register_user", formData);
  if (res.error) return res;
  else {
    store.dispatch(setAuth(res.data));
  }
};

export const updateUserData = async (data) => {
  const formData = new FormData();
  formData.append("username", data.first_name);
  formData.append("image", data.image);
  if (data.phone) formData.append("mobile", data.phone);

  try {
    const res = await api.post("/update_user", formData);
    store.dispatch(updateUserInfo(res.data.data));
    return res;
  } catch (error) {
    console.error("error while updating cart:", error);
  }
};

export const login = async ({ phoneNumber } = {}) => {
  const formData = new FormData();
  formData.append("mobile", phoneNumber);
  let fcm_id = localStorage.getItem("fcm_id");
  if (fcm_id) formData.append("web_fcm_id", fcm_id);

  const res = await api.post("/login", formData);
  if (res.data.error) return res;
  else {
    store.dispatch(setAuth(res.data));
    onLoggedIn();
    return { error: false };
  }
};

export const setProductRating = async (data) => {
  const formData = new FormData();
  formData.append("user_id", data.user_id);
  formData.append("product_id", data.product_id);
  formData.append("rating", data.rating);
  formData.append("comment", data.message);

  try {
    const res = await api.post("/set_product_rating", formData);
    return res;
  } catch (error) {
    console.error("error while setting product rating:", error);
    throw error;
  }
};

export const updateUserCart = async () => {
  const formData = new FormData();
  formData.append("branch_id", getBranchId());
  try {
    const res = await api.post("/get_user_cart", formData);
    store.dispatch(setCart(res.data));
  } catch (error) {
    console.error("error while updating cart:", error);
  }
};
export const getCities = async (sort, order, search, limit, offset) => {
  const userData = getUserData();
  const user_id = userData.id;

  const formData = new FormData();
  if (sort) formData.append("sort", sort);

  if (order) formData.append("user_id", user_id);
  if (search) formData.append("search", search);
  formData.append("limit", limit ?? 10);
  formData.append("offset", offset ?? 0);
  try {
    const res = await api.post("/get_cities", formData);
    // store.dispatch(setCart(res.data));
  } catch (error) {
    console.error("error while updating cart:", error);
  }
}
 
export const add_to_cart = async ({
  product_variant_id,
  qty,
  cart_id,
  addons = [],
  branch_id,
} = {}) => {
  let add_on_id = "";
  let add_on_qty = "";

  // Handle both string and array formats of addons
  if (typeof addons === "string") {
    // If addons is a string (comma-separated IDs), use it directly
    add_on_id = addons;
    // Set all quantities to 1 or the product qty
    add_on_qty = addons
      .split(",")
      .map(() => "1")
      .join(",");
  } else if (Array.isArray(addons)) {
    // If addons is an array of objects, process as before
    const selectedAddons = addons?.filter((addon) => addon.quantity > 0);

    selectedAddons.forEach((addon, index) => {
      if (index > 0) {
        add_on_id += ",";
        add_on_qty += ",";
      }
      add_on_id += addon.id;
      add_on_qty += addon.quantity;
    });
  }

  let data;

  if (cart_id) {
    data = {
      product_variant_id,
      qty: parseInt(qty),
      add_on_id,
      add_on_qty,
      cart_id,
      branch_id: getBranchId(),
    };
  } else {
    data = {
      product_variant_id,
      qty: parseInt(qty),
      add_on_id,
      add_on_qty,
      branch_id: getBranchId(),
    };
  }

  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key]);
  });

  if (qty === 0) {
    const formData1 = new FormData();
    formData1.append("branch_id", branch_id);
    if (product_variant_id)
      formData1.append("product_variant_id", product_variant_id);
    if (cart_id) formData1.append("cart_id", cart_id);

    try {
      await api.post("/remove_from_cart", formData1);
      await updateUserCart();
      return true;
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item from cart");
      return false;
    }
  } else {
    try {
      const response = await api.post("/manage_cart", formData);
      await updateUserCart();

      if (response.data.error) {
        toast.error(response.data.message);
        return false;
      }

      toast.success(response.data.message);
      return true;
    } catch (error) {
      console.error("Error managing cart:", error);
      toast.error("Something went wrong...");
      return false;
    }
  }
};

export const UpdateDeliveryCharges = (deliveryCharges = {}) => {
  store.dispatch(setDeliveryCharges(deliveryCharges));
};

export const updateDeliveryTip = (tip_amount = 0) => {
  store.dispatch(setDeliveryTip(tip_amount));
};

export const updateUserAddresses = async () => {
  try {
    const userData = getUserData();
    const user_id = userData.id;
    const getUserAddresses = await getUserAddress({ user_id });
    if (!getUserAddresses.error) {
      store.dispatch(setUserAddresses(getUserAddresses.data));
    }
  } catch (error) {
    console.error("failed to load user's addresses", error);
  }
};

export const deleteOrderHandler = async (order_id, reload = false) => {
  try {
    const response = await deleteOrder(order_id);
    if (response.error) {
      toast.error(response.message);
    } else {
      await updateUserCart();
    }
  } catch (error) {
    toast.error(error);
    console.log(error);
  } finally {
    if (reload) {
      window.location.reload();
    }
  }
};
