import { Card, CardBody, Image } from "@heroui/react";
import Link from "next/link";
import React from "react";

const CategoryCards = ({ image, title, slug }) => {
  return (
    <div className="flex justify-center items-center hover:scale-105 transition-transform duration-300 ease-in-out">
      <Link href={`/categories/${slug}`} className="block">
        <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow rounded">
          <div className="flex justify-center items-center h-28 w-28 md:h-44 md:w-44 overflow-hidden rounded">
            <Image
              src={image}
              srcSet={`${image} 2x`}
              loading="lazy"
              alt={title}
              className="object-contain h-full w-full"
            />
          </div>
          <CardBody orientation="horizontal" className="text-start md:text-center mt-2">
            <span className="font-semibold text-sm truncate max-w-[150px] overflow-hidden" title={title}>{title}</span>
          </CardBody>
        </Card>
      </Link>
    </div>
  );
};

export default CategoryCards;
