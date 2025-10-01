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
            className="flex items-center space-x-3 p-2 bg-gray-50 rounded border"
        >
            <span {...attributes} {...listeners} className="text-gray-400 cursor-grab touch-none">☰</span>
            <div className="w-20 h-12 flex-shrink-0">
                 <VideoThumbnail
                    videoId={video._id}
                    altText={video.title}
                />
            </div>
            <div className="flex-grow w-0">
                <Link href={`/video/${video._id}`} className="font-semibold hover:underline truncate text-sm">{video.title}</Link>
            </div>
            <button onClick={onRemove} className="text-red-500 hover:text-red-700 text-xs font-semibold flex-shrink-0">Remove</button>
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
            <Link href="/my-playlists" className="text-sm text-blue-600 hover:underline mb-4 block">&larr; Back to all playlists</Link>
            <h1 className="text-3xl font-bold">{playlist.title}</h1>
            <p className="text-gray-500 mb-6">{playlist.videos.length} videos</p>
            <div className="max-w-2xl">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={playlist.videos.map(v => v._id)} strategy={verticalListSortingStrategy}>
                        <ul className="space-y-2">
                            {playlist.videos.map(video => (
                                <SortableVideoItem key={video._id} video={video} onRemove={() => handleRemoveVideo(video._id)} />
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
                 {playlist.videos.length === 0 && <p className="mt-4 text-center text-gray-500">This playlist is empty. Add videos by clicking the "Save" button on a video page.</p>}
            </div>
        </main>
    );
};

export default EditPlaylistPage;