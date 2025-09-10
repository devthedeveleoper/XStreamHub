"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import API from '@/lib/api';
import VideoCard from '@/components/VideoCard';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';

const SubscriptionsPage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push('/login');
            return;
        }

        if (isAuthenticated) {
            const fetchFeed = async () => {
                try {
                    setLoading(true);
                    const response = await API.get('/videos/subscriptions');
                    setVideos(response.data);
                } catch (error) {
                    console.error("Failed to fetch subscription feed:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchFeed();
        }
    }, [status, isAuthenticated, router]);

    if (status === "loading") {
        return <div className="text-center p-10">Loading...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div className="text-center p-10">
                <h2 className="text-2xl font-bold mb-4">Content from your subscriptions</h2>
                <p className="text-gray-600">
                    <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link> to see updates from your favorite channels.
                </p>
            </div>
        );
    }
    
    return (
        <main className="container mx-auto px-6 py-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Subscriptions Feed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 8 }).map((_, index) => <VideoCardSkeleton key={index} />)
                ) : (
                    videos.length > 0 ? (
                        videos.map(video => <VideoCard key={video._id} video={video} />)
                    ) : (
                        <p className="col-span-full text-center text-gray-600">No new videos from your subscriptions.</p>
                    )
                )}
            </div>
        </main>
    );
};

export default SubscriptionsPage;