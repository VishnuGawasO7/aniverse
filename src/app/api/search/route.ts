// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { hianime } from '@/lib/aniwatch';

export async function GET(request: Request) {
  // Parse the URL to get search parameters
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const page = searchParams.get('page') || "1";

  if (!q) {
    return NextResponse.json({ error: "Missing search query" }, { status: 400 });
  }

  const pageNum = Number(page);

  try {
    // Call the scraper function from the aniwatch library
    const result = await hianime.search(q, pageNum);
    // Return the results as JSON
    return NextResponse.json(result);
  } catch (error) {
    console.error("Search error on API:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
