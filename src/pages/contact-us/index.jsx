import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { HeadTitle } from "@/components/HeadTitle";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Index = () => {
  const settings = useSelector((state) => state?.settings?.value);
  const [setting, setSettings] = useState();

  useEffect(() => {
    if (settings && settings.web_settings.length != 0)
      setSettings(settings.contact_us[0]);
  }, [settings]);

  return (
    <div>
      <HeadTitle title={"Contact Us"} />
      <BreadCrumb />

      <div>
        <div dangerouslySetInnerHTML={{ __html: setting ? setting : "" }} />
      </div>
    </div>
  );
};

export default Index;
