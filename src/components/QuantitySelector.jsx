import { Button } from "@heroui/button";
import { RiAddLine, RiDeleteBinLine, RiSubtractLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import DeleteConfirmationModal from "@/components/Modals/DeleteConfirmModal";

const QuantitySelector = ({
  initialValue,
  productVariantId,
  cart_id,
  branch_id,
  manageQty,
  onRemoveItem,
  item,
  onQuantityChange,
}) => {
  const { t } = useTranslation();

  const [quantity, setQuantity] = useState(initialValue);
  const [throttleTimeout, setThrottleTimeout] = useState(null);
  const cartData = useSelector((state) => state?.cart?.data);


  const calculatePrice = (qty) => {
    const hasSpecialPrice =
      item.special_price && parseFloat(item.special_price) > 0;
    const originalTotal = parseFloat(item.price) * qty;
    const specialPriceTotal = hasSpecialPrice
      ? parseFloat(item.special_price) * qty
      : originalTotal;

    return {
      total: specialPriceTotal,
      original: originalTotal,
      savings: originalTotal - specialPriceTotal,
    };
  };

  useEffect(() => {
    const cartItem = cartData?.find(
      (item) => item.product_variant_id === productVariantId
    );
    if (cartItem) {
      setQuantity(parseInt(cartItem.qty));
    }
  }, [cartData, productVariantId]);

  const handleQuantityChange = async (newQuantity) => {
    if (throttleTimeout) {
      clearTimeout(throttleTimeout);
    }

    if (newQuantity < 0) return;

    // Skip the deletion logic here since it's now handled by the modal
    if (newQuantity > 0) {
      setQuantity(newQuantity);

      const timeout = setTimeout(async () => {
        try {
          if (onQuantityChange) {
            await onQuantityChange(newQuantity, item.addon_ids);
          }
        } catch (error) {
          console.error("Error updating quantity:", error);
          toast.error("Failed to update quantity");
          setQuantity(initialValue);
        }
      }, 800);

      setThrottleTimeout(timeout);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await onRemoveItem(productVariantId, cart_id);
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const prices = calculatePrice(quantity);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 py-2">
      {/* Quantity Selector */}
      <div className="flex justify-center items-center gap-1 rounded px-2 shadow-md border border-primary w-full max-w-[150px]">
        {quantity === 1 ? (
          <DeleteConfirmationModal
            onConfirmDelete={handleDeleteConfirm}
            buttonProps={{
              isIconOnly: true,
              color: "danger",
              variant: "light",
              className: "hover:bg-red-100 p-0",
            }}
          >
            <RiDeleteBinLine size={16} />
          </DeleteConfirmationModal>
        ) : (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => handleQuantityChange(quantity - 1)}
            className="p-0"
          >
            <RiSubtractLine size={16} />
          </Button>
        )}

        <span className="w-8 text-center font-semibold">{quantity}</span>

        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => handleQuantityChange(quantity + 1)}
          className="p-0"
        >
          <RiAddLine size={16} />
        </Button>
      </div>
    </div>
  );
};

export default QuantitySelector;
