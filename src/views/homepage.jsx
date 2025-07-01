"use client";

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import Header from "../components/Header/Header";
import HeadSlider from "../components/Slider/HeadSlider";
import Category from "../components/Categories/Category";

import DeligtfullDishes from "../components/Products/DeligtfullDishes";
import Offer from "../components/Products/Offer";
import PopularSection from "../components/Products/PopularSection";
import CTAMobileAppDownload from "@/components/CTAMobileAppDownload/CTAMobileAppDownload";
import { HeadTitle } from "@/components/HeadTitle";
import { setFavorites } from "@/store/reducers/favoritesSlice";
import { getFavorites } from "@/interceptor/routes";
import HomeOffer from "@/components/Offer/Offer";

const HomePage = () => {
  const homeStoreData = useSelector((state) => state.homepage);
  const branchData = useSelector((state) => state.branch);
  const branch_id = branchData.id;
  const dispatch = useDispatch();
  const authentication = useSelector((state) => state.authentication.isLogged);

  useEffect(() => {
    if (authentication === false) {
      dispatch(setFavorites([]));
    } else if (authentication === true) {
      fetchFavorites();
    }
  }, [authentication, branch_id]);

  const fetchFavorites = async () => {
    if (authentication === false) {
      dispatch(setFavorites([]));
      return;
    }

    try {
      const favorites = await getFavorites({ branch_id });
      dispatch(setFavorites(favorites.data));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const favoriteItemsRedux = useSelector((state) => state.favorites.value);

  const isItemFavorited = (itemId) => {
    if (authentication === false) return false;
    return favoriteItemsRedux.some((fav) => fav.id === itemId);
  };

  const handleFavoriteChange = (isAdding, id) => {
    if (authentication === false) return;

    dispatch(
      setFavorites(
        isAdding
          ? [...favoriteItemsRedux, { id }]
          : favoriteItemsRedux.filter((item) => item.id !== id)
      )
    );
  };

  return (
    <>
      <HeadTitle title={"Home"} />
      <div className="mt-6">
        <HeadSlider images={homeStoreData.banner} />
      </div>

      <div className="mt-6">
        <Category />
      </div>

      <div className="mt-6">
        <HomeOffer />
      </div>

      <div className="mt-6">
        <DeligtfullDishes
          data={homeStoreData.delightfullSections}
          onFavoriteChange={handleFavoriteChange}
          isItemFavorited={isItemFavorited}
        />
      </div>

      <div className="mt-6">
        <PopularSection
          data={homeStoreData.popularSections}
          onFavoriteChange={handleFavoriteChange}
          isItemFavorited={isItemFavorited}
        />
      </div>

      {homeStoreData.sections && (
        <div className="mt-6">
          {homeStoreData.sections.map((val, index) => {
            return (
              <div key={val.id}>
                <Offer
                  data={val}
                  onFavoriteChange={handleFavoriteChange}
                  isItemFavorited={isItemFavorited}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="my-6">
        <CTAMobileAppDownload />
      </div>
    </>
  );
};

export default HomePage;
