"use client"
import { ProductCard } from "./productCard"
import { Product } from "./productCard"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import Categorys from "./Categorys"
import LoadingProducts from "@/app/(protected)/products/loading"

interface ProductsProps {
  data: any
}

export default function Products({ data }: ProductsProps) {

  const [products, setProducts] = useState(data.results)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAddToCart = (product: Product) => {
    console.log('Agregar al carrito:', product)
    // Aquí iría la lógica para agregar al carrito
  }

  return (
    <div>
     <Categorys setProducts={setProducts} setLoading={setIsLoading}/>
    { isLoading ? <LoadingProducts /> :
    <div className="grid grid-cols-1  lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {products && products.map((product:any) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>}
    </div>
  )
}