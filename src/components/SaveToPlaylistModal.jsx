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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Save to...</h2>
                    <button onClick={onClose} className="text-2xl font-light">&times;</button>
                </div>
                {loading ? <p>Loading playlists...</p> : (
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {playlists.map(playlist => (
                            <li key={playlist._id}>
                                <label className="flex items-center space-x-3 cursor-pointer p-1">
                                    <input 
                                        type="checkbox" 
                                        checked={playlist.videos.includes(videoId)}
                                        onChange={() => handleToggleVideoInPlaylist(playlist._id)}
                                        className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span>{playlist.title}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-4 border-t pt-4">
                    {showCreateForm ? (
                        <form onSubmit={handleCreatePlaylist}>
                            <input 
                                type="text"
                                placeholder="Enter playlist name..."
                                value={newPlaylistTitle}
                                onChange={(e) => setNewPlaylistTitle(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <label htmlFor="isPublic" className="text-sm text-gray-600 flex items-center gap-2">
                                    <input 
                                        id="isPublic"
                                        type="checkbox" 
                                        checked={newPlaylistIsPublic}
                                        onChange={(e) => setNewPlaylistIsPublic(e.target.checked)}
                                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    Public
                                </label>
                                <div className="flex justify-end space-x-2">
                                    <button type="button" onClick={() => setShowCreateForm(false)} className="px-3 py-1 text-sm bg-gray-200 rounded-md">Cancel</button>
                                    <button type="submit" className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">Create</button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <button onClick={() => setShowCreateForm(true)} className="w-full text-left font-semibold text-blue-600 p-1">+ Create new playlist</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SaveToPlaylistModal;