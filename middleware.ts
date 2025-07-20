import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_ROUTES = ['/login', '/signup'];
const PRIVATE_ROUTES = ['/', '/chat', '/videoEditor'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'secret'));

      // Đã login mà truy cập trang công khai → redirect về /
      if (PUBLIC_ROUTES.includes(pathname)) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return NextResponse.next();
    } catch (err) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('token', '', { maxAge: 0 });
      return response;
    }
  } else {
    // Nếu chưa đăng nhập mà truy cập trang riêng → redirect về login
    const isPrivate = PRIVATE_ROUTES.some((route) => {
      if (route === '/') return pathname === '/';
      return pathname.startsWith(route);
    });

    if (isPrivate) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Trang công khai → cho qua
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/', '/chat/:path*', '/login', '/signup'],
};
