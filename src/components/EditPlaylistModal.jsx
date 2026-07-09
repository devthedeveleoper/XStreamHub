"use client";

import React, { useState } from 'react';

const EditPlaylistModal = ({ playlist, onSave, onCancel }) => {
    const [title, setTitle] = useState(playlist.title);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(playlist._id, { title });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Edit Playlist</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Playlist Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        required
                    />
                    <div className="flex justify-end space-x-3 mt-6">
                        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-md">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPlaylistModal;