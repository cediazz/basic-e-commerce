import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
   
    const token = request.cookies.get('accessToken')?.value
    const userId = request.cookies.get('user_id')?.value
    
    // Rutas que requieren autenticación
    const protectedRoutes = ['/products', '/home', '/dashboard']
    
    if (protectedRoutes.includes(request.nextUrl.pathname) && (!token || !userId)) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/products', '/home', '/dashboard']
}