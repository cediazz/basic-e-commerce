import { getData } from "@/utils/getData"
import { redirect } from 'next/navigation'
import ProductDetail from "@/components/Products/productDetail"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getData(`/products/${slug}`)
      if (data === 401){
          redirect('/login')
      }
          
      else return(
          <ProductDetail product={data}/>
      )
}