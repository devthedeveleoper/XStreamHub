import React from "react";
import Link from "next/link";
import VideoThumbnail from "./VideoThumbnail";

const SuggestedVideoCard = ({ video }) => {
  return (
    <Link href={`/video/${video._id}`} className="flex space-x-3 group">
      <div className="flex-shrink-0 w-40 h-24">
        <VideoThumbnail
          fileId={video.fileId}
          customThumbnailUrl={video.thumbnailUrl}
          altText={video.title}
        />
      </div>
      <div className="flex flex-col w-0 flex-grow">
        <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 leading-tight truncate">
          {video.title}
        </h4>
        <p className="text-xs text-gray-600 mt-1 truncate">
          {video.uploader?.username || "Unknown Uploader"}
        </p>
        <p className="text-xs text-gray-500 mt-1">{video.views} views</p>
      </div>
    </Link>
  );
};

export default SuggestedVideoCard;
