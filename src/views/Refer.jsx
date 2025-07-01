import { updateWalletBalance } from "@/events/actions";
import { Snippet } from "@heroui/snippet";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

const Refer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const user_data = useSelector((state) => state.authentication.userData);
  const referralCode = user_data?.referral_code;

  useEffect(() => {
    updateWalletBalance();
  }, [dispatch]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center p-6 rounded-lg max-w-sm">
        <Image
          src={"/assets/images/refer-and-earn.png"}
          alt="Refer and Earn"
          width={600}
          height={600}
          className="mx-auto mb-4"
        />
        <h1 className="text-2xl font-semibold mb-2">{t("refer_and_earn")}</h1>
        <p className="text-md mb-4">{t("invite_friends")}</p>
        <div className="p-4 rounded-lg">
          <span className="block text-md">
            {t("referral_code")}
          </span>
          <Snippet className="mt-2 text-lg font-bold">
            {referralCode}
          </Snippet>
        </div>
      </div>
    </div>
  );
};

export default Refer;
