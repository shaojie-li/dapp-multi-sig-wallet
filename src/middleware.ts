import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 import loggerFN from 'pino'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const logger = loggerFN();
  logger.info(request.url);
  const child = logger.child({ a: 'property' });
  child.info(request.cookies.get("_ga"))
  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/api/posts', "/user", "/api/get-user"],
}
