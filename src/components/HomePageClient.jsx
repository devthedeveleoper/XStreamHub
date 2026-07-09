"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { fetcher } from '@/lib/fetcher';
import API from '@/lib/api';
import { motion } from 'framer-motion';
import VideoCard from '@/components/VideoCard';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';
import CATEGORIES from '@/constants/categories';
import { useSession } from "next-auth/react";
import { toast } from 'react-toastify';

const HomePageClient = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";

    const [sortBy, setSortBy] = useState('date_desc');
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || "All");
    const { ref, inView } = useInView({ threshold: 0.5 });

    const { data: watchLaterData, mutate: mutateWatchLater } = useSWR(
        isAuthenticated ? "/user/watch-later" : null,
        fetcher
    );

    const watchLaterIds = React.useMemo(() => {
        if (!watchLaterData) return new Set();
        return new Set(watchLaterData.map(item => item.videoId._id));
    }, [watchLaterData]);

    const getKey = (pageIndex, previousPageData) => {
        if (previousPageData && !previousPageData.videos?.length) return null;
        let url = `/videos?sort=${sortBy}&page=${pageIndex + 1}&limit=12`;
        if (activeCategory !== "All") url += `&category=${activeCategory}`;
        return url;
    };

    const { data, error, isLoading, isValidating, size, setSize } = useSWRInfinite(
        getKey,
        fetcher,
        {
          revalidateFirstPage: false
        }
    );

    const videos = data ? data.flatMap(page => page.videos) : [];
    const isEmpty = data?.[0]?.videos?.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.videos?.length < 12);

    useEffect(() => {
        if (inView && !isReachingEnd && !isValidating) {
            setSize(size + 1);
        }
    }, [inView, isReachingEnd, isValidating, setSize, size]);

    const handleCategoryClick = (category) => {
        const newCategory = activeCategory === category ? "All" : category;
        setActiveCategory(newCategory);

        const params = new URLSearchParams(window.location.search);
        if (newCategory !== "All") {
            params.set('category', newCategory);
        } else {
            params.delete('category');
        }
        router.push(`/?${params.toString()}`);
    };

    const handleToggleWatchLater = async (videoId) => {
      if (!isAuthenticated) {
        toast.warn("Please log in to save videos.");
        return;
      }
      const isSaved = watchLaterIds.has(videoId);
      const newWatchLaterIds = new Set(watchLaterIds);

      try {
        if (isSaved) {
          await API.delete(`/user/watch-later?videoId=${videoId}`);
          mutateWatchLater(watchLaterData.filter(item => item.videoId._id !== videoId), false);
          toast.success("Removed from Watch Later");
        } else {
          await API.post("/user/watch-later", { videoId });
          // Optimistically updating this is tricky since we need the full video object in watchLaterData,
          // so we just trigger a revalidation
          mutateWatchLater();
          toast.success("Added to Watch Later");
        }
      } catch (error) {
        toast.error("An error occurred.");
      }
    };

    return (
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="container mx-auto px-4 sm:px-6 py-6 sm:py-8"
      >
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-5 py-2 rounded-full font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 transform active:scale-95 shadow-sm ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:-translate-y-0.5"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 hover:-translate-y-0.5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight self-start sm:self-center">
            Trending Videos
          </h2>
          <div className="flex items-center space-x-3 self-end sm:self-center">
            <label htmlFor="sort" className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 rounded-xl shadow-sm pl-4 pr-8 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer"
            >
              <option value="date_desc">Newest</option>
              <option value="views_desc">Most Views</option>
              <option value="likes_desc">Most Likes</option>
              <option value="comments_desc">Most Comments</option>
            </select>
          </div>
        </div>

        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading ? (
            Array.from({ length: 12 }).map((_, index) => (
              <VideoCardSkeleton key={index} />
            ))
          ) : videos.length > 0 ? (
            videos.map((video, index) => (
              <motion.div
                key={video._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <VideoCard
                  video={video}
                  isSaved={watchLaterIds.has(video._id)}
                  onToggleWatchLater={() => handleToggleWatchLater(video._id)}
                />
              </motion.div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-600 dark:text-gray-400 font-medium">
              No videos found in this category.
            </p>
          )}
        </div>

        <div ref={ref} className="h-10 mt-8 flex justify-center">
          {isValidating && !isLoading && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 font-medium">Loading more videos...</p>
          )}
        </div>
      </motion.main>
    );
};

export default HomePageClient;