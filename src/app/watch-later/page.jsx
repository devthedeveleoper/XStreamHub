"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import Link from "next/link";
import VideoThumbnail from "@/components/VideoThumbnail";
import { toast } from "react-toastify";
import {MdOutlineAutoDelete } from "react-icons/md"

const WatchLaterPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      const fetchWatchLater = async () => {
        try {
          setLoading(true);
          const response = await API.get("/user/watch-later");
          setVideos(response.data);
        } catch (error) {
          toast.error("Could not load your Watch Later list.");
        } finally {
          setLoading(false);
        }
      };
      fetchWatchLater();
    }
  }, [status, router]);

  const handleRemove = async (e, videoId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await API.delete(`/user/watch-later?videoId=${videoId}`);
      setVideos((prev) => prev.filter((item) => item.videoId._id !== videoId));
      toast.success("Removed from Watch Later.");
    } catch (error) {
      toast.error("Failed to remove video.");
    }
  };

  if (status === "loading" || loading) return <div>Loading...</div>;

  return (
    <main className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight mb-8">Watch Later</h1>
      <div className="space-y-4">
        {videos.length > 0 ? (
          videos.map(({ videoId: video }) => (
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
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate font-medium">
                  {video.uploader?.username}
                </p>
              </div>
              <button
                onClick={(e) => handleRemove(e, video._id)}
                className="p-2 text-gray-400 dark:text-gray-500 transition-colors"
              >
                <MdOutlineAutoDelete className="h-5 w-5 hover:text-rose-600 dark:hover:text-rose-400" />
              </button>
            </Link>
          ))
        ) : (
          <div className="text-center p-12 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Empty List</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              You have no videos in your Watch Later list.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default WatchLaterPage;
