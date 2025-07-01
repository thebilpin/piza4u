import { updateUserCart } from "@/events/actions";
import { getUserData } from "@/events/getters";
import { deleteOrder } from "@/interceptor/routes";
import { store } from "@/store/store";
import { toast } from "sonner";

export const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        toast.success("Location fetched successfully!");
        resolve(location);
      },
      (error) => {
        console.error(error);
        toast.error("Unable to retrieve your location");
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

export const generateOrderId = () => {
  const userdata = getUserData();
  const timestamp = new Date().getTime();
  const randomInt = Math.floor(Math.random() * 900) + 100;
  const order = `wallet-refill-user-${userdata.id}-${timestamp}-${randomInt}`;
  return order;
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

export const getHeaderTitle = (title) => {
  const siteTitle =
    store.getState().settings.value?.web_settings?.[0]?.site_title || "";
  return title ? `${title}${siteTitle ? " | " : ""} ${siteTitle}` : siteTitle;
};

export const getCurrencySymbol = () => {
  const state = store.getState();
  const currencySymbol = state?.settings?.value?.currency?.[0];
  return currencySymbol;
};


export const getFirebaseConfig = () => {
  const firebaseSettings =
    store.getState().settings.value?.firebase_settings?.[0];

  if (!firebaseSettings) {
    console.log("Firebase settings are missing");
    return null;
  }

  return {
    apiKey: firebaseSettings.apiKey,
    authDomain: firebaseSettings.authDomain,
    projectId: firebaseSettings.projectId,
    storageBucket: firebaseSettings.storageBucket,
    messagingSenderId: firebaseSettings.messagingSenderId,
    appId: firebaseSettings.appId,
    measurementId: firebaseSettings.measurementId,
  };
};

export const getVapidKey = () => {
  const vapidKey = store.getState().settings.value?.vap_id_key?.[0];
  // console.log('vapid key received')
  if (!vapidKey) {
    console.error("VAPID key not found in Redux store");
    return null;
  }
  return vapidKey;
};

export const formatPrice = (price) => {
  if (typeof price == "string") {
    price = parseFloat(price);
  }

  const state = store.getState();
  const currency = state?.settings?.value?.currency?.[0];

  return `${currency}${price?.toFixed(2)}`;
};
