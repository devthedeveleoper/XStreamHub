"use client";

import React, { useEffect } from "react";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "@/lib/fetcher";
import SuggestedVideoCard from "@/components/SuggestedVideoCard";
import { useInView } from "react-intersection-observer";

const VideoRecommendations = ({ videoId, isAuthenticated }) => {
  const { ref, inView } = useInView({ threshold: 0.5 });

  const endpoint = isAuthenticated ? "/videos/recommendations" : "/videos/suggestions";

  const getKey = (pageIndex, previousPageData) => {
    // reached the end
    if (previousPageData && previousPageData.videos && previousPageData.videos.length === 0) return null;
    if (previousPageData && !previousPageData.videos && previousPageData.length === 0) return null;

    // add the cursor to the API endpoint
    return `${endpoint}?page=${pageIndex + 1}&limit=10&exclude=${videoId}`;
  };

  const { data, error, isLoading, isValidating, size, setSize } = useSWRInfinite(
    getKey,
    fetcher
  );

  const videos = data 
    ? data.flatMap(page => page.videos || page)
    : [];

  const isEmpty = data?.[0]?.length === 0 || data?.[0]?.videos?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.videos?.length < 10) || (data && data[data.length - 1]?.length < 10);
  
  useEffect(() => {
    if (inView && !isReachingEnd && !isValidating) {
      setSize(size + 1);
    }
  }, [inView, isReachingEnd, isValidating, setSize, size]);

  if (error) {
    return <div className="text-red-500">Failed to load recommendations.</div>;
  }

  return (
    <div className="sticky top-24">
      <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6">
        {isAuthenticated ? "Recommended For You" : "Up Next"}
      </h3>
      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
        {videos.map((sidebarVideo) => (
          <SuggestedVideoCard key={sidebarVideo._id} video={sidebarVideo} />
        ))}
        
        {(isLoading || isValidating) && (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex space-x-3 animate-pulse">
              <div className="flex-shrink-0 w-40 h-24 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-2/3"></div>
              </div>
            </div>
          ))
        )}

        <div ref={ref} className="h-10">
          {!isReachingEnd && !isLoading && !isValidating && (
             <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mt-4">
               Loading more...
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoRecommendations;
