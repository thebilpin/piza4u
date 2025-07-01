"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Link from "next/link";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Card, Image } from "@heroui/react";

const HeadSlider = ({ images = [] }) => {
  return (
    <div className="p-0">
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={3}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        loop={true}
        breakpoints={{
          320: {
            slidesPerView: 1,
          },
          640: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 1,
          },
        }}
        
      >
        {images.map((image, index) => {
          let link = "#";
          if (image?.type === "categories" && image?.data?.length > 0) {
            link = `/categories/${image?.data[0]?.slug}`;
          }

          return (
            <SwiperSlide key={index}>
              <div className="flex justify-center w-full">
                <Link href={link}>
                  <Card
                    isPressable
                    isHoverable
                    variant="bordered"
                    className="w-full"
                  >
                    <Image
                      src={image.image}
                      alt={"Slide"}
                      height={450}
                      width={"100%"}
                      className="object-cover w-screen"
                    />
                  </Card>
                </Link>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default HeadSlider;
