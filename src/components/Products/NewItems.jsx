import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import OfferCards from "../Cards/OfferCards";

const NewItems = ({ data }) => {
  const hasMoreThanSixProducts = data.product_details.length > 6;

  return (
    <>
      {/* <h1 className="text-2xl font-bold text-start my-6">{data.title}</h1> */}

      <div
        className={`mx-auto px-4 py-6 ${hasMoreThanSixProducts ? "bg-gray-100" : ""}`}
      >
        <Swiper
          spaceBetween={10}
          slidesPerView={2} 
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 6 },
          }}
          loop={false}
          pagination={{ clickable: true }}
        >
          {data.product_details.map((item, index) => {
            const discount = item.min_max_price.discount_in_percentage;
            if (index > 2) {
              return (
                <SwiperSlide key={index}>
                  <OfferCards
                    image={item.image_sm}
                    id={item.id}
                    discount={discount}
                    specialPrice={item.variants[0].special_price}
                    categoryName={item.category_name}
                    title={item.name}
                    rating={item.rating}
                    discountedPrice={
                      item.variants[0].special_price !== 0
                        ? item.variants[0].special_price
                        : item.variants[0].price
                    }
                    price={item.variants[0]?.price}
                    type={item.type}
                    product={item}
                  />
                </SwiperSlide>
              );
            }
          })}
        </Swiper>
      </div>
    </>
  );
};

export default NewItems;
