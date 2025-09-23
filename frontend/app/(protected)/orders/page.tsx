import { getData } from "@/utils/getData"
import { redirect } from 'next/navigation'
import { OrderCreateForm } from "@/components/Orders/createOrder"

export default async function OrdersPage(){

    const data = await getData("/orders/payment_methods")
    if (data === 401){
        redirect('/login')
    }
        
    else return(
        <OrderCreateForm paymentMethods={data} />
    )
}