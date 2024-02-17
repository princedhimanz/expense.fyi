import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
// export async function middleware(req: NextRequest) {
// 	const res = NextResponse.next();
// 	const hostname = req.headers.get('host');
// 	const url = req.nextUrl;
// 	const currentHost = hostname?.replace(`.${urls.homeWithoutApp}`, '');
// 	const supabase = createMiddlewareClient({ req, res });
// 	const { data } = await supabase.auth.getSession();
// 	const { session } = data;
// 	if (currentHost === 'app') {
// 		if (url.pathname === '/signin' || url.pathname === '/signup') {
// 			if (session) {
// 				url.pathname = '/';
// 				return NextResponse.redirect(url);
// 			}
// 			return res;
// 		}
// 		url.pathname = `/dashboard${url.pathname}`;
// 		return NextResponse.rewrite(url);
// 	}
// 	return res;
// }
// export const config = {
// 	matcher: [
// 		/*
// 		 * Match all paths except for:
// 		 * 1. /api/ routes
// 		 * 2. /_next/ (Next.js internals)
// 		 * 3. /_proxy/ (special page for OG tags proxying)
// 		 * 4. /_static (inside /public)
// 		 * 5. /_vercel (Vercel internals)
// 		 * 6. /favicon.ico, /sitemap.xml (static files)
// 		 */
// 		'/((?!api/|_next/|_proxy/|_static|_vercel|favicon.ico|sitemap.xml).*)',
// 	],
// };
import { authMiddleware, redirectToSignIn } from '@clerk/nextjs';

import urls from 'constants/url';

export default authMiddleware({
	publicRoutes: ['/', '/signin', '/signup', '/api/webhooks'],
	afterAuth(auth, req, evt) {
		// Handle users who aren't authenticated
		if (!auth.userId && !auth.isPublicRoute) {
			return redirectToSignIn({ returnBackUrl: req.url });
		}

		const res = NextResponse.next();
		const hostname = req.headers.get('host');
		const url = req.nextUrl;

		if(auth.userId && !url.pathname.startsWith('/api')){
			url.pathname = `/dashboard${url.pathname}`;
			return NextResponse.rewrite(url);
		}
		// if (url.pathname.startsWith('/signin') || url.pathname.startsWith('/signup')) {
		// 	if (auth.userId) {
		// 		url.pathname = '/';
		// 		return NextResponse.redirect(url);
		// 	}
		// 	return res;
		// }

		// console.log("app")
		// url.pathname = `/dashboard${url.pathname}`;
		// return NextResponse.rewrite(url);
		// }

		// If the user is logged in and trying to access a protected route, allow them to access route
		if (auth.userId && !auth.isPublicRoute) {
			return NextResponse.next();
		}

		// Allow users visiting public routes to access them
		return NextResponse.next();
	},
});
// export const config = {
// 	matcher: [
// 		/*
// 		 * Match all paths except for:
// 		 * 1. /api/ routes
// 		 * 2. /_next/ (Next.js internals)
// 		 * 3. /_proxy/ (special page for OG tags proxying)
// 		 * 4. /_static (inside /public)
// 		 * 5. /_vercel (Vercel internals)
// 		 * 6. /favicon.ico, /sitemap.xml (static files)
// 		 */
// 		'/((?!api/|_next/|_proxy/|_static|_vercel|favicon.ico|sitemap.xml).*)',
// 	],
// };
export const config = {
	matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
