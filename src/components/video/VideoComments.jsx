"use client";

import React, { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import API from "@/lib/api";
import { toast } from "react-toastify";
import Comment from "@/components/Comment";

const VideoComments = ({ videoId, isAuthenticated }) => {
  const [newComment, setNewComment] = useState("");

  const { data: comments, mutate } = useSWR(
    `/videos/${videoId}/comments`,
    fetcher
  );

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await API.post(`/videos/${videoId}/comments`, {
        text: newComment,
      });
      mutate([res.data, ...(comments || [])], false);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (err) {
      toast.error("Failed to post comment. Please try again.");
    }
  };

  const handleCommentDeleted = (deletedComment) => {
    mutate(
      (comments || []).filter((c) => c._id !== deletedComment._id),
      false
    );
  };

  const handleCommentUpdated = (updatedComment) => {
    mutate(
      (comments || []).map((c) => (c._id === updatedComment._id ? updatedComment : c)),
      false
    );
  };

  if (!comments) {
    return <div className="mt-8 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 animate-pulse h-64"></div>;
  }

  return (
    <div className="mt-8 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {comments.length} Comments
      </h2>
      {isAuthenticated ? (
        <form onSubmit={handleCommentSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
            rows={3}
          />
          <button
            type="submit"
            className="mt-3 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Post Comment
          </button>
        </form>
      ) : (
        <p className="mb-8 text-gray-600 dark:text-gray-400 font-medium">
          Please{" "}
          <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            log in
          </Link>{" "}
          to post a comment.
        </p>
      )}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Comment
            key={comment._id}
            comment={comment}
            videoId={videoId}
            onCommentDeleted={handleCommentDeleted}
            onCommentUpdated={handleCommentUpdated}
            onReplySubmitted={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoComments;
