"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import VideoThumbnail from '@/components/VideoThumbnail';

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
            className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300 shadow-sm mb-3"
        >
            <span {...attributes} {...listeners} className="text-gray-400 dark:text-slate-500 cursor-grab touch-none px-2 py-4">☰</span>
            <div className="w-24 h-14 flex-shrink-0">
                 <VideoThumbnail
                    videoId={video._id}
                    altText={video.title}
                />
            </div>
            <div className="flex-grow w-0 px-2">
                <Link href={`/video/${video._id}`} className="font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate text-sm block">{video.title}</Link>
            </div>
            <button onClick={onRemove} className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 text-sm font-semibold flex-shrink-0 px-3 transition-colors">Remove</button>
        </li>
    );
};

const EditPlaylistPage = () => {
    const params = useParams();
    const playlistId = params.id;
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!playlistId) return;
        const fetchPlaylistDetails = async () => {
            try {
                setLoading(true);
                const response = await API.get(`/playlist/${playlistId}`);
                setPlaylist(response.data);
            } catch (error) {
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
            
            setPlaylist(prev => ({...prev, videos: newVideoOrder}));
            
            API.put('/playlists', { playlistId, newVideoOrder: newVideoOrder.map(v => v._id) })
                .then(() => toast.success("Playlist order saved!"))
                .catch(() => toast.error("Failed to save new order."));
        }
    };
    
    const handleRemoveVideo = async (videoId) => {
        try {
            await API.put('/playlists', { playlistId, videoId });
            setPlaylist(prev => ({...prev, videos: prev.videos.filter(v => v._id !== videoId) }));
            toast.success("Video removed from playlist.");
        } catch (error) { 
            toast.error("Failed to remove video."); 
        }
    };

    if (loading) {
        return (
            <main className="container mx-auto px-6 py-8 animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/5 mb-6"></div>
                <div className="max-w-2xl space-y-2">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                </div>
            </main>
        );
    }
    
    if (!playlist) return <div className="text-center p-10">Playlist not found.</div>;

    return (
        <main className="container mx-auto px-6 py-8">
            <Link href="/my-playlists" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline mb-6 block transition-colors">&larr; Back to all playlists</Link>
            
            <div className="mb-8 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{playlist.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">{playlist.videos.length} videos</p>
            </div>

            <div className="max-w-3xl">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={playlist.videos.map(v => v._id)} strategy={verticalListSortingStrategy}>
                        <ul className="space-y-3">
                            {playlist.videos.map(video => (
                                <SortableVideoItem key={video._id} video={video} onRemove={() => handleRemoveVideo(video._id)} />
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
                 {playlist.videos.length === 0 && (
                    <div className="mt-8 text-center p-12 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                        <p className="text-gray-500 dark:text-gray-400 font-medium">This playlist is empty. Add videos by clicking the "Save" button on a video page.</p>
                    </div>
                 )}
            </div>
        </main>
    );
};

export default EditPlaylistPage;