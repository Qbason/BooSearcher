// export { auth as middleware } from '@lib/auth';
import { NextResponse } from 'next/server';

import { auth } from '@lib/auth';

export const middleware = auth((req) => {
  const url = new URL(req.url);

  if (!req.auth && url.pathname !== '/auth/login') {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
