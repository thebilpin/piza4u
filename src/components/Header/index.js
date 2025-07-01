import dynamic from "next/dynamic";
import React from "react";

const Header = dynamic(() => import("../../components/Header/Header"), {
  ssr: false,
});

const index = () => { 
  return (
    <>
      <Header />
    </>
  );
};

export default index;
