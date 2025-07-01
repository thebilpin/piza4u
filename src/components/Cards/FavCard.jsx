import {
  Card,
  CardHeader,
  CardBody,
  Image,
  Chip,
  CardFooter,
} from "@heroui/react";
import { RiHeart3Line, RiHeart3Fill } from "@remixicon/react";
import { useSelector } from "react-redux";
import { formatPrice } from "@/helpers/functionHelper";
import ProductModal from "../Modals/ProductModal";

const FavCard = ({
  id,
  variants,
  name,
  image,
  shortDescription,
  categoryName,
  minMaxPrice,
  isSpicy,
  bestSeller,
  rating,
  productAddOns,
  handleRemove,
  isFavorite,
  discount,
  discount_in_percentage,
}) => {
  const { price, special_price } = variants?.[0] || {};

  const handleFavoriteClick = () => {
    if (isFavorite) handleRemove(id);
  };

  const discountedPrice = special_price > 0 ? special_price : price;

  return (
    <Card className="max-w-sm w-full rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="relative mb-3 p-0">
        <div className="w-full h-[150px] overflow-hidden rounded-lg flex justify-center items-center">
          <Image
            src={image}
            alt={name}
            className="w-full h-auto object-cover"
          />
        </div>

        {bestSeller === "1" && (
          <div className="absolute top-4 left-4 z-10">
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

        <span
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 text-danger cursor-pointer z-10 rounded-full p-1 hover:bg-gray-100"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? <RiHeart3Fill size={20} /> : <RiHeart3Line size={20} />}
        </span>
      </CardHeader>

      <CardBody className="flex flex-col space-y-1">
        <Chip
          classNames={{
            base: "font-semibold text-xs text-primary-500 mb-1",
            content: "truncate overflow-hidden whitespace-nowrap max-w-[150px]"
          }}
          size="sm"
          title={categoryName}
        >
          {categoryName}
        </Chip>

        <h4 className="text-lg font-semibold truncate flex items-center gap-2">
          <span className="truncate">{name}</span>
          {isSpicy === "1" && (
            <img
              src="/assets/icons/icon_spicy.svg"
              alt="Spicy"
              className="w-3.5 h-3.5 flex-shrink-0"
            />
          )}
        </h4>
        <p className="text-gray-600 text-xs line-clamp-2">{shortDescription}</p>

        <div className="flex items-center justify-between mt-2">
          <div>
            {special_price > 0 && (
              <span className="text-gray-400 line-through text-xs font-medium">
                {formatPrice(price)}
              </span>
            )}
            <span className="text-primary-500 text-sm font-semibold">
              {formatPrice(discountedPrice)}
            </span>
          </div>
          {discount !== undefined &&
            discount !== null &&
            discount !== 0 &&
            discount !== 100 && (
              <span className="text-sm text-green-600 font-medium ml-2">
                {discount}% off
              </span>
            )}
        </div>
      </CardBody>

      <CardFooter className="flex justify-center mt-2">
        <ProductModal
          image={image}
          categoryName={categoryName}
          title={name}
          description={shortDescription}
          rating={rating}
          price={price}
          specialPrice={special_price}
          discount={minMaxPrice?.discount_in_percentage}
          discountedPrice={discountedPrice}
          variants={variants}
          addOns={productAddOns}
        />
      </CardFooter>
    </Card>
  );
};

export default FavCard;
