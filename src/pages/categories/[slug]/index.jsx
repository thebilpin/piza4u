"use client";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import OurMenuCard from "../../../components/Cards/OurMenuCard";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import ProductsSkeleton from "@/components/Skeleton/ProductsSkeleton";

const BlogPostPage = () => {
  const [slug, setSlug] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (router.query.slug) {
      // console.log("Slug from query:", router.query.slug);
      setSlug(router.query.slug);
      setLoading(false);
    }
  }, [router.query.slug]);

  if (loading) {
    return (
      <ProductsSkeleton className="p-6" />
    );
  }

  return slug == null ? (
    <></>
  ) : (
    <>
      <BreadCrumb />
      <OurMenuCard queryConstants={{ category_slug: slug }} />
    </>
  );
};

export default BlogPostPage;
