"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import Link from "next/link";
import VideoThumbnail from "@/components/VideoThumbnail";
import { toast } from "react-toastify";
import { MdDelete, MdAutoDelete } from "react-icons/md";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          const response = await API.get("/user/history");
          setHistory(response.data);
        } catch (error) {
          console.error("Failed to fetch history:", error);
          toast.error("Could not load your watch history.");
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [status, router]);

  const handleRemove = async (e, videoId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await API.delete(`/user/history?videoId=${videoId}`);
      setHistory((prev) => prev.filter((item) => item.videoId._id !== videoId));
      toast.success("Removed from watch history.");
    } catch (error) {
      toast.error("Failed to remove video from history.");
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear your entire watch history? This action cannot be undone."
      )
    ) {
      try {
        await API.delete("/user/history");
        setHistory([]);
        toast.success("Watch history cleared.");
      } catch (error) {
        toast.error("Failed to clear history.");
      }
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="text-center p-10">Loading your watch history...</div>
    );
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight">Watch History</h1>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
          >
            Clear all <MdAutoDelete />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {history.length > 0 ? (
          history.map(({ videoId: video, updatedAt }) => (
            <Link
              key={video._id}
              href={`/video/${video._id}`}
              className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-gray-100 dark:hover:border-slate-700 transition-all group"
            >
              <div className="w-48 h-28 flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow rounded-xl overflow-hidden">
                <VideoThumbnail videoId={video._id} altText={video.title} />
              </div>
              <div className="w-0 flex-grow">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display tracking-tight truncate mb-1">{video.title}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {video.uploader?.username}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Watched on {new Date(updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => handleRemove(e, video._id)}
                className="p-2 text-gray-400 dark:text-gray-500 transition-colors"
              >
                <MdDelete className="hover:text-rose-600 dark:hover:text-rose-400 h-5 w-5" />
              </button>
            </Link>
          ))
        ) : (
          <div className="text-center p-12 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">No watch history</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Videos you watch will appear here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default HistoryPage;
