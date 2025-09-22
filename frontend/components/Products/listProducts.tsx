"use client"
import { ProductCard } from "./productCard"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import FiltersForm from "./filtersForm"
import LoadingProducts from "@/app/(protected)/products/loading"
import { MyPagination } from "../Pagination/Pagination"
import { getData } from "@/utils/getData"

interface ProductsProps {
  data: any
}

export default function Products({ data }: ProductsProps) {

  const [productsData, setProductsData] = useState<any>(data)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const getProductsByCategory = async (category: string,limit:string,offset:string) => {
         setIsLoading(true)
          let url: string | null = null
          if (category === "all")
              url = `/products/?offset=${offset}&limit=${limit}`
          else url = `/products/?category=${category}&offset=${offset}&limit=${limit}`
          const data = await getData(url)
          console.log(data)
          if (data === 401 || data === undefined) {
            router.push('/login')
          }
          else setProductsData(data)
          setIsLoading(false)
        }

  return (
    <div>
      <FiltersForm
        getProductsByCategory={getProductsByCategory}
      />
      {isLoading ? <LoadingProducts /> :
        <>
          <div className="grid grid-cols-1  lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            <div>
              <h2 className="scroll-m-20 border-b pb-2 font-semibold tracking-tight first:mt-0">
                Cantidad de productos: {productsData && productsData.count}
              </h2>
            </div>

          </div>
          <div className="grid grid-cols-1  lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {productsData && productsData.results.length > 0  ? productsData.results.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )):
              <h1 className="font-semibold text-muted-foreground">
                No se encontraron productos
              </h1>
            }
          </div>
          <div className="grid grid-cols-1  lg:grid-cols-2 xl:grid-cols-1 gap-6 mt-8">
             {productsData && productsData.results.length > 0 && 
             <MyPagination
             data={productsData} 
             setData={setProductsData}
             setLoading={setIsLoading}
             />}
          </div>
          
        </>
      }
    </div>
  )
}