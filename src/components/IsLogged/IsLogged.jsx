import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

const useRequireLogin = () => {
  const router = useRouter();
  const isLogged = useSelector((state) => state.authentication.isLogged);

  useEffect(() => {
    if (!isLogged) {
      router.push("/home");
    }
  }, [isLogged, router]);

  return isLogged;
};

export default useRequireLogin;
