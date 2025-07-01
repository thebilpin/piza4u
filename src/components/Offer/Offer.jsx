import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { Card, Image } from "@heroui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";

const HomeOffer = () => {
  const offers = useSelector((state) => state.homepage.offers);
  const loading = false;

  return (
    <div className="p-0">
      <h2 className="text-md sm:text-2xl font-bold sm:mx-auto mx-0 text-start sm:text-center flex-1">
        Offers
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Card
                key={index}
                isHoverable
                isPressable
                className="animate-pulse"
              >
                <div className="p-2">
                  <div className="bg-gray-200 w-full h-72 rounded-lg"></div>
                </div>
              </Card>
            ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center text-gray-500 py-6">No offers found</div>
      ) : offers.length > 6 ? (
        <Swiper
          slidesPerView={2}
          spaceBetween={10}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 7 },
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          modules={[Pagination]}
          className="my-4"
        >
          {offers.map((item, index) => {
            let link = "#";
            if (item?.type === "categories" && item?.data?.length > 0) {
              link = `/categories/${item?.data[0]?.slug}`;
            }

            return (
              <SwiperSlide key={index}>
                <Link href={link}>
                  <Card isHoverable isPressable className="shadow-none">
                    <div className="p-2">
                      <Image
                        src={item.image}
                        alt={`Offer image ${index + 1}`}
                        loading="lazy"
                        className="rounded-lg w-full h-52 object-cover"
                      />
                    </div>
                  </Card>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {offers.map((item, index) => {
            let link = "#";
            if (item?.type === "categories" && item?.data?.length > 0) {
              link = `/categories/${item?.data[0]?.slug}`;
            }

            return (
              <Link href={link} key={index}>
                <Card isHoverable isPressable className="shadow-none">
                  <div className="p-2">
                    <Image
                      src={item.image}
                      alt={`Offer image ${index + 1}`}
                      loading="lazy"
                      className="rounded-lg w-full h-52 object-cover"
                    />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomeOffer;
