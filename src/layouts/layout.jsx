import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Head from "next/head";
import { Progress } from "@heroui/react";
import { Toaster } from "sonner";
import { getBranchId } from "@/events/getters";
import SideDrawer from "@/components/SideDrawer/SideDrawer";

const Header = dynamic(() => import("../components/Header/index"), {
  ssr: false,
});

const Footer = dynamic(() => import("../components/Footer/Footer"), {
  ssr: false,
});

export default function RootLayout({ children }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const isHomePage = router.pathname === "/";

  const selectedCity = useSelector((state) => state?.selectedCity?.value?.city);
  const branchId = getBranchId();
  const settings = useSelector(
    (state) => state.settings.value.web_settings?.[0]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!branchId && !isHomePage) {
        router.push("/");
      } else if (selectedCity && branchId && isHomePage) {
        router.push("/home");
      }
    }
  }, [selectedCity, branchId, isHomePage, router, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div>
      {settings && (
        <Head>
          <link rel="icon" href={settings.favicon} type="image/*" sizes="any" />
        </Head>
      )}

      {isLoading && (
        <div className="fixed top-0 left-0 w-full z-50">
          <Progress
            value={progress}
            color="primary"
            className="h-1"
            aria-label="Loading..."
          />
        </div>
      )}

      {!isHomePage && (
        <>
          <Header />
          <SideDrawer />
        </>
      )}

      <main className="mx-auto max-w-[1800px] px-4 min-h-[75vh] sm:px-6 md:px-8 flex-grow pt-0">
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            className: "text-md",
          }}
        />
        {children}
      </main>
      {!isHomePage && <Footer />}
    </div>
  );
}
