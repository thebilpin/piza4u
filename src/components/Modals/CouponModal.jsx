import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Image,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { setPromoCode } from "@/store/reducers/promoCodeSlice";
import { toast } from "sonner";
import { getPromoCodes, validatePromoCodes } from "@/interceptor/routes";
import { useTranslation } from "react-i18next";
import { getCurrencySymbol } from "@/helpers/functionHelper";
import NotFound from "../NotFound/NotFound";

const CouponModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const [codes, setCodes] = useState([]);
  const dispatch = useDispatch();
  const cartStoreData = useSelector((state) => state.cart);
  const branchData = useSelector((state) => state.branch);
  const promo = useSelector((state) => state.promoCodes)?.value;
  const branch_id = branchData?.id;
  const currencySymbol = getCurrencySymbol();

  // Flag to track if the promo code was already validated
  const [promoValidated, setPromoValidated] = useState(false);

  // Fetch promo codes
  const get_promo_codes = useCallback(async () => {
    try {
      const promoCodes = await getPromoCodes({ branch_id });
      if (!promoCodes.error) {
        setCodes(promoCodes.data);
      } else {
        toast.error(promoCodes.message);
      }
    } catch (error) {
      console.log("Error occurred while getting promo codes:", error);
    }
  }, [branch_id]);

  // Validate promo codes function
  const validate_promo_codes = useCallback(
    async (promo_code) => {
      if (promoValidated) return;

      try {
        const promoCodes = await validatePromoCodes({
          branch_id,
          promo_code,
          final_total: cartStoreData?.overall_amount,
        });
        if (!promoCodes.error) {
          dispatch(setPromoCode(promoCodes.data));
          toast.success(promoCodes.message);
          setPromoValidated(true);
          onClose();
        } else {
          toast.error(promoCodes.message);
        }
      } catch (error) {
        console.log("Error occurred while validating promo code:", error);
      }
    },
    [
      cartStoreData?.overall_amount,
      dispatch,
      onClose,
      branch_id,
      promoValidated,
    ]
  );

  // Apply promo code when selected
  const handleApplyPromoCode = (promo_code) => {
    if (!promoValidated) {
      validate_promo_codes(promo_code);
    }
  };

  // Reset validation flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPromoValidated(false); // Reset flag when modal is closed
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      get_promo_codes();
    }
  }, [isOpen, get_promo_codes]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" className="rounded">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t("available_coupons")}
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="grid grid-cols-1 gap-4">
            {codes.length > 0 ? (
              codes.map((item) => (
                <div
                  key={item.id}
                  className="relative border rounded flex overflow-hidden h-48 shadow-md"
                >
                  <div className="flex-1 p-4 flex items-center">
                    {/* Left Content - Image */}
                    <div className="w-24 mr-4">
                      <Image
                        src={item.image}
                        alt="img"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Right Content - Text */}
                    <div className="space-y-2">
                      <p className=" font-medium">
                        {t("get_up_to")}
                        {item.discount}
                        {item.discount_type === "percentage"
                          ? "%"
                          : currencySymbol}{" "}
                        {t("off")}
                      </p>
                      <p className="text-sm">{item.message}</p>
                      <p className="text-xs">
                        {t("expiry_date")}: {formatDate(item.end_date)}
                      </p>
                    </div>
                  </div>

                  {/* Divider with Circles */}
                  <div className="relative flex items-center">
                    <div className="absolute -top-5 -translate-x-1/2 w-10 h-10 bg-white rounded-full border border-gray-200"></div>
                    <div className="h-full w-px bg-gray-200"></div>
                    <div className="absolute -bottom-5 -translate-x-1/2 w-10 h-10 bg-white rounded-full border border-gray-200"></div>
                  </div>

                  {/* Right Content */}
                  <div className="w-1/3 p-4 flex flex-col items-center justify-center">
                    <p className="text-sm mb-1">{t("coupon_code")}</p>
                    <p className="text-lg font-bold mb-3">{item.promo_code}</p>
                    <Button
                      color="primary"
                      disabled={item.id === promo?.[0]?.id || promoValidated}
                      onPress={() => handleApplyPromoCode(item.promo_code)}
                      className="px-6 rounded"
                    >
                      {t("redeem")}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <>
                <NotFound text={"Promocode not available"}/>
              </>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CouponModal;
