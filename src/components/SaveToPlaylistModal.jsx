"use client";

import React, { useState, useEffect } from 'react';
import API from '@/lib/api';
import { toast } from 'react-toastify';

const SaveToPlaylistModal = ({ videoId, onClose }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
    const [newPlaylistIsPublic, setNewPlaylistIsPublic] = useState(true);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const response = await API.get('/playlists');
                setPlaylists(response.data);
            } catch (error) {
                console.error("Failed to fetch playlists:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylists();
    }, []);

    const handleToggleVideoInPlaylist = async (playlistId) => {
        try {
            const response = await API.put('/playlists', { playlistId, videoId });
            setPlaylists(prev => prev.map(p => p._id === playlistId ? response.data : p));
        } catch (error) {
            toast.error("Failed to update playlist.");
        }
    };
    
    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!newPlaylistTitle.trim()) return;
        try {
            const response = await API.post('/playlists', { 
                title: newPlaylistTitle, 
                isPublic: newPlaylistIsPublic 
            });
            setPlaylists([...playlists, response.data]);
            setNewPlaylistTitle("");
            setShowCreateForm(false);
            toast.success("Playlist created!");
        } catch (error) {
            toast.error("Failed to create playlist.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Save to...</h2>
                    <button onClick={onClose} className="text-3xl font-light text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors leading-none">&times;</button>
                </div>
                {loading ? <p className="text-gray-500 dark:text-gray-400">Loading playlists...</p> : (
                    <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {playlists.map(playlist => (
                            <li key={playlist._id}>
                                <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={playlist.videos.includes(videoId)}
                                        onChange={() => handleToggleVideoInPlaylist(playlist._id)}
                                        className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 dark:bg-slate-700 transition-all cursor-pointer"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{playlist.title}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-6 border-t border-gray-100 dark:border-slate-800 pt-6">
                    {showCreateForm ? (
                        <form onSubmit={handleCreatePlaylist} className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <input 
                                type="text"
                                placeholder="Enter playlist name..."
                                value={newPlaylistTitle}
                                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition-all outline-none"
                                required
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <label htmlFor="isPublic" className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 cursor-pointer font-medium">
                                    <input 
                                        id="isPublic"
                                        type="checkbox" 
                                        checked={newPlaylistIsPublic}
                                        onChange={(e) => setNewPlaylistIsPublic(e.target.checked)}
                                        className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-slate-600 dark:bg-slate-700 transition-all cursor-pointer"
                                    />
                                    Public
                                </label>
                                <div className="flex justify-end space-x-2">
                                    <button type="button" onClick={() => setShowCreateForm(false)} className="px-4 py-1.5 text-sm font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                                    <button type="submit" className="px-4 py-1.5 text-sm font-semibold bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm">Create</button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <button onClick={() => setShowCreateForm(true)} className="w-full text-left font-semibold text-indigo-600 dark:text-indigo-400 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors">
                            + Create new playlist
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SaveToPlaylistModal;