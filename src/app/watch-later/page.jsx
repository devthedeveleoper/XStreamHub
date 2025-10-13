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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Watch Later</h1>
      <div className="space-y-4">
        {videos.length > 0 ? (
          videos.map(({ videoId: video }) => (
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
              </div>
              <button
                onClick={(e) => handleRemove(e, video._id)}
                className="p-2"
              >
                <MdOutlineAutoDelete className="h-5 w-5 hover:text-red-500" />
              </button>
            </Link>
          ))
        ) : (
          <p>You have no videos in your Watch Later list.</p>
        )}
      </div>
    </main>
  );
};

export default WatchLaterPage;
