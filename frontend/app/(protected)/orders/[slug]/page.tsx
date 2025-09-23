import { getData } from "@/utils/getData"
import { redirect } from 'next/navigation'

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
          <h1>OrderDetail</h1>
      )
}