'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getData(url: string) {
    console.log("entrada a la funcion")
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
    console.log("despues de token")
    if (!accessToken) {
        console.log("redirigir")
        redirect('/login')
    }

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_HOST}${url}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                cache: 'no-store' // Para evitar caché
            }
        )
        console.log(res)
        if (res.status === 401) {
            redirect('/login') // ← Redirige si el token es inválido
        }
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
        }
        
        return await res.json()
    } catch (error) {
        console.error('Fetch error:', error)
        redirect('/login') // ← Redirige en caso de error
    }
}