import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, Button } from "@heroui/react";
import Link from "next/link";
import Image from "next/image";

const CTAMobileAppDownload = () => {
  const settings = useSelector((state) => state.settings.value);
  const [state, setState] = React.useState(null);

  useEffect(() => {
    if (settings && settings?.web_settings?.length !== 0) {
      setState(settings?.web_settings?.[0]);
    }
  }, [settings]);

  if (!state || !state.app_download_section) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
        
        <div className="relative flex justify-center items-center">
          <Image
            src="/homescreen.svg"
            alt="Mobile App Mockup"
            className="w-full max-w-xl"
            width={900}
            height={900}
          />
        </div>

      
        <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
          <h2 className="text-4xl xl:text-4xl font-bold">
            {state.app_download_section_title}
          </h2>
          <p className="text-lg text-gray-600">
            {state.app_download_section_tagline}
          </p>
          <p className="text-base text-gray-500">
            {state.app_download_section_short_description}
          </p>

          
          <div className="flex justify-center lg:justify-start gap-4 pt-4">
            
            <Link
              href={state.app_download_section_appstore_url}
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition-all hover:scale-105"
            >
              <Image
                src="/app-store.webp"
                alt="Download on the App Store"
                className="w-full sm:w-40 rounded-lg"
                width={100}
                height={100}
              />
            </Link>

       
            <Link
              href={state.app_download_section_playstore_url}
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition-all hover:scale-105"
            >
              <Image
                src="/google-play-store.webp"
                alt="Get it on Google Play"
                className="w-full sm:w-40 rounded-lg"
                width={100}
                height={100}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTAMobileAppDownload;
