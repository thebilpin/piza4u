import React from 'react'
import dynamic from 'next/dynamic'
import { HeadTitle } from '@/components/HeadTitle'
import BreadCrumb from '@/components/BreadCrumb/BreadCrumb'

const CartView = dynamic(() => import('@/views/CartView'), { 
  ssr: false 
})

const index = () => {
  return (
    <div>
      <HeadTitle title={"Cart"}/>
      <BreadCrumb/>
      <CartView/>
    </div>
  )
}

export default index
