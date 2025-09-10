"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import API from '@/lib/api';
import VideoCard from '@/components/VideoCard';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';

const SearchResults = () => {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setResults([]);
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            try {
                setLoading(true);
                const response = await API.get(`/videos/search`, { params: { q: query } });
                setResults(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <main className="container mx-auto px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Search Results for: <span className="text-blue-600">"{query}"</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 8 }).map((_, index) => (
                        <VideoCardSkeleton key={index} />
                    ))
                ) : (
                    results.length > 0 ? (
                        results.map(video => (
                            <VideoCard key={video._id} video={video} />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-600">No videos found.</p>
                    )
                )}
            </div>
        </main>
    );
};

export default SearchResults;