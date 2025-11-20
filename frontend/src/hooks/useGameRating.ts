import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

const ratingCache = new Map<string, { rating: number; reviewCount: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useGameRating(gameId: string | undefined) {
  const [rating, setRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!gameId) {
      setRating(null);
      setReviewCount(0);
      return;
    }

    // Check cache first
    const cached = ratingCache.get(gameId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setRating(cached.rating);
      setReviewCount(cached.reviewCount);
      return;
    }

    // Fetch from API
    const fetchRating = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/reviews/stats?gameId=${gameId}`);
        if (response.ok) {
          const data = await response.json();
          const stats = data?.data;
          const avgRating = stats?.averageRating || 0;
          const count = stats?.approved || 0;

          setRating(avgRating > 0 ? avgRating : null);
          setReviewCount(count);

          // Cache the result
          ratingCache.set(gameId, {
            rating: avgRating > 0 ? avgRating : 0,
            reviewCount: count,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        // Silent fail - use default rating
        console.error('Failed to fetch rating:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [gameId]);

  return { rating, reviewCount, loading };
}

// Hook for multiple games
export function useGameRatings(gameIds: string[]) {
  const [ratings, setRatings] = useState<Map<string, { rating: number; reviewCount: number }>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (gameIds.length === 0) return;

    const fetchRatings = async () => {
      setLoading(true);
      try {
        // Fetch ratings for all games
        const promises = gameIds.map(async (gameId) => {
          // Check cache first
          const cached = ratingCache.get(gameId);
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return { gameId, ...cached };
          }

          // Fetch from API
          try {
            const response = await fetch(`${API_BASE_URL}/api/reviews/stats?gameId=${gameId}`);
            if (response.ok) {
              const data = await response.json();
              const stats = data?.data;
              const avgRating = stats?.averageRating || 0;
              const count = stats?.approved || 0;

              const result = {
                gameId,
                rating: avgRating > 0 ? avgRating : 0,
                reviewCount: count,
                timestamp: Date.now()
              };

              // Cache the result
              ratingCache.set(gameId, result);
              return result;
            }
          } catch (error) {
            console.error(`Failed to fetch rating for ${gameId}:`, error);
          }

          return { gameId, rating: 0, reviewCount: 0, timestamp: Date.now() };
        });

        const results = await Promise.all(promises);
        const ratingsMap = new Map<string, { rating: number; reviewCount: number }>();
        
        results.forEach((result) => {
          ratingsMap.set(result.gameId, {
            rating: result.rating,
            reviewCount: result.reviewCount
          });
        });

        setRatings(ratingsMap);
      } catch (error) {
        console.error('Failed to fetch ratings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [gameIds.join(',')]); // Re-fetch when gameIds change

  return { ratings, loading };
}

// Function to invalidate cache for a specific game
export function invalidateRatingCache(gameId: string) {
  ratingCache.delete(gameId);
}

