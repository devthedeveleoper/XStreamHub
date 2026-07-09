"use client";

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { motion } from 'framer-motion';
import VideoCard from '@/components/VideoCard';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';

const SearchResults = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const { data: results, error, isLoading } = useSWR(
        query ? `/videos/search?q=${encodeURIComponent(query)}` : null,
        fetcher
    );

    return (
        <motion.main 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="container mx-auto px-6 py-8"
        >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Search Results for: <span className="text-indigo-600 dark:text-indigo-400">"{query}"</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, index) => (
                        <VideoCardSkeleton key={index} />
                    ))
                ) : (
                    results && results.length > 0 ? (
                        results.map((video, index) => (
                            <motion.div
                                key={video._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <VideoCard video={video} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center p-12 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No videos found matching your search.</p>
                        </div>
                    )
                )}
            </div>
        </motion.main>
    );
};

export default SearchResults;