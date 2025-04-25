import type { NextApiRequest, NextApiResponse } from "next";
import { createProxyMiddleware } from "http-proxy-middleware";

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

const proxy = createProxyMiddleware({
  target: "https://hianimez.to",
  changeOrigin: true,
  pathRewrite: { "^/api/proxy": "" },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  return new Promise((resolve, reject) => {
    proxy(req, res, (err) => {
      if (err) {
        console.error("Proxy error:", err);
        res.status(500).json({ error: "Proxy failed" });
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
