import React, { useCallback, useState } from "react";
import { RiHeartFill, RiHeartLine, RiStarFill } from "@remixicon/react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { addToFavorite, removeFromFavorite } from "@/interceptor/routes";
import { getUserData } from "@/events/getters";
import { toast } from "sonner";
import { Avatar, Card, CardBody, CardFooter, Chip } from "@heroui/react";
import { formatPrice } from "@/helpers/functionHelper";
import ProductModal from "../Modals/ProductModal";
import Image from "next/image";

const OfferCards = ({
  image,
  title,
  rating,
  product,
  price,
  specialPrice,
  discount,
  categoryName,
  discountedPrice,
  onFavoriteChange,
  isFavorite,
  indicator,
  is_spicy,
  best_seller,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const userData = getUserData();
  const branchData = useSelector((state) => state.branch);

  const dispatch = useDispatch();

  const favorites = useSelector((state) => state.favorites.value);

  const authentication = userData === false ? false : true;

  const branch_id = branchData.id;

  const handleFavChange = useCallback(
    async (value, id) => {
      if (!authentication) {
        return toast.error("Please Login First!");
      }
      try {
        if (value) {
          const add_fav = await addToFavorite({ type_id: id, branch_id });
          if (add_fav.error) {
            toast.error(add_fav.message);
          } else {
            toast.success(add_fav.message);
            onFavoriteChange(true, id);
          }
        } else {
          const removeFav = await removeFromFavorite({
            type_id: id,
            branch_id,
          });
          if (removeFav.error) {
            toast.error(removeFav.message);
          } else {
            toast.success(removeFav.message);
            onFavoriteChange(false, id);
          }
        }
      } catch (error) {
        console.error("Error updating favorite:", error);
      }
    },
    [authentication, branch_id, onFavoriteChange]
  );

  return (
    <Card
      className="relative w-full rounded overflow-hidden shadow-lg transition-transform transform duration-300 border 
      dark:bg-gray-800 dark:border-gray-700"
    >
      <div
        onClick={() => handleCardClick()}
        className="relative w-full h-full cursor-pointer"
      >
        <CardBody className="relative p-4 rounded">
          <img
            className="w-full h-40 sm:h-48 object-cover rounded transition-all duration-300"
            src={image}
            alt={title}
          />
          {indicator === "1" ? (
            <Image
              src="/assets/images/veg.png"
              alt="veg"
              height={32}
              width={32}
              className="absolute top-4 left-4"
            />
          ) : (
            <Image
              src="/assets/images/non-veg.png"
              alt="non-veg"
              height={32}
              width={32}
              className="absolute top-4 left-4"
            />
          )}
          {best_seller === "1" && (
            <div className="absolute bottom-4 left-4 z-10">
              <div className="bg-primary-500 bg-opacity-90 backdrop-blur-sm text-white py-1 px-2.5 rounded text-xs font-medium flex items-center gap-1.5 shadow-sm">
                <img
                  src="/assets/icons/icon_bestseller.svg"
                  alt="Best Seller"
                  className="w-3 h-3"
                />
                Best Selling
              </div>
            </div>
          )}
          <div
            role="button"
            onClick={() => handleFavChange(!isFavorite, product.id)}
            className="absolute top-2 right-2 z-10 p-2 rounded-full 
            bg-white/80 dark:bg-gray-700/80 
            hover:bg-white dark:hover:bg-gray-600 
            transition-all duration-300"
          >
            {isFavorite ? (
              <RiHeartFill className="w-5 h-5 text-red-500" />
            ) : (
              <RiHeartLine className="w-5 h-5 text-gray-500 dark:text-gray-300 hover:text-red-500" />
            )}
          </div>
        </CardBody>
        <CardFooter className="flex flex-col items-start px-6 py-4">
          <div className="flex items-center gap-2 mb-1 w-full">
            <div className="text-sm sm:text-lg truncate">
              <strong>{title}</strong>
            </div>
            {is_spicy === "1" && (
              <img
                src="/assets/icons/icon_spicy.svg"
                alt="Spicy"
                className="w-3.5 h-3.5 flex-shrink-0"
              />
            )}
          </div>

          <Chip
            as="div"
            size="sm"
            classNames={{
            base: "font-semibold text-xs text-primary-500 mb-1 rounded",
            content: "truncate overflow-hidden whitespace-nowrap max-w-[150px]"
          }}
            title={categoryName}
          >
            <span className="truncate block">{categoryName}</span>
          </Chip>

          <div className="text-center mb-3 flex items-start justify-start space-x-2">
            <span className="text-md sm:text-md text-primary-500 dark:text-primary-400 transition-colors duration-500 font-bold">
              {formatPrice(discountedPrice !== 0 ? discountedPrice : price)}
            </span>
            {discountedPrice !== price && discountedPrice != 0 && (
              <span className="text-md sm:text-sm text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            )}

            {discount !== undefined && discount !== null && (
              <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium ml-2 transition-colors duration-500">
                {discount !== 0 && discount !== 100 ? `${discount}% off` : ""}
              </span>
            )}
          </div>
          <ProductModal
            image={image}
            title={title}
            description={product?.short_description}
            variants={product?.variants}
            rating={product?.rating}
            price={price}
            discount={discount}
            discountedPrice={discountedPrice}
            categoryName={categoryName}
            addOns={product?.product_add_ons}
            onAddToBag={(details) => console.log(details)}
            indicator={product?.indicator}
          />
        </CardFooter>
      </div>
    </Card>
  );
};

export default OfferCards;
