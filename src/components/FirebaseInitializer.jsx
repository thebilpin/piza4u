import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getVapidKey } from "@/helpers/functionHelper";
import firebaseService from "@/@core/firebase";

const FirebaseInitializer = ({ setNotificationMessage }) => {
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const firebaseSettings = useSelector(
    (state) => state.settings.value?.firebase_settings?.[0]
  );

  const retryInitialization = () => {
    console.log(`Retrying Firebase initialization: Attempt ${retryCount + 1}`);

    if (retryCount < 8) {
      setRetryCount((prevCount) => prevCount + 1);
      setTimeout(initFirebase, 1000);
    } else {
      console.error("Max retry attempts reached for Firebase initialization.");
    }
  };

  useEffect(() => {
    const initFirebase = async () => {
      if (!firebaseSettings) return;

      try {
        const firebase = await firebaseService.initialize();
        const messaging = await firebaseService.getMessaging();

        if (Notification.permission !== "granted") {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const vapidKey = getVapidKey();
            if (!vapidKey) throw new Error("VAPID key is missing");

            const registration = await navigator.serviceWorker.ready;
            const token = await messaging.getToken({
              vapidKey,
              serviceWorkerRegistration: registration,
            });
            localStorage.setItem("fcm_id", token);
          }
        }

        messaging.onMessage((payload) => {
          setNotificationMessage({
            title: payload.data.title,
            body: payload.data.body,
            image: payload.data.image,
          });
        });

        setFirebaseInitialized(true);
      } catch (error) {
        console.error("Firebase initialization error:", error);
        retryInitialization();
      }
    };

    initFirebase();
  }, [firebaseSettings]);

  return null;
};

export default FirebaseInitializer;
