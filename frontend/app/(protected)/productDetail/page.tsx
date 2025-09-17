import Products from "@/components/Products/listProducts"
import { getData } from "@/utils/getData"
import { redirect } from 'next/navigation'

interface Product{
    id: number,
    name: string,
    description: string,
    price: string,
    is_active: boolean,
    category: string,
    image_url: string,
    created_at: string
}

interface ProductDetail{
    product: Product
}

export default async function ProductDetail({product}:ProductDetail){

     return(
        <h1>Product detail</h1>
    )
}