"use client"
import { ProductCard } from "./productCard"
import { Product } from "./productCard"

interface ProductsProps {
  data: any
}

export default function Products({ data }: ProductsProps) {

  const handleAddToCart = (product: Product) => {
    console.log('Agregar al carrito:', product)
    // Aquí iría la lógica para agregar al carrito
  }

  const handleQuickView = (product: Product) => {
    console.log('Vista rápida:', product)
    // Aquí iría la lógica para mostrar vista rápida
  }

  return (
    <div className="grid grid-cols-1  lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.results.map((product:any) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          onQuickView={handleQuickView}
        />
      ))}
    </div>
  )
}