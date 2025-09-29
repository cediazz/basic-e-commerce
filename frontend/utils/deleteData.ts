'use server'

import { cookies } from 'next/headers'

export async function deleteData(url: string) {
    //await new Promise(resolve => setTimeout(resolve,5000))
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    let config = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
    
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}${url}`,config)
        if (res.status === 401) {
            return 401
        }

        if (res.status === 204) {
            return 204
        }
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }
        
    } catch (error) {
        console.error('Fetch error:', error)
        return
    }
}