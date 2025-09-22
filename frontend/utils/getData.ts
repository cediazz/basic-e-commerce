'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getData(url: string) {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_HOST}${url}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                cache: 'no-store'
            }
        )
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