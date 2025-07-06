export default async (request, context) => {
  const response = await context.next();
  
  // Add aggressive caching headers
  const url = new URL(request.url);
  
  if (url.pathname.includes('/_astro/') || url.pathname.includes('.woff2') || url.pathname.includes('.css') || url.pathname.includes('.js')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (url.pathname.endsWith('.html') || url.pathname === '/') {
    response.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
  }
  
  return response;
};

export const config = {
  path: "/*",
};