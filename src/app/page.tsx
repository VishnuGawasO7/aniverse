"use client";

import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <main className="min-h-screen bg-black-50 flex flex-col justify-center items-center p-4 sm:p-20">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-100">
          Welcome to AniVerse VishnuGawas07
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Find what you’re looking for quickly and easily.
        </p>
      </header>
      <section className="w-full max-w-xl">
        <SearchBar />
      </section>
      <footer className="mt-12">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} • All rights reserved.
        </p>
      </footer>
    </main>
  );
}
