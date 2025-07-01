import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Card, CardBody, Chip } from "@heroui/react";
import { RiStarFill, RiHeartFill, RiHeartLine } from "@remixicon/react";
import ProductModal from "../../components/Modals/ProductModal";
import { toast } from "sonner";
import { addToFavorite, removeFromFavorite } from "@/interceptor/routes";
import { setFavorites } from "@/store/reducers/favoritesSlice";
import { getUserData } from "@/events/getters";
import { formatPrice } from "@/helpers/functionHelper";

const ProductCard = ({
  id,
  image,
  title,
  price,
  discount,
  categoryName,
  rating,
  discountedPrice,
  product,
  isFavorite,
  onFavoriteChange,
  indicator,
  data,
  is_spicy,
  best_seller,
}) => {
  const userData = getUserData();
  const branchData = useSelector((state) => state.branch);
  const [checkedItems, setCheckedItems] = useState({});

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
      className="relative group rounded-lg text-center overflow-hidden"
      shadow="sm"
    >
      {/* Favorite Button */}
      <button
        onClick={() => handleFavChange(!isFavorite, product.id)}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-300"
      >
        {isFavorite ? (
          <RiHeartFill className="w-5 h-5 text-red-500" />
        ) : (
          <RiHeartLine className="w-5 h-5 text-gray-500 hover:text-red-500" />
        )}
      </button>

      {best_seller === "1" && (
        <div className="absolute top-0 left-0 z-10">
          <div className="bg-primary-500 text-white py-1 px-3 text-xs font-semibold shadow-md flex items-center gap-1 rounded-br-lg">
            <img
              src="/assets/icons/icon_bestseller.svg"
              alt="Best Seller"
              className="w-3 h-3"
            />
            Best Selling
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-[30%] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gray-200 rounded-b-[50%] transition-all duration-500 ease-in-out"></div>
        <div className="absolute top-0 left-0 w-full h-0 bg-primary-400 rounded-b-[50%] group-hover:h-full transition-all duration-500 ease-in-out"></div>
      </div>

      <CardBody className="relative z-[1] pt-6 px-5 pb-4 flex flex-col items-center">
        <div className="relative w-[100px] h-[100px] mx-auto mb-3">
          <Avatar
            src={image}
            alt={title}
            className="w-full h-full object-cover rounded-full border-4"
          />

          <div className="absolute top-0 right-0 w-7 h-7">
            <Avatar
              src={
                indicator === "1"
                  ? "/assets/images/veg.png"
                  : "/assets/images/non-veg.png"
              }
              alt={indicator === "1" ? "veg" : "non-veg"}
              className="w-full h-full object-cover rounded-full border-2 border-white"
            />
          </div>
        </div>

        <h2
          className="text-lg font-semibold text-center mb-1  
          w-full flex items-center justify-center gap-2"
          title={title}
        >
          <span className="truncate">{title}</span>
          {is_spicy === "1" && (
            <img
              src="/assets/icons/icon_spicy.svg"
              alt="Spicy"
              className="w-3.5 h-3.5"
            />
          )}
        </h2>

        <Chip
          as="div"
          size="sm"
          classNames={{
            base: "font-semibold text-xs text-primary-500 mb-1",
            content: "truncate overflow-hidden whitespace-nowrap max-w-[150px]",
          }}
          title={categoryName}
        >
          <span className="truncate block">{categoryName}</span>
        </Chip>

        <div className="flex justify-center mb-2">
          {[...Array(5)].map((_, i) => (
            <RiStarFill
              key={i}
              className={`w-4 h-4 ${
                i < rating ? "text-yellow-400" : "text-gray-300"
              } duration-500`}
            />
          ))}
        </div>

        <div className="text-center mb-3 flex items-center justify-center space-x-2">
          {discountedPrice !== price && discountedPrice != 0 && (
            <span className="text-xs text-gray-500 line-through">
              {formatPrice(price)}
            </span>
          )}
          <span className="text-md text-primary-500 ml-2 transition-colors duration-500 font-bold">
            {formatPrice(discountedPrice !== 0 ? discountedPrice : price)}
          </span>
          {discount !== undefined &&
            discount !== null &&
            discount !== 0 &&
            discount !== 100 && (
              <span className="text-sm text-green-600 font-medium ml-2">
                {discount}% off
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
      </CardBody>
    </Card>
  );
};

export default ProductCard;
