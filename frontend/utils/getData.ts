import { cookies } from 'next/headers'

export async function getData(url:string){
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value
        let res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_HOST}${url}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        )
        if (res.status === 401)
            return 401
        return res.json()

}