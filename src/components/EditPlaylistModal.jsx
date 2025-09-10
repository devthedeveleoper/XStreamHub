"use client";

import React, { useState } from 'react';

const EditPlaylistModal = ({ playlist, onSave, onCancel }) => {
    const [title, setTitle] = useState(playlist.title);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(playlist._id, { title });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Edit Playlist</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Playlist Title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md"
                        required
                    />
                    <div className="flex justify-end space-x-2 mt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPlaylistModal;