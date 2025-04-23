// pages/api/search.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { hianime } from "@/lib/aniwatch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { q, page } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Missing search query" });
  }

  // Convert page from query to a number, defaulting to 1
  const pageNum = page ? Number(page) : 1;

  try {
    // Call the aniwatch search function on the server
    const result = await hianime.search(q, pageNum);
    // Send the search results back to the client
    res.status(200).json(result);
  } catch (error) {
    console.error("Search error on API:", error);
    res.status(500).json({ error: "Search failed" });
  }
}
