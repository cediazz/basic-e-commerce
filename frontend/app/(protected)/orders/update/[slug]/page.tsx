import { getData } from "@/utils/getData"
import { redirect } from 'next/navigation'
import { OrderUpdateForm } from "@/components/Orders/updateOrder"

export default async function OrdersUpdatePage({
  params,
}: {
  params: Promise<{ slug: string }>
}){

    const { slug } = await params
    const paymentMethods = await getData("/orders/payment_methods")
    const orderData = await getData(`/orders/${slug}`)
    if (paymentMethods === 401 || orderData === 401 ){
        redirect('/login')
    }
        
    else return(
        <OrderUpdateForm paymentMethods={paymentMethods} order={orderData} />
    )
}