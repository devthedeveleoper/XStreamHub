"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import API from "@/lib/api";
import VideoPlayerSkeleton from "@/components/VideoPlayerSkeleton";
import VideoInfoPanel from "@/components/video/VideoInfoPanel";
import VideoComments from "@/components/video/VideoComments";
import VideoRecommendations from "@/components/video/VideoRecommendations";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

const VideoPlayerPage = () => {
  const params = useParams();
  const id = params.id;
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const { data: video, error, isLoading } = useSWR(
    id ? `/videos/${id}` : null,
    fetcher
  );

  const playVideo = useAppStore((state) => state.playVideo);

  useEffect(() => {
    if (id) {
      API.post(`/videos/${id}/view`).catch((err) =>
        console.error("Failed to count view:", err)
      );
      window.scrollTo(0, 0);
    }
  }, [id]);

  useEffect(() => {
    if (video) {
      playVideo({
        id: video._id,
        fileId: video.fileId,
        title: video.title
      });
    }
  }, [video, playVideo]);

  if (isLoading || status === "loading") {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors">
        <VideoPlayerSkeleton />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen flex items-center justify-center transition-colors">
        <div className="text-center p-12 text-rose-500 dark:text-rose-400 font-semibold bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700">
          {error?.message || "Video not found."}
        </div>
      </div>
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2">
        <div className="w-full h-[576px] rounded-lg overflow-hidden shadow-xl bg-black">
          {video.fileId && (
            <div id="video-player-slot" className="w-full h-full relative"></div>
          )}
        </div>

        <VideoInfoPanel initialVideo={video} />
        <VideoComments videoId={id} isAuthenticated={isAuthenticated} />
      </div>

      <div className="lg:col-span-1">
        <VideoRecommendations videoId={id} isAuthenticated={isAuthenticated} />
      </div>
    </motion.main>
  );
};

export default VideoPlayerPage;
