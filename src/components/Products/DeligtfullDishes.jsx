import React, { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "../../components/Cards/ProductCards";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import SectionHeading from "../SectionHeading/SectionHeading";

const DelightfulDishes = ({ data, onFavoriteChange, isItemFavorited }) => {
  const { t } = useTranslation();

  const router = useRouter();

  const handleViewAllClick = () => {
    router.push(`/products`);
  };

  return (
    <div className="mx-auto px-0 py-2">
      <SectionHeading
        title={t("delightful_dishes")}
        shortDescription="Flavors to brighten your day."
        onShowMoreClick={handleViewAllClick}
      />

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {data.map((item, index) => (
          <ProductCard
            key={index}
            image={item.image_sm}
            title={item.name}
            categoryName={item.category_name}
            rating={item.rating}
            price={item.variants[0]?.price}
            specialPrice={item.variants[0]?.special_price}
            discount={item.min_max_price.discount_in_percentage}
            discountedPrice={
              item.variants[0]?.special_price != 0
                ? item.variants[0]?.special_price
                : item.variants[0]?.price
            }
            description={item.description}
            product={item}
            // data={favoriteItems}
            onFavoriteChange={onFavoriteChange}
            isFavorite={isItemFavorited(item.id)}
            indicator={item.indicator}
            is_spicy={item.is_spicy}
            best_seller={item.best_seller}
          />
        ))}
      </div>
    </div>
  );
};

export default DelightfulDishes;
