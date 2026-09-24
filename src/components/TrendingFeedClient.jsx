"use client";

import React, { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import API from '@/lib/api';
import { motion } from 'framer-motion';
import VideoCard from '@/components/VideoCard';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';
import { useSession } from "next-auth/react";
import { toast } from 'react-toastify';

const TrendingFeedClient = () => {
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";
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
        return `/videos?sort=trending&page=${pageIndex + 1}&limit=12`;
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

    const handleToggleWatchLater = async (videoId) => {
      if (!isAuthenticated) {
        toast.warn("Please log in to save videos.");
        return;
      }
      const isSaved = watchLaterIds.has(videoId);

      try {
        if (isSaved) {
          await API.delete(`/user/watch-later?videoId=${videoId}`);
          mutateWatchLater(watchLaterData.filter(item => item.videoId._id !== videoId), false);
          toast.success("Removed from Watch Later");
        } else {
          await API.post("/user/watch-later", { videoId });
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
        className="container mx-auto px-4 sm:px-6 py-8"
      >
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight">
            Trending Now
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">The most engaging videos right now, constantly updated.</p>
        </div>

        {error && <p className="text-center text-red-500">{error?.message || "Failed to load videos"}</p>}

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
            <p className="col-span-full text-center text-gray-600 dark:text-gray-400 font-medium py-10">
              No trending videos found.
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

export default TrendingFeedClient;
