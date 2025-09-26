import { getData } from "@/utils/getData"
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import OrdersList from '@/components/Orders/orderList'

export default async function OrderListPage() {
  
  const cookieStore = await cookies()
  const user_id = cookieStore.get('user_id')?.value
  const data = await getData(`/orders/?user_id=${user_id}&offset=0&limit=20`)
  if (data === 401){
    redirect('/login')
  }
  
  else return(
          <OrdersList data={data} />
      )
}