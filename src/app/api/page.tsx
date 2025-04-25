import type { NextApiRequest, NextApiResponse } from 'next';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Create and configure the proxy middleware
const proxy = createProxyMiddleware({
  target: 'https://hianimez.to', // Target site
  changeOrigin: true,           // Modifies the origin header
  pathRewrite: {
    '^/api/proxy': '',          // Remove '/api/proxy' from the request URL before forwarding
  },
});

// The default handler for the API route
export default function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  return new Promise((resolve, reject) => {
    proxy(req, res, (result: unknown) => {
      if (result instanceof Error) {
        console.error('Proxy error:', result);
        res.status(500).json({ error: 'Proxy failed' });
        return reject(result);
      }
      resolve();
    });
  });
}
