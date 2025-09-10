"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import API from '@/lib/api';
import { toast } from 'react-toastify';
import VideoCard from '@/components/VideoCard';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';

const ProfilePage = () => {
    const params = useParams();
    const username = params.username;
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";
    const currentUser = session?.user;
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) return;
            try {
                setLoading(true);
                const response = await API.get(`/users/${username}`);
                setProfile(response.data);
            } catch (err) {
                setError('Could not load user profile.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchProfile();
    }, [username]);

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            toast.warn("Please log in to subscribe.");
            return;
        }

        const originalProfile = profile;
        const newIsSubscribed = !profile.user.isSubscribed;
        const newSubscriberCount = newIsSubscribed
            ? profile.user.subscriberCount + 1
            : profile.user.subscriberCount - 1;

        setProfile(prev => ({
            ...prev,
            user: { ...prev.user, isSubscribed: newIsSubscribed, subscriberCount: newSubscriberCount }
        }));

        try {
            await API.post(`/users/${profile.user.id}/subscribe`);
        } catch (error) {
            toast.error("An error occurred. Please try again.");
            setProfile(originalProfile);
        }
    };

    if (status === 'loading' || loading) {
        return (
             <main className="container mx-auto px-6 py-8 animate-pulse">
                <div className="mb-8">
                    <div className="h-10 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, index) => <VideoCardSkeleton key={index} />)}
                </div>
            </main>
        );
    }

    if (error || !profile) {
        return <div className="text-center p-10 text-red-500 font-semibold">{error || "User not found."}</div>;
    }
    
    const isOwnProfile = currentUser?.id === profile.user.id;

    return (
        <main className="container mx-auto px-6 py-8">
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">{profile.user.username}</h1>
                    <p className="text-gray-600 mt-2">
                        {profile.user.subscriberCount} subscribers • {profile.videos.length} videos • Joined on {new Date(profile.user.joined).toLocaleDateString()}
                    </p>
                </div>
                {isAuthenticated && !isOwnProfile && (
                    <button
                        onClick={handleSubscribe}
                        className={`px-6 py-2 font-semibold rounded-full transition-colors ${
                            profile.user.isSubscribed
                                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                : 'bg-black text-white hover:bg-gray-800'
                        }`}
                    >
                        {profile.user.isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-t pt-6">Uploads</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {profile.videos.length > 0 ? (
                    profile.videos.map(video => (
                        <VideoCard key={video._id} video={video} />
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-600">This user hasn't uploaded any videos yet.</p>
                )}
            </div>
        </main>
    );
};

export default ProfilePage;