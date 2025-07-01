import React from "react";
import { Image } from "@heroui/react";

const NotFound = ({ text }) => {
  return (
    <div className="flex flex-col justify-center items-center text-center py-4">
      <Image src="/no-item-found.svg" alt="No items found" className="mb-4" />
      <span className="font-semibold text-lg">{text}</span>
    </div>
  );
};

export default NotFound;
