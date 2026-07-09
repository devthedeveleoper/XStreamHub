"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import API from '@/lib/api';
import Link from 'next/link';
import VideoThumbnail from '@/components/VideoThumbnail';
import { toast } from 'react-toastify';

const ViewPlaylistPage = () => {
    const params = useParams();
    const id = params.id;
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchPlaylist = async () => {
            try {
                setLoading(true);
                const response = await API.get(`/playlist/${id}`);
                setPlaylist(response.data);
            } catch (error) {
                toast.error(error.response?.data?.message || "Could not load playlist.");
                console.error(error);
                setPlaylist(null);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylist();
    }, [id]);

    if (loading) {
        return <div className="text-center p-10">Loading playlist...</div>;
    }

    if (!playlist) {
        return <div className="text-center p-12 text-rose-500 dark:text-rose-400 font-semibold">Playlist not found or it is private.</div>;
    }

    return (
        <main className="container mx-auto px-6 py-8">
            <div className="mb-10 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{playlist.title}</h1>
                {playlist.description && <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">{playlist.description}</p>}
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">{playlist.videos.length} videos</p>
            </div>

            <div className="space-y-4">
                {playlist.videos.length > 0 ? (
                    playlist.videos.map((video, index) => (
                        <Link key={video._id} href={`/video/${video._id}`} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-gray-100 dark:hover:border-slate-700 transition-all group">
                            <span className="text-lg font-semibold text-gray-400 dark:text-slate-600 w-8 text-center">{index + 1}</span>
                            <div className="w-40 h-24 flex-shrink-0">
                                <VideoThumbnail 
                                    videoId={video._id}
                                    altText={video.title}
                                />
                            </div>
                            <div className="w-0 flex-grow">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate">{video.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{video.uploader?.username}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="text-center p-12 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">This playlist is empty.</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default ViewPlaylistPage;