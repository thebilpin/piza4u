import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Breadcrumbs } from "@heroui/react";
import FeatureProducts from "@/views/FeatureProducts";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";

const Index = () => {
  const [slug, setSlug] = useState(null);

  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      const slug = router.query.slug; // Assumes the slug is part of the route params
      setSlug(slug);
    }
  }, [router.isReady, router.query.slug]);



  return (
    <div>
      <BreadCrumb />
      {/* <FeatureProducts /> */}
    </div>
  );
};

export default Index;
