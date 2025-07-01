import { HeroUIProvider } from "@heroui/react";
import { Provider } from "react-redux";
import { store } from "../store/store";
import "../styles/globals.css";
import { useEffect, useState } from "react";
import { onAppLoad, onBranchIdChange } from "../events/events";
import RootLayout from "../layouts/layout";
import { getBranchId } from "@/events/getters";
import { ThemeProvider } from "next-themes";
import i18n from "../i18n";
import { I18nextProvider } from "react-i18next";
import { useRouter } from "next/router";
import SnackBarForPushNotification from "@/components/SnackBarForPushNotification/SnackBarForPushNotification";
import FirebaseInitializer from "@/components/FirebaseInitializer";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [notificationMessage, setNotificationMessage] = useState(null);

  useEffect(() => {
    const branchId = getBranchId();
    if (branchId) {
      onBranchIdChange({ branch_id: branchId });
    }
  }, []);

  useEffect(() => {
    onAppLoad();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          themes={["light", "dark"]}
        >
          <HeroUIProvider>
            <RootLayout>
              <FirebaseInitializer
                setNotificationMessage={setNotificationMessage}
              />
              <Component {...pageProps} />
              <SnackBarForPushNotification message={notificationMessage} />
            </RootLayout>
          </HeroUIProvider>
        </ThemeProvider>
      </Provider>
    </I18nextProvider>
  );
}

export default MyApp;