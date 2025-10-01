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
        return <div className="text-center p-10 text-red-500 font-semibold">Playlist not found or it is private.</div>;
    }

    return (
        <main className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800">{playlist.title}</h1>
                {playlist.description && <p className="text-gray-600 mt-2">{playlist.description}</p>}
                <p className="text-sm text-gray-500 mt-1">{playlist.videos.length} videos</p>
            </div>

            <div className="space-y-4">
                {playlist.videos.length > 0 ? (
                    playlist.videos.map((video, index) => (
                        <Link key={video._id} href={`/video/${video._id}`} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="text-lg font-semibold text-gray-400 w-8 text-center">{index + 1}</span>
                            <div className="w-40 h-24 flex-shrink-0">
                                <VideoThumbnail 
                                    videoId={video._id}
                                    altText={video.title}
                                />
                            </div>
                            <div className="w-0 flex-grow">
                                <h3 className="font-bold truncate">{video.title}</h3>
                                <p className="text-sm text-gray-500 truncate">{video.uploader?.username}</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="text-gray-500">This playlist is empty.</p>
                )}
            </div>
        </main>
    );
};

export default ViewPlaylistPage;