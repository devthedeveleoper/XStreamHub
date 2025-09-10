import React from "react";

const VideoCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-gray-300 rounded-lg w-full h-48 animate-pulse"></div>
      <div className="flex gap-3">
        <div className="flex flex-col gap-2 w-full">
          <div className="bg-gray-300 rounded-md w-full h-5 animate-pulse"></div>
          <div className="bg-gray-300 rounded-md w-2/3 h-4 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoCardSkeleton;
