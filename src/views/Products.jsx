import React, { useEffect, useState, useRef, useCallback } from "react";
import { get_products, getFavorites } from "../interceptor/routes";
import { useSelector, useDispatch } from "react-redux";
import { getUserData } from "../events/getters";
import { setFavorites } from "@/store/reducers/favoritesSlice";
import ProductCard from "../components/Cards/ProductCards";
import { Button } from "@heroui/button";
import Filter from "../components/Filter/Filter";
import { Card, Skeleton } from "@heroui/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import NotFound from "@/components/NotFound/NotFound";
import ProductCardSkeleton from "@/components/Skeleton/ProductCardSkeleton";

const Products = ({ initialCategoryId, initialCategoryName }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch();

  const branchData = useSelector((state) => state.branch);
  const favorites = useSelector((state) => state.favorites)?.value || [];
  const authentication = useSelector((state) => state.authentication.isLogged);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingNewProducts, setLoadingNewProducts] = useState(false);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [category_id, setCategory_id] = useState(initialCategoryId);
  const [vegetarian, setVegetarian] = useState(0);
  const [order, setOrder] = useState("");
  const [sort, setSort] = useState("");
  const [initialLimit] = useState(12);
  const [end, setEnd] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [indicatorType, setIndicatorType] = useState("");
  const [selectedPrice, setSelectedPrice] = useState();
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Constants
  const branch_id = branchData.id;
  const filter_by = "p.id";
  const userData = getUserData();

  // Refs
  const observerRef = useRef(null);
  const hasFetchedFavorites = useRef(false);
  const isFirstRender = useRef(true);

  const [selectedCategory, setSelectedCategory] = useState(
    initialCategoryId
      ? { id: initialCategoryId, name: initialCategoryName }
      : undefined
  );

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Favorites handling
  const fetchFavorites = useCallback(async () => {
    try {
      const favoritesResponse = await getFavorites({ branch_id });
      setFavoriteItems(favoritesResponse.data);
      dispatch(setFavorites(favoritesResponse.data));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  }, [branch_id, dispatch]);

  useEffect(() => {
    if (authentication === false) {
      setFavoriteItems([]);
      dispatch(setFavorites([]));
      hasFetchedFavorites.current = false;
    } else if (!hasFetchedFavorites.current) {
      fetchFavorites();
      hasFetchedFavorites.current = true;
    }
  }, [authentication, dispatch, fetchFavorites]);

  const isItemFavorited = useCallback(
    (itemId) => {
      return favorites?.some((fav) => fav.id === itemId) || false;
    },
    [favorites]
  );

  const handleFavoriteChange = useCallback(
    async (isAdding, id) => {
      if (isAdding) {
        dispatch(setFavorites([...favorites, { id }]));
      } else {
        dispatch(setFavorites(favorites.filter((item) => item.id !== id)));
      }
    },
    [dispatch, favorites]
  );

  const getProducts = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setOffset(0);
        setProducts([]);
      } else {
        setLoadingNewProducts(true);
      }

      const currentOffset = reset ? 0 : offset;

      const productResponse = await get_products({
        branch_id,
        limit: initialLimit,
        offset: currentOffset,
        search,
        vegetarian: vegetarian ?? "",
        category_id: category_id > 0 ? category_id : 0,
        filter_by: order === "" ? "" : filter_by,
        sort,
        order,
        min_price: minPrice,
        max_price: maxPrice,
      });

      if (reset) {
        setIsLoading(false);
      } else {
        setLoadingNewProducts(false);
      }

      if (productResponse.data.length > 0) {
        setTotal(productResponse.total);

        setProducts((prevProducts) => [
          ...prevProducts,
          ...productResponse.data,
        ]);

        setOffset(currentOffset + productResponse.data.length);

        setHasMore(
          currentOffset + productResponse.data.length < productResponse.total
        );
      } else {
        setHasMore(false);
      }
    } catch (error) {
      setIsLoading(false);
      setLoadingNewProducts(false);
      console.error("Error while fetching products:", error);
    }
  };

  const filtersRef = useRef({
    category_id,
    order,
    vegetarian,
    sort,
    minPrice,
    maxPrice,
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      getProducts(true);
      return;
    }

    const {
      category_id: prevCategory,
      order: prevOrder,
      vegetarian: prevVegetarian,
      sort: prevSort,
      minPrice: prevMin,
      maxPrice: prevMax,
    } = filtersRef.current;

    if (
      category_id === prevCategory &&
      order === prevOrder &&
      vegetarian === prevVegetarian &&
      sort === prevSort &&
      minPrice === prevMin &&
      maxPrice === prevMax
    ) {
      return; 
    }

    filtersRef.current = {
      category_id,
      order,
      vegetarian,
      sort,
      minPrice,
      maxPrice,
    };

    const debouncedGetProducts = setTimeout(() => {
      getProducts(true);
    }, 300);

    return () => clearTimeout(debouncedGetProducts);
  }, [category_id, order, vegetarian, sort, minPrice, maxPrice]);

  // Infinite scroll handling
  useEffect(() => {
    if (!products.length) return; 

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !loadingNewProducts) {
          getProducts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [hasMore, loadingNewProducts, products]);

  // Filter handlers
  const onCategorySelection = useCallback(
    (category) => {
      const updatedCategory = category || "";
      setCategory_id(updatedCategory);
      {
        console.log(updatedCategory);
      }
      const updatedQuery = { ...router.query };
      if (updatedCategory) {
        updatedQuery.categoryId = updatedCategory;
      } else {
        delete updatedQuery.categoryId;
      }

      router.push(
        {
          pathname: router.pathname,
          query: updatedQuery,
        },
        undefined,
        { shallow: true }
      );
    },
    [router]
  );

  const handleClearAllFilters = useCallback(() => {
    setCategory_id("");
    setVegetarian("");
    setOrder("");
    setSort("");
    setMinPrice("");
    setMaxPrice("");

    // Clear all query parameters
    router.push(
      {
        pathname: router.pathname,
      },
      undefined,
      { shallow: true }
    );
  }, [router]);

  const onTypeSelection = (type) => {
    const vegetarianValue = type === "Veg" ? 1 : type === "Non - Veg" ? 2 : "";
    setVegetarian(vegetarianValue);

    const updatedQuery = {
      ...router.query,
      type: type || undefined,
    };

    if (!type) delete updatedQuery.type;

    router.push(
      {
        pathname: router.pathname,
        query: updatedQuery,
      },
      undefined,
      { shallow: true }
    );
  };

  const onPriceSelection = (value) => {
    if (value === "Low to High") {
      setOrder("ASC");
      setSort("pv.price");
    } else if (value === "High to Low") {
      setOrder("DESC");
      setSort("pv.price");
    } else {
      setOrder("");
      setSort("");
    }
  };

  const handlePriceRangeSelection = ({ min_price, max_price }) => {
    const validMinPrice = min_price !== "" ? Number(min_price) : undefined;
    const validMaxPrice = max_price !== "" ? Number(max_price) : undefined;

    setMinPrice(validMinPrice);
    setMaxPrice(validMaxPrice);

    const updatedQuery = {
      ...router.query,
      minPrice: validMinPrice || undefined,
      maxPrice: validMaxPrice || undefined,
    };

    if (!validMinPrice) delete updatedQuery.minPrice;
    if (!validMaxPrice) delete updatedQuery.maxPrice;

    router.push(
      {
        pathname: router.pathname,
        query: updatedQuery,
      },
      undefined,
      { shallow: true }
    );

    setOffset(0);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-0">
        {/* Desktop Filter */}
        <div className="hidden md:block w-full md:w-1/4 lg:w-1/5">
          <Filter
            onPriceSelection={onPriceSelection}
            onCategorySelection={onCategorySelection}
            onTypeSelection={onTypeSelection}
            indicatorType={indicatorType}
            selectedPrice={selectedPrice}
            selectedCategory={selectedCategory}
            onPriceRangeSelection={handlePriceRangeSelection}
            isMobile={false}
          />
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="grid xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {!isLoading && products.length > 0 ? (
              products.map((item, index) => (
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
                  data={favoriteItems}
                  onFavoriteChange={handleFavoriteChange}
                  isFavorite={isItemFavorited(item.id)}
                  indicator={item.indicator}
                  is_spicy={item.is_spicy}
                  best_seller={item.best_seller}
                />
              ))
            ) : (
              <div className="col-span-full">
                {!isLoading && <NotFound text={t("no_products_available")} />}
              </div>
            )}
          </div>

          {/* Loading More Products Indicator */}
          {hasMore && (
            <div ref={observerRef} className="flex justify-center w-full py-4">
              {loadingNewProducts && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter */}
      {isMobile && (
        <Filter
          onPriceSelection={onPriceSelection}
          onCategorySelection={onCategorySelection}
          onTypeSelection={onTypeSelection}
          indicatorType={indicatorType}
          selectedPrice={selectedPrice}
          selectedCategory={selectedCategory}
          onPriceRangeSelection={handlePriceRangeSelection}
          isMobile={true}
        />
      )}
    </>
  );
};

export default Products;
