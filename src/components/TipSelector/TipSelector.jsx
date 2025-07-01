import React, { useState } from "react";
import {
  Button,
  Input,
  Card,
  CardBody,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import {
  RiCloseLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiSettings2Line,
} from "@remixicon/react";
import { useTranslation } from "react-i18next";
import { formatPrice, getCurrencySymbol } from "@/helpers/functionHelper";
import { useSelector } from "react-redux";

const TipSelector = ({
  tip,
  customTip,
  customTipInputValue,
  onTipChange,
  onCustomTipChange,
  onCustomTipInputChange,
  deliveryType,
}) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const tipOptions = [10, 20, 30, 50];
  const currency = useSelector((state) =>state.settings.value.currency);

  if (deliveryType !== "Delivery") {
    return null;
  }
        
  const handleTipSelect = (amount) => {
    onTipChange(amount);
    onCustomTipChange(0);
    onCustomTipInputChange("");
  };

  const handleCustomTipInput = (value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    onCustomTipInputChange(numericValue);

    if (numericValue) {
      const tipAmount = parseInt(numericValue);
      onCustomTipChange(tipAmount);
      onTipChange(0);
    } else {
      onCustomTipChange(0);
    }
  };

  

  const activeTipAmount = tip || customTip;

  return (
    <Card className="w-full my-4 rounded">
      <CardBody className="space-y-4">
        <Accordion disableAnimation={false}>
          <AccordionItem
            title={t("delivery_partner_tip")}
            className="w-full"
            onChange={() => setIsOpen((prev) => !prev)} // Toggle open state
            indicator={<RiSettings2Line />}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                {/* {activeTipAmount > 0 && ( // This condition controls remove button visibility
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    startContent={<RiCloseLine />}
                    onClick={handleRemoveTip}
                    className="min-w-fit" // Added to ensure button doesn't get too small
                  >
                    {t("remove_tip")}
                  </Button>
                )} */}
              </div>

              <p className="text-sm text-gray-500">
                {t("thank_delivery_partner")}
              </p>

              <div className="flex flex-wrap gap-2">
                {tipOptions.map((amount) => (
                  <Button
                    key={amount}
                    variant={tip === amount ? "solid" : "bordered"}
                    color={tip === amount ? "primary" : "default"}
                    className="flex-1 rounded"
                    onPress={() => handleTipSelect(amount)}
                  >
                    
                    {formatPrice(amount)}
                  </Button>
                ))}
              </div>

              <div className="mt-4">
                <Input
                  type="text"
                  label={t("custom_tip_amount")}
                  placeholder={t("custom_tip_amount")}
                  value={customTipInputValue}
                  onChange={(e) => handleCustomTipInput(e.target.value)}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">
                        {currency}
                      </span>
                    </div>
                  }
                />
              </div>

              {activeTipAmount > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-500">
                    {t("thank_you_tipping")} 
                    {formatPrice(activeTipAmount)}!
                  </span>
                </div>
              )}
            </div>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
};

export default TipSelector;
