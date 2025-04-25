// File: src/pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createProxyMiddleware } from "http-proxy-middleware";

export const config = {
  api: {
    externalResolver: true,  // disables “unresolved handler” warnings :contentReference[oaicite:1]{index=1}
    bodyParser: false,       // allow raw request stream for proxy middleware :contentReference[oaicite:2]{index=2}
  },
};

const proxy = createProxyMiddleware({
  target: "https://hianimez.to",
  changeOrigin: true,
  pathRewrite: { "^/api/proxy": "" },
});

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  return proxy(req, res, (err) => {
    if (err) {
      console.error("Proxy error:", err);
      res.status(500).json({ error: "Proxy failed" });
    }
  });
}
