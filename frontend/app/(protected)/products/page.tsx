import Products from "@/components/Products/listProducts"
import { getData } from "@/utils/getData"
import { redirect } from 'next/navigation'

export default async function ProductPage(){
    
    const data = await getData("/products/?offset=0&limit=20")
    console.log(data)
    if (data === 401){
        redirect('/login')
    }
        
    else return(
        <Products data={data} />
    )
}