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
        <h1 className="text-3xl font-bold text-gray-800">Watch History</h1>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline"
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
              className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 group"
            >
              <div className="w-48 h-28 flex-shrink-0">
                <VideoThumbnail videoId={video._id} altText={video.title} />
              </div>
              <div className="w-0 flex-grow">
                <h3 className="font-bold truncate">{video.title}</h3>
                <p className="text-sm text-gray-500 truncate">
                  {video.uploader?.username}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Watched on {new Date(updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => handleRemove(e, video._id)}
                className="p-2 text-gray-400 transition-opacity"
              >
                <MdDelete className="hover:text-red-600 h-5 w-5" />
              </button>
            </Link>
          ))
        ) : (
          <div className="text-center p-10 border rounded-lg">
            <h2 className="text-xl font-semibold">No watch history</h2>
            <p className="text-gray-600 mt-2">
              Videos you watch will appear here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default HistoryPage;
