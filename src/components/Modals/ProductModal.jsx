import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { RadioGroup, Radio, Chip, Avatar } from "@heroui/react";
import { RiAddLine, RiStarFill, RiSubtractLine } from "@remixicon/react";
import { Image } from "@heroui/react";
import { useSelector } from "react-redux";
import { add_to_cart } from "../../events/actions";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { formatPrice, getCurrencySymbol } from "@/helpers/functionHelper";
import { isLogged } from "@/events/getters";

const ProductModal = ({
  image,
  title,
  description,
  price,
  discount,
  categoryName,
  rating,
  discountedPrice,
  variants = [],
  addOns,
  onAddToBag,
  indicator,
  buttonText = "add",
  selectedVariantId,
  selectedAddOnIds,
  cart = false,
  currentQty,
  cart_id,
}) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(currentQty || 1);
  const [loading, setLoading] = useState();

  const [selectedVariant, setSelectedVariant] = useState(
    variants.length === 1 ? variants[0] : null
  );

  const [selectedAddOns, setSelectedAddOns] = useState(
    addOns?.map((addon) => ({ ...addon, quantity: 0 })) || []
  );

  const initializeState = useCallback(() => {
    // Handle variant selection
    if (cart && selectedVariantId) {
      const cartVariant = variants.find((v) => v.id === selectedVariantId);
      setSelectedVariant(cartVariant || null);
    } else if (variants.length > 0) {
      setSelectedVariant(variants[0]);
    }

    // Handle add-ons selection
    if (cart && selectedAddOnIds) {
      const selectedIds = selectedAddOnIds.split(",");
      const initialAddOns =
        addOns?.map((addon) => ({
          ...addon,
          quantity: selectedIds.includes(addon.id) ? 1 : 0,
        })) || [];
      setSelectedAddOns(initialAddOns);
    } else {
      setSelectedAddOns(
        addOns?.map((addon) => ({ ...addon, quantity: 0 })) || []
      );
    }

    // Set quantity
    if (cart && currentQty) {
      setQuantity(currentQty);
    }
  }, [cart, selectedVariantId, selectedAddOnIds, addOns, variants, currentQty]);

  useEffect(() => {
    if (isOpen) {
      initializeState();
    }
  }, [isOpen, initializeState]);

  const shouldShowVariants =
    variants.length > 1 ||
    (variants.length === 1 && variants[0].variant_values);

  const handleQuantityChange = (increment) => {
    setQuantity((prev) => Math.max(1, prev + increment));
  };

  const handleVariantChange = (value) => {
    const variant = variants.find((v) => v.id === value);
    setSelectedVariant(variant);
  };

  const calculateTotalPrice = () => {
    // Base price calculation
    let basePrice;

    if (selectedVariant) {
      basePrice =
        selectedVariant.special_price &&
        parseFloat(selectedVariant.special_price) !== 0
          ? parseFloat(selectedVariant.special_price)
          : parseFloat(selectedVariant.price);
    } else {
      basePrice = discountedPrice !== 0 ? discountedPrice : price;
    }

    // Calculate addons total for a single item
    const addOnsTotalForSingleItem = selectedAddOns.reduce(
      (sum, addon) => sum + addon.price * addon.quantity,
      0
    );

    // Total price for all items (quantity)
    const totalPrice = (basePrice + addOnsTotalForSingleItem) * quantity;

    return totalPrice;
  };

  const handleAddonToggle = (addonId) => {
    setSelectedAddOns((prev) =>
      prev.map((addon) =>
        addon.id === addonId
          ? { ...addon, quantity: addon.quantity === 0 ? 1 : 0 }
          : addon
      )
    );
  };

  const onOpenChange = (open) => {
    setIsOpen(open);
    if (!open && !cart) {
      // Only reset if not in cart mode
      setQuantity(1);
      if (variants.length !== 1) {
        // Don't reset for single variant products
        setSelectedVariant(null);
      }
      setSelectedAddOns(
        addOns?.map((addon) => ({ ...addon, quantity: 0 })) || []
      );
    }
  };

  const getSubtotals = () => {
    const basePrice = selectedVariant
      ? selectedVariant.special_price &&
        parseFloat(selectedVariant.special_price) !== 0
        ? parseFloat(selectedVariant.special_price)
        : parseFloat(selectedVariant.price)
      : discountedPrice !== 0
        ? discountedPrice
        : price;

    const basePriceTotal = basePrice * quantity;

    const addOnsTotal = selectedAddOns.reduce(
      (sum, addon) => sum + addon.price * addon.quantity * quantity,
      0
    );

    return { basePriceTotal, addOnsTotal };
  };

  // Price , special price & discount

  const renderPrice = () => {
    if (selectedVariant) {
      const hasSpecialPrice =
        selectedVariant.special_price &&
        parseFloat(selectedVariant.special_price) !== 0;

      return (
        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xl font-bold text-primary">
            {formatPrice(
              hasSpecialPrice
                ? selectedVariant.special_price
                : selectedVariant.price
            )}
          </span>
          {hasSpecialPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(selectedVariant.price)}
            </span>
          )}

          {discount > 0 && discount !== 100 && (
            <span className="text-sm text-green-600 font-medium">
              {discount}% off
            </span>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 mt-2">
        {discountedPrice !== price && discountedPrice !== 0 && (
          <span className="text-sm text-gray-500 line-through">
            {formatPrice(price)}
          </span>
        )}
        <span className="text-xl font-bold text-primary">
          {formatPrice(discountedPrice !== 0 ? discountedPrice : price)}
        </span>
        {discount > 0 && discount !== 100 && (
          <span className="text-sm text-green-600 font-medium">
            {discount}% off
          </span>
        )}
      </div>
    );
  };

  const addToCart = async () => {
    if (!isLogged()) {
      return toast.error("Please login to continue");
    }

    setLoading(true);
    setIsOpen(false);

    try {
      const state = await add_to_cart({
        product_variant_id: selectedVariant.id,
        qty: quantity,
        addons: selectedAddOns.filter((addon) => addon.quantity > 0),
        cart_id: cart_id,
      });

      if (!state) {
        // toast.error("Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error in addToCart:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        color="primary"
        onPress={() => setIsOpen(true)}
        className="bg-primary-500 rounded px-2 py-2 font-semibold"
      >
        {t(buttonText)}
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size={{
          base: "xl",
          sm: "2xl",
        }}
        placement="bottom-center"
        className="h-auto max-h-[90vh] rounded"
        isDismissable={true}
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-lg md:text-xl"></ModalHeader>

              <ModalBody className="overflow-y-auto px-3 md:px-6">
                <div className="flex flex-col gap-4 md:gap-6">
                  <div className="flex gap-4">
                    <div className="h-32 w-32 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-lg md:text-xl font-semibold">
                          {title}
                        </h3>
                      </div>
                      <Chip
                        as="div"
                        size="sm"
                        classNames={{
                          base: "font-semibold text-xs text-primary-500 mb-1 rounded",
                          content:
                            "truncate overflow-hidden whitespace-nowrap max-w-[150px]",
                        }}
                        title={categoryName}
                      >
                        <span className="truncate block">{categoryName}</span>
                      </Chip>
                      <div className="flex justify-start my-2">
                        {[...Array(5)].map((_, i) => (
                          <RiStarFill
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating ? "text-yellow-400" : "text-gray-300"
                            } duration-500`}
                          />
                        ))}
                      </div>
                      {renderPrice()}
                    </div>
                  </div>

                  {description && (
                    <div className="rounded">
                      <p className="text-sm">{description}</p>
                    </div>
                  )}

                  {shouldShowVariants && (
                    <Card className="rounded-lg shadow-lg border border-gray-200 dark:border-gray-500">
                      <CardHeader className="font-semibold text-base md:text-lg">
                        {t("variants")}
                      </CardHeader>
                      <CardBody className="px-3 md:px-6">
                        <RadioGroup
                          value={selectedVariant?.id || ""}
                          onValueChange={handleVariantChange}
                          className="space-y-2"
                        >
                          {variants.map((variant) => {
                            const hasSpecialPrice =
                              variant.special_price &&
                              parseFloat(variant.special_price) !== 0;

                            const displayPrice = hasSpecialPrice
                              ? variant.special_price
                              : variant.price;

                            return (
                              <Radio
                                key={variant.id}
                                value={variant.id}
                                label={`Option ${variant.id}`}
                                description={`${formatPrice(displayPrice)}${
                                  hasSpecialPrice ? "" : ""
                                } ${
                                  variant.variant_values
                                    ? ` - ${variant.variant_values}`
                                    : ""
                                }`}
                                className="w-full"
                              />
                            );
                          })}
                        </RadioGroup>
                      </CardBody>
                    </Card>
                  )}

                  {addOns?.length > 0 && (
                    <Card className="rounded-lg shadow-lg border border-gray-200 dark:border-gray-500">
                      <CardHeader className="font-semibold text-lg">
                        {t("extra_add_ons")}
                      </CardHeader>

                      <CardBody>
                        <div className="flex flex-wrap gap-3">
                          {selectedAddOns.map((addon) => (
                            <Chip
                              key={addon.id}
                              variant="flat"
                              color={addon.quantity > 0 ? "primary" : "default"}
                              onClick={() => handleAddonToggle(addon.id)}
                              className="cursor-pointer rounded px-4 py-2 transition-all"
                              startContent={
                                addon.quantity > 0 ? (
                                  <span className="text-primary-500 text-lg">
                                    <RiSubtractLine />
                                  </span>
                                ) : (
                                  <span className="text-gray-500 text-lg">
                                    <RiAddLine />
                                  </span>
                                )
                              }
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {addon.title}
                                </span>
                                <span className="text-sm">
                                  {formatPrice(addon.price)}
                                </span>
                              </div>
                            </Chip>
                          ))}
                        </div>
                      </CardBody>

                      {selectedAddOns.some((addon) => addon.quantity > 0) && (
                        <CardFooter className="border-t border-gray-200 dark:border-gray-500 py-2">
                          <div className="text-sm text-primary-600 font-medium">
                            {t("selected_add_ons_total")}:
                            {formatPrice(
                              selectedAddOns.reduce(
                                (sum, addon) =>
                                  sum + addon.price * addon.quantity,
                                0
                              )
                            )}
                          </div>
                        </CardFooter>
                      )}
                    </Card>
                  )}
                </div>
              </ModalBody>

              <ModalFooter className="flex flex-col gap-2 pt-2 border-t dark:border-t-gray-500 px-3 md:px-6">
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>
                      {" "}
                      {t("base_price")} ({quantity} items)
                    </span>
                    <span>{formatPrice(getSubtotals().basePriceTotal)}</span>
                  </div>

                  {getSubtotals().addOnsTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>{t("add_ons_total")}</span>
                      <span>{formatPrice(getSubtotals().addOnsTotal)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-base md:text-lg pt-2 border-t dark:border-t-gray-500">
                    <span>{t("total")}</span>
                    <span className="text-primary">
                      {formatPrice(calculateTotalPrice())}
                    </span>
                  </div>
                </div>

                <div className="flex flex-row justify-between gap-2 mt-4">
                  <div className="flex justify-center items-center gap-1 rounded px-2 border border-gray-200 dark:border-gray-500 w-full max-w-[150px]">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => handleQuantityChange(-1)}
                      className="w-6 h-6 flex items-center justify-center p-0"
                    >
                      <RiSubtractLine className="h-4 w-4" />
                    </Button>

                    <span className="w-6 text-center font-medium text-sm">
                      {quantity}
                    </span>

                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => handleQuantityChange(1)}
                      className="w-6 h-6 flex items-center justify-center p-0"
                    >
                      <RiAddLine className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                    <Button
                      color="danger"
                      variant="light"
                      onPress={onClose}
                      className="font-bold  sm:w-auto rounded"
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      color="primary"
                      onPress={addToCart}
                      className="bg-primary-500 font-bold rounded sm:w-auto"
                    >
                      {t("add_to_cart")}
                    </Button>
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductModal;
