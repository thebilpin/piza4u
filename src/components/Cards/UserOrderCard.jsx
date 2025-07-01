import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Divider,
  Chip,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  ModalContent,
  useDisclosure,
  DropdownMenu,
  DropdownTrigger,
  Dropdown,
  DropdownItem,
  Image,
  Avatar,
} from "@heroui/react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import api from "../../interceptor/api";
import { toast } from "sonner";
import ReactStars from "react-rating-stars-component";
import ImagePreviewModal from "../ImagePreviewModal/ImagePreviewModal";
import GenerateInvoicePDF from "../GenerateInvoicePDF/GenerateInvoicePDF";
import { updateUserCart } from "@/events/actions";
import { getBranchId } from "@/events/getters";

// icons

import {
  RiAlertFill,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiCloseLine,
  RiCloseCircleLine,
  RiDownload2Line,
  RiImageLine,
  RiLink,
  RiMoreLine,
  RiStarFill,
} from "@remixicon/react";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/helpers/functionHelper";

const UserOrderCard = ({
  id,
  status,
  date,
  payment_method,
  wallet_balance,
  isCancellable = false,
  email,
  name,
  qty,
  amount,
  item = {},
  OrderItems = [],
  request,
  order_rider_rating,
  order_product_rating,
}) => {
  const { t } = useTranslation();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reason, setReason] = useState("");
  const [openReview, setOpenReview] = useState(false);
  const [openRiderReview, setOpenRiderReview] = useState(false);
  const [OrderDetails, setOrderDetails] = useState();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [riderRating, setRiderRating] = useState(0.0);
  const [comments, setComments] = useState({});
  const [riderComments, setRiderComments] = useState("");
  const [ratings, setRatings] = useState({});

  const userData = useSelector((state) => state.authentication).userData;
  const router = useRouter();

  const [isReorderDisabled, setIsReorderDisabled] = useState(false);
  const currentBranchId = getBranchId();
  const [showReorderConfirmation, setShowReorderConfirmation] = useState(false);

  useEffect(() => {
    const initialRatings = OrderItems.reduce((acc, item) => {
      acc[item.product_id] = { rating: 0 };

      return acc;
    }, {});
    setRatings(initialRatings);
  }, [item, OrderItems, currentBranchId]);

  useEffect(() => {
    if (item && item.branch_id) {
      setIsReorderDisabled(item.branch_id !== currentBranchId);
    }
  }, [item, currentBranchId]);

  useEffect(() => {
    setOrderDetails(item);
  }, [item]);

  const submitProductReview = () => {
    setOpenReview(false);
  };

  const submitRiderReview = () => {
    setOpenRiderReview(false);
  };

  const handleRiderRating = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("user_id", userData.id);
      formData.append("order_id", id);
      formData.append("rider_id", OrderDetails.rider_id);
      formData.append("rating", riderRating);
      formData.append("comment", reason);

      const setRiderRatingResponse = await api.post(
        "/set_rider_rating",
        formData
      );

      if (setRiderRatingResponse.data.error) {
        toast.error(setRiderRatingResponse.data.message);
      } else {
        setOpenRiderReview(false);
        request();
        toast.success(setRiderRatingResponse.data.message);
      }
    } catch (error) {
      console.error("Error while submitting rider rating:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("user_id", userData.id);
      formData.append("order_id", id);

      OrderItems.forEach((item, index) => {
        formData.append(
          `product_rating_data[${index}][product_id]`,
          item.product_id
        );
        formData.append(
          `product_rating_data[${index}][rating]`,
          ratings[item.product_id]?.rating ?? 0
        );
        formData.append(
          `product_rating_data[${index}][comment]`,
          comments[item.product_id] ?? ""
        );

        const productImages = images[item.product_id] ?? [];
        productImages.forEach((image, imageIndex) => {
          formData.append(
            `product_rating_data[${index}][images][${imageIndex}]`,
            image
          );
        });
      });

      const response = await api.post("/set_product_rating", formData);

      if (response.data.error) {
        toast.error(response.data.message);
      } else {
        setOrderDetails((prev) => ({
          ...prev,
          order_product_rating: response.data.data[0]?.order_product_rating,
        }));

        setOpenReview(false);
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error while submitting rating:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedImage) return;

      switch (e.key) {
        case "ArrowLeft":
          const prevIndex = selectedImage.index - 1;
          if (prevIndex >= 0) {
            setSelectedImage((prev) => ({
              ...prev,
              index: prevIndex,
            }));
          }
          break;
        case "ArrowRight":
          const nextIndex = selectedImage.index + 1;
          if (nextIndex < images[selectedImage.productId].length) {
            setSelectedImage((prev) => ({
              ...prev,
              index: nextIndex,
            }));
          }
          break;
        case "Escape":
          setSelectedImage(null);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedImage, images]);

  const OrderDetail = ({ label, value, paymentIcon }) => (
    <div className="flex items-center text-md gap-2">
      <span
        className={`text-md ${label === "Total" ? "font-bold" : "text-gray-500"}`}
      >
        {label}:
      </span>
      <span
        className={`text-default-700 flex items-center gap-1 ${label === "Total" ? "font-bold" : ""}`}
      >
        {paymentIcon}
        {value}
      </span>
    </div>
  );

  const formatStatus = (status) => {
    const formattedStatus = status
      ?.replace(/_/g, " ")
      ?.toLowerCase()
      ?.replace(/^\w/, (c) => c.toUpperCase());

    return formattedStatus;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return (
          <Image
            src={"/assets/icons/pending.svg"}
            alt="Pending"
            className="w-4 h-4"
          />
        );
      case "preparing":
      case "confirmed":
        return (
          <Image
            src={"/assets/icons/confirmed.svg"}
            alt="Preparing"
            className="w-4 h-4"
          />
        );
      case "delivered":
        return <RiCheckLine />;
      case "cancelled":
        return <RiCloseLine />;

      case "out_for_delivery":
        return (
          <Image
            src={"/assets/icons/out_for_delivery.svg"}
            alt="Out for Delivery"
            className="w-4 h-4"
          />
        );
      default:
        return null;
    }
  };

  const handleReOrder = async () => {
    if (isReorderDisabled) {
      toast.error(
        "Reorder is not available for orders from different branches."
      );

      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("order_id", id);

      const response = await api.post("/re_order", formData);
      if (response.data.error) {
        toast.error(response.data.message);
      } else {
        updateUserCart();

        setShowReorderConfirmation(true);
        toast.success("Your items have been re-ordered and added to the cart.");
      }
    } catch (error) {
      console.error("Error while re-ordering:", error);
      toast.error("An error occurred while re-ordering. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border border-default-200 rounded">
      <div className="p-4">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-lg">{t("order_id")}:</span>
                <span className="font-semibold">#{id}</span>
              </div>
              <Chip
                startContent={getStatusIcon(status)}
                color={
                  status === "pending"
                    ? "warning"
                    : status === "preparing" || status === "confirmed"
                      ? "secondary"
                      : status === "delivered"
                        ? "success"
                        : status === "cancelled"
                          ? "danger"
                          : status === "out_for_delivery"
                            ? "primary"
                            : "neutral"
                }
                size="sm"
                className="rounded text-xs"
                variant="flat"
              >
                <span className="font-semibold">{formatStatus(status)}</span>
              </Chip>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex gap-2">
              {isCancellable === "1" &&
                [
                  "pending",
                  "confirmed",
                  "preparing",
                  "out_for_delivery",
                ].includes(item.active_status) &&
                item.cancelable_till !== "" && (
                  <Button
                    variant="flat"
                    color="danger"
                    size="sm"
                    onPress={onOpen}
                    className="rounded font-semibold"
                  >
                    {t("cancel_order")}
                  </Button>
                )}

              <>
                {status === "delivered" ? (
                  OrderDetails?.order_product_rating === "" ? (
                    <Button
                      variant="flat"
                      size="sm"
                      className="rounded font-semibold"
                      onPress={() => setOpenReview(true)}
                    >
                      {t("rate_product")}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Product Rating:</span>
                      <div className="flex items-center bg-primary-400 text-white px-2 py-1 rounded">
                        <span>{OrderDetails?.order_product_rating}</span>
                        <RiStarFill size={20} className="ml-1" />
                      </div>
                    </div>
                  )
                ) : null}

                {status === "delivered" ? (
                  OrderDetails?.order_rider_rating == "0.0" ? (
                    <Button
                      variant="flat"
                      size="sm"
                      className="rounded font-semibold"
                      onPress={() => setOpenRiderReview(true)}
                    >
                      {t("rate_rider")}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Rider Rating:</span>
                      <div className="flex items-center bg-primary-400 text-white px-2 py-1 rounded">
                        <span>{OrderDetails?.order_rider_rating}</span>
                        <RiStarFill size={20} className="ml-1" />
                      </div>
                    </div>
                  )
                ) : null}
              </>

              {(status === "delivered" || status === "cancelled") && (
                <Button
                  variant="flat"
                  size="sm"
                  className="text-default-600 rounded font-semibold"
                  onPress={handleReOrder}
                >
                  {t("re_order")}
                </Button>
              )}
              <Button
                variant="flat"
                size="sm"
                className="text-default-600 rounded font-semibold"
                onPress={() => router.push(`/user/my-orders/${id}`)}
              >
                {t("order_details")}
              </Button>
            </div>

            <div className="sm:hidden w-full">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    size="sm"
                    className="w-full justify-between"
                  >
                    {t("actions")}
                    <RiMoreLine className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu className="w-[200px]">
                  <DropdownItem
                    onPress={() => router.push(`/user/my-orders/${id}`)}
                  >
                    {t("order_details")}
                  </DropdownItem>
                  {isCancellable === "1" &&
                    status !== "cancelled" &&
                    status !== "delivered" && (
                      <DropdownItem onPress={onOpen} className="text-danger">
                        {t("cancel_order")}
                      </DropdownItem>
                    )}
                  {status === "delivered" &&
                    OrderDetails?.order_product_rating === "" && (
                      <DropdownItem onPress={() => setOpenReview(true)}>
                        {t("rate_product")}
                      </DropdownItem>
                    )}
                  {status === "delivered" &&
                    OrderDetails?.order_rider_rating === "0.0" && (
                      <DropdownItem onPress={() => setOpenRiderReview(true)}>
                        {t("rate_rider")}
                      </DropdownItem>
                    )}
                  {(status === "delivered" || status === "cancelled") && (
                    <DropdownItem onPress={handleReOrder}>
                      {t("re_order")}
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {/* Modals */}
          <section className="modals">
            {/* Rate Product Modal */}
            <Modal
              isOpen={openReview}
              onClose={() => setOpenReview(false)}
              className="rounded-lg"
              size="2xl"
            >
              <ModalContent className="p-0">
                <ModalHeader className="px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold">{t("rate_product")}</h2>
                </ModalHeader>

                <ModalBody className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  {OrderItems.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex flex-col md:flex-row gap-6 mb-8 last:mb-0 rounded-lg p-4 shadow-sm"
                    >
                      {/* Product Info */}
                      <div className="flex-1 flex items-start space-x-4">
                        <Image
                          src={item.image_sm}
                          alt={item.name}
                          className="rounded-lg w-32 h-32 object-cover"
                        />
                        <div className="flex flex-col space-y-2">
                          <span className="font-medium text-lg">
                            {item.name}
                          </span>
                          <ReactStars
                            count={5}
                            value={ratings[item.product_id]?.rating || 0}
                            onChange={(newRating) =>
                              setRatings((prev) => ({
                                ...prev,
                                [item.product_id]: {
                                  ...prev[item.product_id],
                                  rating: newRating,
                                },
                              }))
                            }
                            size={30}
                            activeColor="#ffd700"
                            isHalf={false}
                          />
                        </div>
                      </div>

                      {/* Review Input */}
                      <div className="flex-1 flex flex-col space-y-4">
                        <div className="relative">
                          <Textarea
                            placeholder="Write your review here"
                            value={comments[item.product_id] || ""}
                            onChange={(e) =>
                              setComments((prev) => ({
                                ...prev,
                                [item.product_id]: e.target.value,
                              }))
                            }
                            className="w-full min-h-[120px] p-3 pr-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                          <label className="absolute right-3 bottom-3 cursor-pointer">
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const newFiles = Array.from(
                                  e.target.files || []
                                );
                                setImages((prev) => ({
                                  ...prev,
                                  [item.product_id]: [
                                    ...(prev[item.product_id] || []),
                                    ...newFiles,
                                  ],
                                }));
                                e.target.value = "";
                              }}
                            />
                            <RiLink className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
                          </label>
                        </div>

                        {/* Image Previews */}
                        {images[item.product_id]?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {images[item.product_id].map((file, index) => (
                              <div key={index} className="relative group">
                                <Image
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => {
                                    setSelectedImage({
                                      url: URL.createObjectURL(file),
                                      index: index,
                                      productId: item.product_id,
                                    });
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const newImages = [
                                      ...images[item.product_id],
                                    ];
                                    newImages.splice(index, 1);
                                    setImages((prev) => ({
                                      ...prev,
                                      [item.product_id]: newImages,
                                    }));
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <RiCloseLine className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <RiImageLine className="w-4 h-4" />
                          {images[item.product_id]?.length
                            ? `${images[item.product_id].length} image${
                                images[item.product_id].length > 1 ? "s" : ""
                              } selected`
                            : "Optional: Share some pictures"}
                        </div>
                      </div>
                    </div>
                  ))}
                </ModalBody>

                <ModalFooter className="px-6 py-4 border-t">
                  <div className="flex justify-end space-x-3">
                    <Button
                      color="danger"
                      variant="light"
                      onPress={() => setOpenReview(false)}
                      className="rounded"
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      variant="solid"
                      onPress={handleSubmit}
                      className="rounded bg-primary text-white"
                    >
                      {t("submit_review")}
                    </Button>
                  </div>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* Reorder Confirmation Modal */}
            <Modal
              isOpen={showReorderConfirmation}
              onClose={() => setShowReorderConfirmation(false)}
            >
              <ModalContent>
                <ModalHeader>{t("reorder_successful")}</ModalHeader>
                <ModalBody>
                  <div className="flex items-center gap-4">
                    <RiCheckLine className="text-4xl text-green-500" />
                    <p>{t("reorder_successful_message")}</p>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    variant="solid"
                    onPress={() => {
                      setShowReorderConfirmation(false);
                      router.push("/user/cart");
                    }}
                    className="rounded"
                  >
                    {t("go_to_cart")}
                  </Button>
                  <Button
                    color="default"
                    variant="light"
                    onPress={() => setShowReorderConfirmation(false)}
                    className="rounded"
                  >
                    {t("continue_shopping")}
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* Rider Review Modal */}
            <Modal
              isOpen={openRiderReview}
              onClose={() => setOpenRiderReview(false)}
              className="rounded"
            >
              <ModalContent>
                <ModalHeader>{t("rate_rider")}</ModalHeader>
                <ModalBody>
                  <ReactStars
                    count={5}
                    onChange={setRiderRating}
                    size={52}
                    activeColor="#ffd700"
                    isHalf={false}
                  />

                  <div className="flex items-center space-x-3 mt-4">
                    <Avatar src={OrderDetails?.profile} className="w-12 h-12" />
                    <span className="text-lg font-semibold text-gray-800">
                      {OrderDetails?.rider_name}
                    </span>
                  </div>

                  <Textarea
                    placeholder="Write your review here"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-4"
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => setOpenRiderReview(false)}
                    className="rounded"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    variant="solid"
                    onPress={handleRiderRating}
                    className="rounded bg-primary text-white"
                    disabled={loading}
                  >
                    {loading ? t("submitting") : t("submit_review")}
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {/* Cancel Order Modal */}
            <Modal isOpen={isOpen} onClose={onClose} className="rounded">
              <ModalContent>
                <ModalHeader>{t("confirmation")}</ModalHeader>
                <ModalBody>
                  {t("cancel_order_confirmation")}
                  <Textarea
                    placeholder="Add reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="light"
                    color="danger"
                    onPress={onClose}
                    className="rounded"
                  >
                    {t("no")}
                  </Button>
                  <Button
                    variant="solid"
                    disabled={loading}
                    color="danger"
                    onPress={async () => {
                      setLoading(true);
                      try {
                        const formData = new FormData();
                        formData.append("order_id", id);
                        formData.append("status", "cancelled");
                        formData.append("reason", reason);

                        const { data } = await api.post(
                          "/update_order_status",
                          formData
                        );

                        if (data.error) {
                          toast.error(data.message);
                        } else {
                          toast.success(data.message);
                          onClose();
                        }
                      } catch (error) {
                        console.error(error);
                        toast.error("An error occurred, please try again.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="rounded"
                  >
                    {loading ? t("please_wait") : t("yes")}
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            {selectedImage && (
              <ImagePreviewModal
                isOpen={!!selectedImage}
                images={images}
                selectedImage={selectedImage}
                onClose={() => setSelectedImage(null)}
                setSelectedImage={setSelectedImage}
                {...selectedImage}
              />
            )}
          </section>
        </section>

        <Divider className="my-4" />

        <section className="flex flex-col gap-2">
          {OrderItems.slice(0, 3).map((item) => (
            <div key={item.id} className="font-semibold">
              {item.quantity} x {item.product_name}
            </div>
          ))}

          {OrderItems.length > 3 && (
            <div
              className="text-primary-500 font-semibold cursor-pointer"
              onClick={() => router.push(`/user/my-orders/${id}`)}
            >
              +{OrderItems.length - 3} show more
            </div>
          )}
        </section>

        <Divider className="my-4" />

        <section className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{t("order_date")}:</span>
            <span className="font-semibold">{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{t("payment_method")}:</span>
            <span className="font-semibold">{payment_method}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{t("total")}:</span>
            <span className="font-semibold">
              {formatPrice(
                payment_method === "wallet"
                  ? Number(wallet_balance)
                  : Number(amount)
              )}
            </span>
          </div>
        </section>
      </div>
    </Card>
  );
};

export default UserOrderCard;
