import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { get_sections } from "../interceptor/routes";
import { useSelector } from "react-redux";
import ProductCard from "../components/Cards/ProductCards";
import { useTranslation } from "react-i18next";
import ProductsSkeleton from "@/components/Skeleton/ProductsSkeleton";

const FeatureProducts = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { slug } = router.query;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const branch_id = useSelector((state) => state.branch.id);
  const p_limit = 10;
  const p_offset = 0;
  const p_sort = "pv.price";

  useEffect(() => {
    if (!slug || !branch_id) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await get_sections({
          section_slug: slug,
          branch_id,
          p_limit,
          p_offset,
          p_sort,
        });

        if (response?.data?.length) {
          setProducts(response.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, branch_id]); 

  if (loading) {
    return <ProductsSkeleton count={p_limit} />;
  }

  if (!products.length) {
    return <div>No products found.</div>;
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-start my-4">Feature Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {products.map((item, index) =>
          item?.product_details?.map((detail, idx) => (
            <ProductCard
              key={`${index}-${idx}`}
              image={detail?.image}
              title={detail?.name}
              categoryName={detail?.category_name}
              rating={detail?.rating}
              price={detail?.variants[0]?.price || 0}
              specialPrice={detail?.variants[0]?.special_price || 0}
              discount={detail?.variants[0]?.discount || 0}
              discountedPrice={
                detail?.variants[0]?.special_price > 0
                  ? detail?.variants[0]?.special_price
                  : detail?.variants[0]?.price
              }
              description={detail?.description}
              stockType={detail?.stock_type}
              product={detail}
              isFavorite={detail?.is_favorite === 1}
              indicator={detail?.indicator}
              data={item.product_details}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FeatureProducts;