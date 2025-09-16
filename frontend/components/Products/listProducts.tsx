"use client"
import { ProductCard } from "./productCard"
import { Product } from "./productCard"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import Categorys from "./Categorys"
import LoadingProducts from "@/app/(protected)/products/loading"
import { MyPagination } from "../Pagination/Pagination"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { number } from "zod"

interface ProductsProps {
  data: any
}

export default function Products({ data }: ProductsProps) {

  const [productsData, setProductsData] = useState(data)
  const [isLoading, setIsLoading] = useState(false)
  const [offset, setOffset] = useState<string>('0')
  const [limit, setLimit] = useState<string>('20')
  const router = useRouter()

  const handleAddToCart = (product: Product) => {
    console.log('Agregar al carrito:', product)
    // Aquí iría la lógica para agregar al carrito
  }

  return (
    <div>
      <Categorys
        setProductsData={setProductsData}
        setLoading={setIsLoading}
        offset={offset}
        limit={limit}
      />
      {isLoading ? <LoadingProducts /> :
        <>
          <div className="grid grid-cols-1  lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            <div>
              <h2 className="scroll-m-20 border-b pb-2 font-semibold tracking-tight first:mt-0">
                Cantidad de productos: {productsData.count}
              </h2>
            </div>

          </div>
          <div className="grid grid-cols-1  lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-3">
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="cantPerPage">Límite de productos por página</Label>
              <Input id="cantPerPage" defaultValue={limit} type="number" onChange={e => setLimit(e.target.value)} />
            </div>
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="start">Producto inicial</Label>
              <Input id="start" defaultValue={offset} type="number" onChange={e => setOffset(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1  lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {productsData && productsData.results.length > 0  ? productsData.results.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            )):
              <h1 className="font-semibold text-muted-foreground">
                No se encontraron productos
              </h1>
            }
          </div>
          <div className="grid grid-cols-1  lg:grid-cols-2 xl:grid-cols-1 gap-6 mt-8">
             {productsData && productsData.results.length > 0 && <MyPagination />}
          </div>
          
        </>
      }
    </div>
  )
}