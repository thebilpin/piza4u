import React, { useEffect, useState } from "react";
import { getOfferImages } from "../interceptor/routes";
import { Card, Image } from "@heroui/react";
import { useTranslation } from "react-i18next";
import NotFound from "@/components/NotFound/NotFound";
import Link from "next/link";

const OfferView = () => {
  const { t } = useTranslation();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    try {
      const offers = await getOfferImages();
      if (!offers.error) {
        setOffers(offers.data);
      }
    } catch (error) {
      console.error("Error occurred while fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className="p-0">
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
        <NotFound text={t("no_offers_found")} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {offers.map((item, index) => {
            let link = "#";
            if (item?.type === "categories" && item?.data?.length > 0) {
              link = `/categories/${item?.data[0]?.slug}`;
            }

            return (
              <Link href={link} key={index}>
                <Card isHoverable isPressable>
                  <div className="p-2">
                    <Image
                      src={item.image}
                      alt={`Offer image ${index + 1}`}
                      loading="lazy"
                      className="rounded-lg min-h-72"
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

export default OfferView;
