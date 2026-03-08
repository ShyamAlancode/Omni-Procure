import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Custom simple cookie check set during signIn
    const hasAuth = request.cookies.has('omniprocure_auth');

    // Also tolerate standard Amplify/Cognito cookies if adapter runs
    const hasCognitoCookie = Array.from(request.cookies.getAll()).some(
        cookie => cookie.name.includes('CognitoIdentityServiceProvider')
    );

    const isAuthenticated = hasAuth || hasCognitoCookie;

    // 1. Protect Dashboard: Redirect to login if NOT authenticated
    if (pathname.startsWith('/dashboard')) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/auth/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 2. Protect Auth Routes: Redirect to dashboard if ALREADY authenticated
    if (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')) {
        if (isAuthenticated) {
            const dashboardUrl = new URL('/dashboard', request.url);
            return NextResponse.redirect(dashboardUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
