"use client";

import { useState } from "react";

export default function Home() {
  const [collegeId, setCollegeId] = useState<string>("");
  const [reviewType, setReviewType] = useState<string>("Academics");
  const [reviews, setReviews] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchReviews = async (nextPage: number) => {
    setLoading(true);
    setError("");

    try {
      const url = `https://www.careers360.com/colleges/reviews?page=${nextPage}&college_id=${collegeId}`;
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, reviewType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch reviews");
      }

      if (data.content) {
        setReviews((prev) => [...prev, ...data.content]);
      } else {
        setError("No reviews found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviews([]);
    setPage(1);
    fetchReviews(1);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Reviews Scraper</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 flex-col">
            <input
              type="text"
              value={collegeId}
              onChange={(e) => setCollegeId(e.target.value)}
              placeholder="Enter College ID"
              className="flex-1 p-2 border rounded bg-black text-white"
              required
            />
            <select
              value={reviewType}
              onChange={(e) => setReviewType(e.target.value)}
              className="p-2 border rounded bg-black text-white"
            >
              <option value="Academics">Academics</option>
              <option value="College Infrastructure">
                College Infrastructure
              </option>
              <option value="Placements">Placements</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Get Reviews
            </button>
          </div>
        </form>

        {loading && <div className="mt-4 text-gray-600">Loading...</div>}

        {reviews.length > 0 && (
          <div className="mt-6 p-4 rounded">
            <h2 className="font-semibold">Scraped Reviews:</h2>
            <ul className="mt-2">
              {reviews.map((content, index) => (
                <li
                  key={index}
                  className="mt-1 p-2 rounded bg-blue-400 text-black"
                >
                  {content}
                </li>
              ))}
            </ul>
            {!error ? (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Load More
              </button>
            ) : null}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-500 rounded">{error}</div>
        )}
      </div>
    </main>
  );
}
