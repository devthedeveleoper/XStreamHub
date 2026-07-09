"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import VideoThumbnail from "./VideoThumbnail";
import { FaUserCircle, FaClock, FaCheck } from "react-icons/fa";
import { useSession } from "next-auth/react";

const VideoCard = ({ video, isSaved, onToggleWatchLater }) => {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const handleAvatarClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    router.push(`/profile/${video.uploader?.username}`);
  };

  const handleWatchLaterClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleWatchLater();
  };

  return (
    <div className="block group cursor-pointer flex flex-col gap-3">
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all duration-300">
        <Link href={`/video/${video._id}`} className="w-full h-full block transform group-hover:scale-105 transition-transform duration-500">
          <VideoThumbnail videoId={video._id} altText={video.title} />
        </Link>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
        {isAuthenticated && (
          <button
            onClick={handleWatchLaterClick}
            className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full text-white transform hover:scale-110 transition-all duration-300 shadow-md"
            title={isSaved ? "Remove from Watch Later" : "Watch Later"}
          >
            {isSaved ? <FaCheck className="text-emerald-400" size={14} /> : <FaClock size={14} />}
          </button>
        )}
      </div>
      <div className="flex gap-3 px-1">
        <div
          className="flex-shrink-0"
          onClick={handleAvatarClick}
        >
          {video.uploader?.avatar ? (
            <Image
              src={video.uploader.avatar}
              alt={video.uploader.username}
              width={36}
              height={36}
              className="rounded-full ring-2 ring-transparent hover:ring-indigo-500 transition-all duration-300 object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center hover:ring-2 hover:ring-indigo-500 transition-all">
              <FaUserCircle size={24} className="text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        <div className="flex flex-col w-0 flex-grow pt-0.5">
          <Link href={`/video/${video._id}`}>
            <h3 className="tracking-tight text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {video.title}
            </h3>
          </Link>
          <p
            className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            onClick={handleAvatarClick}
          >
            {video.uploader?.username || "Unknown Uploader"}
          </p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-0.5">
            <span>{video.views} views</span>
            <span className="mx-1.5 text-[10px]">•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
