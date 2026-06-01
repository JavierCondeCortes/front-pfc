import { NextResponse } from 'next/server';

const SUPPORTED_LANGS = ['en', 'es', 'fr', 'it', 'jp'];

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const segments = pathname.split('/').filter(Boolean);
    const currentLang = segments[0];
    const lang = SUPPORTED_LANGS.includes(currentLang) ? currentLang : 'en';

    if (!currentLang) {
        return NextResponse.redirect(new URL(`/${lang}/home`, request.url));
    }

    if (!SUPPORTED_LANGS.includes(currentLang)) {
        const url = request.nextUrl.clone();
        url.pathname = `/${lang}/${segments.slice(1).join('/') || 'home'}`;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};
