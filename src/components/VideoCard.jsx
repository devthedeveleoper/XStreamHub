"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import VideoThumbnail from './VideoThumbnail';
import { FaUserCircle } from 'react-icons/fa';

const VideoCard = ({ video }) => {
    const router = useRouter();

    const handleAvatarClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        router.push(`/profile/${video.uploader?.username}`);
    };

    return (
        <Link href={`/video/${video._id}`} className="block group">
            <div className="flex flex-col gap-2">
                <VideoThumbnail
                    videoId={video._id}
                    altText={video.title}
                />
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
                        <h3 className="text-md font-bold text-gray-900 leading-snug truncate group-hover:text-blue-600">
                            {video.title}
                        </h3>
                        <p 
                            className="text-sm text-gray-600 mt-1 truncate cursor-pointer hover:text-blue-600"
                            onClick={handleAvatarClick}
                        >
                            {video.uploader?.username || 'Unknown Uploader'}
                        </p>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                            <span>{video.views} views</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default VideoCard;