"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import API from '@/lib/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import VideoCard from '@/components/VideoCard';
import VideoCardSkeleton from '@/components/VideoCardSkeleton';
import { FaUserCircle, FaImage } from 'react-icons/fa';

const ProfilePage = () => {
    const params = useParams();
    const username = params.username;
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";
    const currentUser = session?.user;
    
    const { data: profile, error, mutate, isLoading } = useSWR(
        username ? `/users/${username}` : null,
        fetcher
    );

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

        mutate({
            ...profile,
            user: { ...profile.user, isSubscribed: newIsSubscribed, subscriberCount: newSubscriberCount }
        }, false);

        try {
            await API.post(`/users/${profile.user.id}/subscribe`);
        } catch (error) {
            toast.error("An error occurred. Please try again.");
            mutate(originalProfile, false);
        }
    };

    if (status === 'loading' || isLoading) {
        return (
             <main className="animate-pulse">
                <div className="h-48 md:h-64 bg-gray-200 dark:bg-slate-800 w-full mb-8"></div>
                <div className="container mx-auto px-6">
                    <div className="flex gap-6 items-end -mt-20 mb-8">
                        <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900"></div>
                        <div className="h-10 bg-gray-300 dark:bg-slate-700 rounded w-48 mb-2"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, index) => <VideoCardSkeleton key={index} />)}
                    </div>
                </div>
            </main>
        );
    }

    if (error || !profile) {
        return <div className="text-center p-12 text-rose-500 dark:text-rose-400 font-semibold">{error?.message || "User not found."}</div>;
    }
    
    const isOwnProfile = currentUser?.id === profile.user.id;

    return (
        <motion.main 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="pb-12"
        >
            {/* CHANNEL BANNER */}
            <div className="w-full h-48 md:h-72 bg-indigo-50 dark:bg-slate-800 relative">
                {profile.user.banner ? (
                    <Image 
                        src={profile.user.banner} 
                        alt={`${profile.user.username}'s banner`}
                        layout="fill"
                        objectFit="cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                        <FaImage size={64} className="text-gray-400 mb-4" />
                        <span className="text-gray-500 font-medium">No banner provided</span>
                    </div>
                )}
            </div>

            <div className="container mx-auto px-4 sm:px-6">
                
                {/* PROFILE HEADER INFO */}
                <div className="relative -mt-12 sm:-mt-20 flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 z-10">
                    
                    <div className="flex flex-col md:flex-row gap-6 md:items-end w-full">
                        <div className="flex-shrink-0">
                            {profile.user.avatar ? (
                                <Image
                                    src={profile.user.avatar}
                                    alt={profile.user.username}
                                    width={144}
                                    height={144}
                                    className="w-24 h-24 sm:w-36 sm:h-36 rounded-full ring-4 ring-white dark:ring-slate-900 object-cover bg-white dark:bg-slate-900"
                                />
                            ) : (
                                <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full ring-4 ring-white dark:ring-slate-900 bg-gray-200 dark:bg-slate-800 flex items-center justify-center">
                                    <FaUserCircle size={72} className="text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div className="flex-grow pb-2">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight">
                                {profile.user.username}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
                                <span className="font-bold text-gray-900 dark:text-gray-200">{profile.user.subscriberCount}</span> subscribers 
                                <span>•</span> 
                                <span className="font-bold text-gray-900 dark:text-gray-200">{profile.videos.length}</span> videos
                            </p>
                            
                            {profile.user.bio && (
                                <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl text-sm sm:text-base whitespace-pre-line">
                                    {profile.user.bio}
                                </p>
                            )}
                        </div>

                        <div className="flex-shrink-0 pb-2">
                            {isOwnProfile ? (
                                <Link 
                                    href="/my-profile"
                                    className="block px-8 py-3 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors shadow-sm text-center"
                                >
                                    Customize Channel
                                </Link>
                            ) : (
                                isAuthenticated && (
                                    <button
                                        onClick={handleSubscribe}
                                        className={`w-full md:w-auto px-8 py-3 font-semibold rounded-xl transition-all shadow-sm ${
                                            profile.user.isSubscribed
                                                ? 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700'
                                                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 hover:shadow-md transform hover:-translate-y-0.5'
                                        }`}
                                    >
                                        {profile.user.isSubscribed ? 'Subscribed' : 'Subscribe'}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
                
                {/* UPLOADS SECTION */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-display tracking-tight">Uploads</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {profile.videos.length > 0 ? (
                        profile.videos.map((video, index) => (
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
                        <div className="col-span-full text-center p-16 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 rounded-2xl shadow-sm">
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">This creator hasn't uploaded any videos yet.</p>
                            <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm">Check back later for new content!</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.main>
    );
};

export default ProfilePage;