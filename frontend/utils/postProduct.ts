'use server'
import { cookies } from 'next/headers'

export async function postProduct(url: string, data:any) {
    //await new Promise(resolve => setTimeout(resolve,5000))
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    let config = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body:data
        }
    
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}${url}`,config)
        if (res.status === 401) {
            return 401
        }
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        return await res.json()
    } catch (error) {
        console.error('Fetch error:', error)
        return
    }
}