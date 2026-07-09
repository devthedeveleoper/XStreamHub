"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { FaTimes, FaExpandAlt } from "react-icons/fa";

const GlobalVideoPlayer = () => {
  const activeVideo = useAppStore((state) => state.activeVideo);
  const closeVideo = useAppStore((state) => state.closeVideo);
  const pathname = usePathname();
  const router = useRouter();
  
  const [slotElement, setSlotElement] = useState(null);

  const isMainVideoPage = activeVideo && pathname === `/video/${activeVideo.id}`;

  useEffect(() => {
    let intervalId;
    if (isMainVideoPage) {
      // Find the slot element in the DOM
      // We use an interval in case the page component hasn't fully mounted its DOM yet
      const findSlot = () => {
        const el = document.getElementById("video-player-slot");
        if (el) {
          setSlotElement(el);
          clearInterval(intervalId);
        }
      };
      
      findSlot();
      intervalId = setInterval(findSlot, 50);
    } else {
      setSlotElement(null);
    }

    return () => clearInterval(intervalId);
  }, [isMainVideoPage, pathname]);

  if (!activeVideo) return null;

  const iframeContent = (
    <iframe
      src={`https://streamtape.com/e/${activeVideo.fileId}`}
      title={activeVideo.title}
      frameBorder="0"
      allowFullScreen
      className="w-full h-full border-0"
    ></iframe>
  );

  // If we are on the main page AND we found the slot, render the iframe inside the slot using a portal
  if (isMainVideoPage && slotElement) {
    return createPortal(iframeContent, slotElement);
  }

  // If we are on the main page but slot isn't found yet, we hide the video temporarily to avoid it jumping
  if (isMainVideoPage && !slotElement) {
    return null;
  }

  // If we are NOT on the main page, render the floating miniplayer
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 shadow-2xl rounded-xl overflow-hidden bg-black ring-1 ring-white/10 group animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="relative w-full aspect-video bg-black">
        {iframeContent}
        
        {/* Overlay controls that appear on hover */}
        <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 pointer-events-none flex flex-col justify-between p-2">
          <div className="flex justify-end gap-2 pointer-events-auto">
             <button 
                onClick={() => router.push(`/video/${activeVideo.id}`)}
                className="p-2 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all hover:scale-105"
                title="Expand"
             >
                <FaExpandAlt size={16} />
             </button>
             <button 
                onClick={closeVideo}
                className="p-2 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all hover:scale-105"
                title="Close Miniplayer"
             >
                <FaTimes size={16} />
             </button>
          </div>
          <div className="pointer-events-auto bg-gradient-to-t from-black/80 to-transparent p-2 -mx-2 -mb-2 mt-auto">
             <p className="text-white text-sm font-medium truncate drop-shadow-md">
               {activeVideo.title}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalVideoPlayer;
