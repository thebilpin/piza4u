import { Button } from "@heroui/button";
import React from "react";

const CustomButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-1 
        py-1 
        
        text-white 
        font-bold 
        rounded 
        transition-all 
        duration-300 
        
        border-2 
        border-transparent 
       
        disabled:opacity-50 
        disabled:cursor-not-allowed
       
      `}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
