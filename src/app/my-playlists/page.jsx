"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import API from '@/lib/api';
import { toast } from 'react-toastify';
import EditPlaylistModal from '@/components/EditPlaylistModal';
import { FaGlobeAsia, FaLock, FaTrash } from 'react-icons/fa';

const MyPlaylistsPage = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }
        if (status === 'authenticated') {
            const fetchPlaylists = async () => {
                try {
                    setLoading(true);
                    const response = await API.get('/playlists/my-playlists');
                    setPlaylists(response.data);
                } catch (error) {
                    toast.error("Failed to load playlists.");
                } finally {
                    setLoading(false);
                }
            };
            fetchPlaylists();
        }
    }, [status, router]);

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        if (!title.trim()) return;
        try {
            const response = await API.post('/playlists/my-playlists', { title, isPublic: true });
            setPlaylists(prev => [response.data, ...prev]);
            e.target.reset();
            toast.success("Playlist created!");
        } catch (error) { 
            toast.error("Failed to create playlist."); 
        }
    };
    
    const handleDeletePlaylist = async (playlistId) => {
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;
        try {
            await API.delete(`/playlist/${playlistId}`);
            setPlaylists(prev => prev.filter(p => p._id !== playlistId));
            toast.success("Playlist deleted.");
        } catch (error) { 
            toast.error("Failed to delete playlist."); 
        }
    };

    const handleSaveEdit = async (playlistId, { title }) => {
        try {
            const response = await API.put('/playlists/my-playlists', { playlistId, title });
            setPlaylists(prev => prev.map(p => p._id === playlistId ? response.data : p));
            setEditingPlaylist(null);
            toast.success("Playlist updated!");
        } catch (error) {
            toast.error("Failed to update playlist.");
        }
    };
    
    const handlePrivacyToggle = async (playlist) => {
        try {
            const response = await API.put('/playlists/my-playlists', { playlistId: playlist._id, isPublic: !playlist.isPublic });
            setPlaylists(prev => prev.map(p => p._id === playlist._id ? response.data : p));
            toast.success("Privacy updated!");
        } catch (error) {
            toast.error("Failed to update privacy.");
        }
    };

    const handleShare = (playlistId) => {
        const url = `${window.location.origin}/playlist/${playlistId}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Playlist link copied to clipboard!");
        }).catch(err => {
            toast.error("Failed to copy link.");
            console.error('Failed to copy text: ', err);
        });
    };

    if (status === 'loading' || loading) {
        return (
            <main className="container mx-auto px-6 py-8 animate-pulse">
                <div className="h-10 bg-gray-300 rounded w-1/3 mb-6"></div>
                <div className="h-12 bg-gray-300 rounded-lg w-full mb-8"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-gray-200 rounded-lg h-32"></div>
                    ))}
                </div>
            </main>
        );
    }

    return (
        <>
            {editingPlaylist && (
                <EditPlaylistModal
                    playlist={editingPlaylist}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingPlaylist(null)}
                />
            )}
            <main className="container mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold mb-6">My Playlists</h1>
                
                <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                    <form onSubmit={handleCreatePlaylist} className="flex flex-col sm:flex-row items-center gap-2">
                        <input name="title" type="text" placeholder="Create new playlist..." className="flex-grow w-full sm:w-auto p-2 border rounded-md"/>
                        <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md font-semibold">Create</button>
                    </form>
                </div>
                
                {playlists.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {playlists.map(playlist => (
                            <div key={playlist._id} className="bg-white rounded-lg shadow-md p-4 group flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between">
                                        <h2 className="text-lg font-bold truncate pr-2">{playlist.title}</h2>
                                        {playlist.isPublic ? (
                                            <FaGlobeAsia title="Public" className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        ) : (
                                            <FaLock title="Private" className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{playlist.videos.length} videos</p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <Link href={`/playlist/${playlist._id}/edit`} className="text-sm font-semibold text-blue-600 hover:underline">Manage</Link>
                                    <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleShare(playlist._id)} className="text-xs text-gray-400 hover:text-blue-600">Share</button>
                                        <button onClick={() => handlePrivacyToggle(playlist)} className="text-xs text-gray-400 hover:text-blue-600">{playlist.isPublic ? 'Make Private' : 'Make Public'}</button>
                                        <button onClick={() => setEditingPlaylist(playlist)} className="text-xs text-gray-400 hover:text-blue-600">Rename</button>
                                        <button onClick={() => handleDeletePlaylist(playlist._id)} className="text-gray-400 hover:text-red-500">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-10 border rounded-lg">
                        <h2 className="text-xl font-semibold">No playlists found</h2>
                        <p className="text-gray-600 mt-2">Create your first playlist to get started.</p>
                    </div>
                )}
            </main>
        </>
    );
};

export default MyPlaylistsPage;