import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/explore',
  '/features',
  '/for-advisors',
  '/for-critics',
  '/pricing',
  '/faq',
  '/university-guides',
  '/user-guide',
  '/atr-style-guide',
]

const isPublicPath = (pathname: string): boolean => {
  return publicPaths.some(p => pathname === p || (p !== '/' && pathname.startsWith(p))) || pathname.startsWith('/share/')
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  if (pathname.startsWith('/_next') || pathname.startsWith('/api/') || pathname.includes('.')) {
    return res
  }

  const isPublic = isPublicPath(pathname)

  if (!isPublic) {
    const cookieHeader = req.headers.get('cookie')
    const hasAuthCookie = cookieHeader?.includes('sb-') || cookieHeader?.includes('supabase')
    
    if (!hasAuthCookie) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
