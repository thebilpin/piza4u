import React, { useCallback, useEffect, useState } from "react";
import { Image, Card, CardBody, CardHeader, CardFooter } from "@heroui/react";
import { Button } from "@heroui/button";
import { getProducts } from "@/repository/productsRepo";
import { RiStarFill } from "@remixicon/react";
import ProductModal from "../Modals/ProductModal";
import ProductsSkeleton from "../Skeleton/ProductsSkeleton";
import { formatPrice } from "@/helpers/functionHelper";
import NotFound from "../NotFound/NotFound";

const OurMenuCard = ({ queryConstants }) => {
  const [query, setQuery] = useState({ limit: 8, offset: 0 });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [end, setEnd] = useState(false);
  const [initialLimit, setInitialLimit] = useState(8);
  const [isExpanded, setIsExpanded] = useState(false);

  const request = useCallback(async () => {
    try {
      if (query.offset === 0) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const products = await getProducts({ ...query, ...queryConstants });

      if (query.offset === 0) {
        setLoading(false);
      } else {
        setIsLoadingMore(false);
      }

      if (products.data.length === 0) {
        setEnd(true);
      } else {
        if (products.data.length < query.limit) {
          setEnd(true);
        }
        setData((prevData) => {
          const newData = products.data.filter(
            (newItem) =>
              !prevData.some((existingItem) => existingItem.id === newItem.id)
          );
          return [...prevData, ...newData];
        });
      }
    } catch (error) {
      setLoading(false);
      setIsLoadingMore(false);
      console.error("Error fetching products:", error);
    }
  }, [query, queryConstants]);

  useEffect(() => {
    request();
  }, [query.offset, queryConstants?.category_slug]);

  useEffect(() => {
    setData([]); 
    setQuery({ limit: 8, offset: 0 });
    setEnd(false); 
  }, [queryConstants?.category_slug]); 

  
  const toggleLoadState = () => {
    if (isExpanded) {
      // Load Less
      setData((prevData) => prevData.slice(0, initialLimit));
      setQuery((prev) => ({ ...prev, offset: 0 }));
      setEnd(false);
      setIsExpanded(false);
    } else {
      // Load More
      if (!end && !loading && !isLoadingMore) {
        setQuery((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
        setIsExpanded(true);
      }
    }
  };

  return (
    <div>
      {loading && <ProductsSkeleton className="p-6" />}

      {!loading && data.length === 0 && <NotFound text={"No products found"} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {data.map((item, index) => (
          <Card
            key={`${item.id}-${index}`}
            isHoverable
            isPressable
            className="max-w-sm shadow-md transition-shadow rounded-lg hover:shadow-xl"
          >
            <CardHeader className="p-0 flex justify-center items-center relative h-52 md:h-60 bg-gray-100 rounded-t-lg">
              <Image
                className="w-auto h-full object-contain"
                src={item.image}
                alt={item.name}
              />
              {item.best_seller === "1" && (
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
            </CardHeader>
            <CardBody className="p-4 text-center">
              <h2 className="text-lg font-semibold truncate flex items-center justify-center gap-2">
                <span className="truncate">{item.name}</span>
                {item.is_spicy === "1" && (
                  <img
                    src="/assets/icons/icon_spicy.svg"
                    alt="Spicy"
                    className="w-3.5 h-3.5 flex-shrink-0"
                  />
                )}
              </h2>
              <div className="text-center mb-3 flex items-center justify-center space-x-2">
                {item.variants[0].special_price > 0 && (
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(item.variants[0].price)}
                  </span>
                )}
                <span className="text-md text-primary-500 ml-2 transition-colors duration-500 font-bold">
                  {formatPrice(
                    item.variants[0].special_price > 0
                      ? item.variants[0].special_price
                      : item.variants[0].price
                  )}
                </span>
              </div>
              {item.rating && (
                <div className="mt-2 flex justify-center items-center gap-1">
                  <RiStarFill className="text-yellow-500" />
                  <span className="text-sm">{item.rating}</span>
                </div>
              )}
            </CardBody>
            <CardFooter className="p-4 flex justify-center">
              <ProductModal
                image={item.image}
                title={item.name}
                categoryName={item.category_name}
                description={item?.short_description}
                variants={item?.variants}
                rating={item?.rating}
                addOns={item?.product_add_ons}
                onAddToBag={(details) => console.log(details)}
                indicator={item?.indicator}
              />
            </CardFooter>
          </Card>
        ))}
      </div>

      {!loading && isLoadingMore && (
        <ProductsSkeleton className="p-6 mt-6" count={4} />
      )}

      {(data.length > initialLimit || !end) && (
        <div className="col-span-full flex justify-center mt-6">
          <Button
            onClick={toggleLoadState}
            disabled={loading || isLoadingMore}
            className="px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition duration-300 font-bold"
          >
            {loading || isLoadingMore
              ? "Loading..."
              : isExpanded
                ? "Load Less"
                : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default OurMenuCard;
