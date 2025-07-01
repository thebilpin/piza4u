"use client"

import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('../../views/homepage'), {
    ssr: false
  });


const Home = () =>{
    return <HomePage/>
}

export default Home;