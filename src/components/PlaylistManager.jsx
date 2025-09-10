"use client";

import React, { useState, useEffect } from 'react';
import API from '@/lib/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'react-toastify';
import Link from 'next/link';
import VideoThumbnail from './VideoThumbnail';

// A Sortable Item component for the videos in the playlist
const SortableVideoItem = ({ video, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: video._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className="flex items-center space-x-3 p-2 bg-gray-50 rounded border"
        >
            <span {...attributes} {...listeners} className="text-gray-400 cursor-grab touch-none">☰</span>
            <div className="w-20 h-12 object-cover rounded flex-shrink-0">
                <VideoThumbnail
                    fileId={video.fileId}
                    customThumbnailUrl={video.thumbnailUrl}
                    altText={video.title}
                />
            </div>
            <div className="flex-grow w-0">
                <Link href={`/video/${video._id}`} className="font-semibold hover:underline truncate text-sm">
                    {video.title}
                </Link>
                <p className="text-xs text-gray-500 truncate">{video.uploader.username}</p>
            </div>
            <button onClick={onRemove} className="text-red-500 hover:text-red-700 text-xs font-semibold flex-shrink-0">
                Remove
            </button>
        </li>
    );
};

const PlaylistManager = ({ playlistId }) => {
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylistDetails = async () => {
            if (!playlistId) return;
            try {
                setLoading(true);
                const response = await API.get(`/playlist/${playlistId}`);
                setPlaylist(response.data);
            } catch (error) {
                console.error("Failed to fetch playlist details", error);
                toast.error("Could not load playlist details.");
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylistDetails();
    }, [playlistId]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active && over && active.id !== over.id) {
            const oldIndex = playlist.videos.findIndex(v => v._id === active.id);
            const newIndex = playlist.videos.findIndex(v => v._id === over.id);
            const newVideoOrder = arrayMove(playlist.videos, oldIndex, newIndex);
            
            // Optimistically update the UI
            setPlaylist(prev => ({...prev, videos: newVideoOrder}));
            
            // Send the new order of video IDs to the backend
            const newVideoOrderIds = newVideoOrder.map(video => video._id);
            API.put('/playlists/my-playlists', { playlistId, newVideoOrder: newVideoOrderIds })
                .then(() => toast.success("Playlist order saved!"))
                .catch(() => toast.error("Failed to save new order."));
        }
    };

    const handleRemoveVideo = async (videoId) => {
        try {
            await API.put('/playlists', { playlistId, videoId }); // The PUT route toggles the video
            // Optimistically update the UI to remove the video
            setPlaylist(prev => ({...prev, videos: prev.videos.filter(v => v._id !== videoId) }));
            toast.success("Video removed from playlist.");
        } catch (error) { 
            toast.error("Failed to remove video."); 
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                <div className="h-7 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }
    
    if (!playlist) return <div className="p-6">Playlist not found.</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold">{playlist.title}</h2>
            <p className="text-sm text-gray-500">{playlist.videos.length} videos</p>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={playlist.videos.map(v => v._id)}
                    strategy={verticalListSortingStrategy}
                >
                    <ul className="mt-4 space-y-2">
                        {playlist.videos.map((video) => (
                            <SortableVideoItem 
                                key={video._id} 
                                video={video} 
                                onRemove={() => handleRemoveVideo(video._id)} 
                            />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
             {playlist.videos.length === 0 && <p className="mt-4 text-sm text-center text-gray-500">This playlist is empty. Add videos by clicking the "Save" button on a video page.</p>}
        </div>
    );
};

export default PlaylistManager;