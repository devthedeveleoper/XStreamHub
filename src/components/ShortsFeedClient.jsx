"use client";

import React, { useEffect, useRef, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import { fetcher } from '@/lib/fetcher';
import ShortPlayer from '@/components/ShortPlayer';

const ShortsFeedClient = () => {
    const getKey = (pageIndex, previousPageData) => {
        if (previousPageData && !previousPageData.videos?.length) return null;
        return `/videos?sort=trending&type=short&page=${pageIndex + 1}&limit=5`;
    };

    const { data, error, isLoading, isValidating, size, setSize } = useSWRInfinite(
        getKey,
        fetcher,
        { revalidateFirstPage: false }
    );

    const videos = data ? data.flatMap(page => page.videos) : [];
    const isEmpty = data?.[0]?.videos?.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.videos?.length < 5);

    const containerRef = useRef(null);

    // Basic intersection observer for infinite scroll
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 200) {
                if (!isReachingEnd && !isValidating) {
                    setSize(size + 1);
                }
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [isReachingEnd, isValidating, setSize, size]);

    return (
        <div 
            ref={containerRef}
            className="h-[calc(100vh-80px)] w-full bg-black overflow-y-scroll snap-y snap-mandatory scroll-smooth scrollbar-hide"
        >
            {videos.map((video, index) => (
                <div key={video._id} className="h-full w-full snap-start flex justify-center items-center">
                    <ShortPlayer video={video} isActive={false} />
                </div>
            ))}
            
            {isLoading && (
                <div className="h-full w-full snap-start flex justify-center items-center text-white">
                    <div className="animate-pulse">Loading more shorts...</div>
                </div>
            )}
            
            {isEmpty && !isLoading && (
                <div className="h-full w-full snap-start flex justify-center items-center text-white">
                    <p>No shorts available yet.</p>
                </div>
            )}
        </div>
    );
};

export default ShortsFeedClient;
