"use client";
import FavCard from "@/components/Cards/FavCard";
import { getUserData } from "@/events/getters";
import { getFavorites, removeFromFavorite } from "@/interceptor/routes";
import { setFavorites } from "@/store/reducers/favoritesSlice";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Pagination } from "@heroui/react";

const Favorites = () => {
  const branchData = useSelector((state) => state.branch);
  const favorites = useSelector((state) => state.favorites)?.value;
  const userData = getUserData();

  const [favoriteItems, setFavoriteItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const branch_id = branchData.id;
  const dispatch = useDispatch();

  const authentication = userData !== false;

  // Memoized get_favorites
  const get_favorites = useCallback(async () => {
    try {
      const favorites = await getFavorites({ branch_id });
      dispatch(setFavorites(favorites.data));
      setFavoriteItems(favorites.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  }, [branch_id, dispatch]);

  const hasFetchedFavorites = useRef(false);

  useEffect(() => {
    if (!authentication) {
      console.log("User is unauthorized");
      setFavoriteItems([]);
      dispatch(setFavorites([]));
      hasFetchedFavorites.current = false;
    } else {
      if (!hasFetchedFavorites.current) {
        get_favorites();
        hasFetchedFavorites.current = true;
        console.log("User is authorized, fetching favorites");
      }
    }
  }, [authentication, dispatch, get_favorites]);

  const handleRemove = async (id) => {
    try {
      const removeFav = await removeFromFavorite({
        type_id: id,
        branch_id,
      });
      if (removeFav.error) {
        toast.error(removeFav.message);
      } else {
        toast.success(removeFav.message);

        const updatedFavorites = favoriteItems.filter((item) => item.id !== id);
        setFavoriteItems(updatedFavorites);
        dispatch(setFavorites(updatedFavorites));
      }
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate paginated items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = favoriteItems.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {currentItems.map((item, index) => (
          <FavCard
            key={item.id}
            id={item.id}
            variants={item.variants}
            name={item.name}
            image={item.image}
            shortDescription={item.short_description}
            categoryName={item.category_name}
            minMaxPrice={item.min_max_price}
            isSpicy={item.is_spicy}
            discount={item.min_max_price.discount_in_percentage}
            discountedPrice={
              item.variants[0]?.special_price != 0
                ? item.variants[0]?.special_price
                : item.variants[0]?.price
            }
            bestSeller={item.best_seller}
            rating={item.rating}
            productAddOns={item.product_add_ons}
            handleRemove={handleRemove}
            isFavorite={favorites.some((fav) => fav.id === item.id)}
          />
        ))}
      </div>
      {favoriteItems.length > itemsPerPage && (
        <div className="flex justify-center">
          <Pagination
            total={Math.ceil(favoriteItems.length / itemsPerPage)}
            initialPage={1}
            page={currentPage}
            onChange={handlePageChange}
            showControls
          />
        </div>
      )}
    </div>
  );
};

export default Favorites;
