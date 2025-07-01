import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Input,
  ModalHeader,
} from "@heroui/react";
import debounce from "lodash.debounce";
import { get_products } from "@/interceptor/routes";
import ProductCard from "../Cards/ProductCards";
import CategoryCard from "../Cards/CategoryCard";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setFavorites } from "@/store/reducers/favoritesSlice";
import { Navigation } from "swiper/modules";
import { useRouter } from "next/router";
import {
  RiSearch2Line,
  RiArrowLeftLine,
  RiArrowRightLine,
} from "@remixicon/react";
import { useTranslation } from "react-i18next";
import NotFound from "../NotFound/NotFound";
import ProductCardSkeleton from "../Skeleton/ProductCardSkeleton";

const SearchHeader = () => {
  const { t } = useTranslation();
  const homeStoreData = useSelector((state) => state.homepage);
  const categories = homeStoreData?.categories;
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const favorites = useSelector((state) => state.favorites.value);
  const dispatch = useDispatch();
  const router = useRouter();
  const swiperRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const isItemFavorited = (itemId) => {
    return favorites?.some((fav) => fav.id === itemId) || false;
  };

  const debounceUpdateQuery = useMemo(
    () =>
      debounce((query) => {
        setDebouncedQuery(query);
      }, 1000),
    []
  );

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setHasSearched(false); 
    debounceUpdateQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setProducts([]);
    setHasSearched(false);
  };

  const handleFavoriteChange = (isAdding, id) => {
    if (isAdding) {
      dispatch(setFavorites([...favorites, { id }]));
    } else {
      dispatch(setFavorites(favorites.filter((item) => item.id !== id)));
    }
  };

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };

  const handleReachBeginning = () => {
    setIsBeginning(true);
  };

  const handleReachEnd = () => {
    setIsEnd(true);
  };

  const handleFromBeginning = () => {
    setIsBeginning(false);
  };

  const handleFromEnd = () => {
    setIsEnd(false);
  };

  const handleCategoryClick = (categorySlug) => {
    setIsOpen(false);
    router.push(`/categories/${categorySlug}`);
  };

  useEffect(() => {
    if (debouncedQuery.trim()) {
      setLoading(true);
      get_products({ search: debouncedQuery, is_search_modal: true })
        .then((res) => {
          setProducts(res.data);
          setHasSearched(true); 
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setProducts([]);
      setLoading(false);
      setHasSearched(false);
    }
  }, [debouncedQuery]);

  const renderSearchResults = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (hasSearched && searchQuery.trim() && products.length === 0) {
      return <NotFound text={"No Products Found"} />;
    }

    if (products.length > 0) {
      return (
        <div className="grid sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.map((item) => (
            <div key={item.id}>
              <ProductCard
                image={item.image}
                discount={item.min_max_price.discount_in_percentage}
                categoryName={item.category_name}
                title={item.name}
                discountedPrice={
                  item.variants[0].special_price != 0
                    ? item.variants[0].special_price
                    : item.variants[0].price
                }
                price={item.variants[0].price}
                type={"veg"}
                rating={item.rating}
                product={item}
                best_seller={item.best_seller}
                is_spicy={item.is_spicy}
                id={item.id}
                data={favorites}
                onFavoriteChange={handleFavoriteChange}
                isFavorite={isItemFavorited(item.id)}
                indicator={item.indicator}
              />
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div
        className="cursor-pointer p-0 sm:p-2 rounded-full hover:bg-primary-50 transition flex items-center gap-3"
        onClick={() => setIsOpen(true)}
      >
        <RiSearch2Line
          className="hover:text-primary-500 transition-colors"
          size={20}
        />
        <span className="inline sm:hidden font-medium">{t("search")}</span>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          clearSearch();
        }}
        size="full"
      >
        <ModalContent>
          <ModalHeader className="flex justify-center">
            <Input
              className={`w-80 ${isFocused ? "ring-2-primary" : ""}`}
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search products..."
              type="search"
              autoFocus
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              startContent={
                <RiSearch2Line
                  className="w-9 group-focus-within:text-primary-500 transition-colors"
                  size={20}
                />
              }
            />
          </ModalHeader>

          <ModalBody className="p-4 max-h-[calc(100vh-100px)] overflow-y-auto">
            <div className="flex flex-col gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-lg">Order by Category</h2>
                  <div className="flex flex-row gap-2">
                    <button
                      className={`p-2 ${
                        isBeginning ? "bg-gray-300" : "bg-gray-500"
                      } text-white rounded-full transition`}
                      onClick={handlePrev}
                      disabled={isBeginning}
                    >
                      <RiArrowLeftLine size={16} />
                    </button>
                    <button
                      className={`p-2 ${
                        isEnd ? "bg-gray-300" : "bg-gray-500"
                      } text-white rounded-full transition`}
                      onClick={handleNext}
                      disabled={isEnd}
                    >
                      <RiArrowRightLine size={16} />
                    </button>
                  </div>
                </div>

                <Swiper
                  ref={swiperRef}
                  spaceBetween={10}
                  slidesPerView="auto"
                  modules={[Navigation]}
                  onReachBeginning={handleReachBeginning}
                  onReachEnd={handleReachEnd}
                  onSlidePrevTransitionStart={handleFromEnd}
                  onSlideNextTransitionStart={handleFromBeginning}
                  breakpoints={{
                    320: {
                      slidesPerView: 3,
                    },
                    640: {
                      slidesPerView: 6,
                    },
                    1024: {
                      slidesPerView: 9,
                    },
                  }}
                >
                  {categories.map((category) => (
                    <SwiperSlide
                      key={category.slug}
                      className="w-[150px] h-[200px] flex-shrink-0"
                      onClick={() => handleCategoryClick(category.slug)}
                    >
                      <CategoryCard category={category} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <div>{renderSearchResults()}</div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SearchHeader;
