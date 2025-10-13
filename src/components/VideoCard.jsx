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
    <div className="block group">
      <div className="relative">
        <Link href={`/video/${video._id}`}>
          <VideoThumbnail videoId={video._id} altText={video.title} />
        </Link>
        {isAuthenticated && (
          <button
            onClick={handleWatchLaterClick}
            className="absolute top-2 right-2 p-2 bg-black bg-opacity-60 rounded-full text-white"
            title={isSaved ? "Remove from Watch Later" : "Watch Later"}
          >
            {isSaved ? <FaCheck className="text-green-500" /> : <FaClock />}
          </button>
        )}
      </div>
      <div className="flex gap-3 mt-2">
        <div
          className="flex-shrink-0 cursor-pointer"
          onClick={handleAvatarClick}
        >
          {video.uploader?.avatar ? (
            <Image
              src={video.uploader.avatar}
              alt={video.uploader.username}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <FaUserCircle size={40} className="text-gray-400" />
          )}
        </div>

        <div className="flex flex-col w-0 flex-grow">
          <Link href={`/video/${video._id}`}>
            <h3 className="text-md font-bold text-gray-900 leading-snug truncate group-hover:text-blue-600">
              {video.title}
            </h3>
          </Link>
          <p
            className="text-sm text-gray-600 mt-1 truncate cursor-pointer hover:text-blue-600"
            onClick={handleAvatarClick}
          >
            {video.uploader?.username || "Unknown Uploader"}
          </p>
          <div className="mt-1 flex items-center text-xs text-gray-500">
            <span>{video.views} views</span>
            <span className="mx-2">•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
