export const config = {
  matcher: '/(.*)',
};

export default function middleware(req: Request) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    const validUser = process.env.PORTAL_USERNAME || 'admin';
    const validPassword = process.env.PORTAL_PASSWORD || 'securecompany123';

    if (user === validUser && pwd === validPassword) {
      // Return undefined to let the request proceed to the static CDN or Serverless Function
      return;
    }
  }

  // Not authenticated, trigger the browser's Basic Auth prompt
  return new Response('Authentication Required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Agentic Outreach Portal Secure Access"'
    }
  });
}
