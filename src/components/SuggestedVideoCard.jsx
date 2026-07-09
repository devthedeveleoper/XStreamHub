"use client";

import React from 'react';
import Link from 'next/link';
import VideoThumbnail from './VideoThumbnail';

const SuggestedVideoCard = ({ video }) => {
    return (
        <Link href={`/video/${video._id}`} className="flex space-x-3 group cursor-pointer p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800/50 transition-colors duration-300">
            <div className="flex-shrink-0 w-40 h-24 relative rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                <VideoThumbnail
                    videoId={video._id}
                    altText={video.title}
                />
            </div>
            
            <div className="flex flex-col w-0 flex-grow py-1">
                <h4 className="tracking-tight font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-tight line-clamp-2 transition-colors">
                    {video.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">
                    {video.uploader?.username || "Unknown Uploader"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    {video.views} views
                </p>
            </div>
        </Link>
    );
};

export default SuggestedVideoCard;