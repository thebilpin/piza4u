import { Avatar, Alert, Button } from "@heroui/react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { RiCloseFill } from "@remixicon/react";

const SnackBarForPushNotification = ({ message }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (message) {
      setOpen(true);
    }
  }, [message]);

  const handleClose = (event) => {
    event?.stopPropagation(); // Prevents the click event from propagating to the parent
    setOpen(false);
  };

  const handleNotificationClick = () => {
    if (message?.type === "order") {
      router.push("/user/my-orders");
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-50`}
      onClick={message?.type === "order" ? handleNotificationClick : undefined}
    >
      <Alert
        isClosable
        color="default"
        className="shadow-lg"
        onClose={handleClose}
        hideIcon={true}
      >
        <div className="flex items-center gap-3">
          {message?.image && (
            <Avatar src={message.image} alt={message.title} size="lg" />
          )}
          <div className="flex-grow">
            {message?.data?.title || message?.title ? (
              <p className="font-bold text-sm">
                {message?.data?.title || message.title}
              </p>
            ) : null}
            {message?.data?.body || message?.body ? (
              <p className="text-sm">{message?.data?.body || message.body}</p>
            ) : null}
          </div>
        </div>
      </Alert>
    </div>
  );
};

export default SnackBarForPushNotification;
