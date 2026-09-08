import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const allCookies = request.cookies.getAll()
  const hasSession = allCookies.some(cookie => cookie.name.includes('auth-token') || cookie.name.includes('sb-'))

  const isLoginRoute = request.nextUrl.pathname.startsWith('/login')

  if (!hasSession && !isLoginRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasSession && isLoginRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}