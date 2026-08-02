import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register']

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId } = await auth()
  const pathname = request.nextUrl.pathname

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  if (!userId && !isPublic) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect_url', request.url)
    return NextResponse.redirect(loginUrl)
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}