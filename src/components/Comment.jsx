"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import API from '@/lib/api';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import Image from 'next/image';

const Comment = ({ comment, videoId, onCommentDeleted, onCommentUpdated, onReplySubmitted }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.text);
    const [replyText, setReplyText] = useState('');
    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(false);
    
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";
    const currentUser = session?.user;
    const isOwner = currentUser?.id === comment.author._id;

    const handleLoadReplies = async () => {
        if (replies.length > 0) {
            setReplies([]);
            return;
        }
        setLoadingReplies(true);
        try {
            const response = await API.get(`/comments/${comment._id}/replies`);
            setReplies(response.data);
        } catch (error) {
            toast.error("Failed to load replies.");
        } finally {
            setLoadingReplies(false);
        }
    };
    
    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        try {
            const response = await API.post(`/videos/${videoId}/comments`, {
                text: replyText,
                parentCommentId: comment._id,
            });
            setReplies([...replies, response.data]);
            if (onReplySubmitted) onReplySubmitted();
            setReplyText('');
            setShowReplyForm(false);
            toast.success("Reply posted!");
        } catch (error) {
            toast.error("Failed to post reply.");
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await API.put(`/comments/${comment._id}`, { text: editText });
            if (onCommentUpdated) onCommentUpdated(response.data);
            setIsEditing(false);
            toast.success("Comment updated!");
        } catch (error) {
            toast.error("Failed to update comment.");
        }
    };
    
    const handleDelete = async () => {
        if(window.confirm("Are you sure you want to delete this comment? All replies will also be removed.")){
            try {
                await API.delete(`/comments/${comment._id}`);
                if (onCommentDeleted) onCommentDeleted(comment);
                toast.success("Comment deleted.");
            } catch (error) {
                toast.error("Failed to delete comment.");
            }
        }
    };

    return (
        <div className="flex space-x-3">
            <div className="flex-shrink-0">
                <Link href={`/profile/${comment.author.username}`}>
                    {comment.author?.avatar ? (
                        <Image
                            src={comment.author.avatar}
                            alt={comment.author.username}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600">
                             {comment.author.username.charAt(0).toUpperCase()}
                        </div>
                    )}
                </Link>
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm">
                        <Link href={`/profile/${comment.author.username}`} className="hover:underline">{comment.author.username}</Link>{" "}
                        <span className="text-xs text-gray-500 font-normal">{new Date(comment.createdAt).toLocaleString()}</span>
                    </p>
                    {isOwner && !isEditing && (
                        <div className="flex space-x-3">
                             <button onClick={() => setIsEditing(true)} className="text-xs text-gray-500 hover:underline">Edit</button>
                             <button onClick={handleDelete} className="text-xs text-red-500 hover:underline">Delete</button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleUpdateSubmit} className="mt-2">
                        <textarea 
                            value={editText} 
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full p-2 border rounded-md text-sm"
                            rows={2}
                        />
                        <div className="flex space-x-2 mt-1">
                            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700">Save</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-xs font-semibold hover:bg-gray-300">Cancel</button>
                        </div>
                    </form>
                ) : (
                    <p className="text-gray-800 text-sm mt-1">{comment.text}</p>
                )}
                
                <div className="flex items-center space-x-4 text-xs mt-2">
                    <button onClick={() => setShowReplyForm(!showReplyForm)} className="font-semibold text-gray-600 hover:underline">Reply</button>
                    <button onClick={handleLoadReplies} className="font-semibold text-gray-600 hover:underline">
                        {loadingReplies ? 'Loading...' : replies.length > 0 ? 'Hide Replies' : 'View Replies'}
                    </button>
                </div>
                
                {showReplyForm && isAuthenticated && (
                    <form onSubmit={handleReplySubmit} className="mt-3">
                        <textarea 
                            value={replyText} 
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Replying to ${comment.author.username}...`}
                            className="w-full p-2 border rounded-md text-sm"
                            rows={2}
                        />
                        <div className="flex space-x-2 mt-1">
                             <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700">Post Reply</button>
                             <button type="button" onClick={() => setShowReplyForm(false)} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-xs font-semibold hover:bg-gray-300">Cancel</button>
                        </div>
                    </form>
                )}

                <div className="mt-4 space-y-4 pl-6 border-l-2">
                    {replies.map(reply => (
                        <Comment 
                            key={reply._id} 
                            comment={reply} 
                            videoId={videoId}
                            onCommentDeleted={() => setReplies(prev => prev.filter(r => r._id !== reply._id))}
                            onCommentUpdated={(updatedReply) => {
                                setReplies(prevReplies => prevReplies.map(r => r._id === updatedReply._id ? updatedReply : r));
                            }}
                            onReplySubmitted={onReplySubmitted} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Comment;