import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // This is a simplified middleware that doesn't actually check authentication
  // In a real app, you would verify a session token or similar

  // For now, we'll just let all requests through
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip public files and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
