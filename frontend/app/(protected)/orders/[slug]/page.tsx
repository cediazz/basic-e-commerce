import { getData } from "@/utils/getData"
import { redirect } from 'next/navigation'
import { OrderDetails } from "@/components/Orders/orderDetail"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getData(`/orders/${slug}`)
  console.log(data)
      if (data === 401){
          redirect('/login')
      }
          
      else return(
          <OrderDetails order={data}/>
      )
}