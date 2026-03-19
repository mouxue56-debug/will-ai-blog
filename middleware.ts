import createMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /monitoring (OpenTelemetry)
    // - all files in /public (e.g. /favicon.ico)
    '/((?!api|_next|_vercel|monitoring|.*\\..*).*)',
  ],
};
