"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaCommentDots, FaShare, FaPlay } from 'react-icons/fa';

const ShortPlayer = ({ video }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const { ref, inView } = useInView({
        threshold: 0.6, // Trigger when 60% of the video is in view
    });

    useEffect(() => {
        if (inView) {
            videoRef.current?.play().catch(e => console.log("Autoplay prevented:", e));
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    }, [inView]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play().catch(e => console.log("Play prevented:", e));
                setIsPlaying(true);
            }
        }
    };

    return (
        <div ref={ref} className="relative w-full max-w-[450px] h-[90%] max-h-[800px] bg-black rounded-xl overflow-hidden mx-auto shadow-2xl flex items-center justify-center">
            {/* Video Element */}
            <video
                ref={videoRef}
                src={`/api/videos/stream/${video.fileId}`}
                className="w-full h-full object-cover cursor-pointer"
                loop
                playsInline
                onClick={togglePlay}
            />

            {/* Play Button Overlay (when paused) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
                        <FaPlay className="text-white text-4xl ml-1" />
                    </div>
                </div>
            )}

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                <div className="flex-1 pr-12 text-white">
                    <Link href={`/profile/${video.uploader._id}`} className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30">
                            {video.uploader.avatar ? (
                                <Image src={video.uploader.avatar} alt={video.uploader.username} width={40} height={40} className="object-cover w-full h-full" />
                            ) : (
                                <div className="w-full h-full bg-indigo-600 flex justify-center items-center font-bold">
                                    {video.uploader.username?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <span className="font-bold text-sm">@{video.uploader.username}</span>
                    </Link>
                    <h3 className="font-bold text-base line-clamp-2 mb-1">{video.title}</h3>
                    <p className="text-sm opacity-80 line-clamp-2">{video.description}</p>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="absolute bottom-6 right-4 flex flex-col gap-6 items-center">
                <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="bg-black/40 p-3 rounded-full group-hover:bg-black/60 transition-colors">
                        <FaHeart className="text-white text-2xl group-hover:text-rose-500 transition-colors" />
                    </div>
                    <span className="text-white text-xs font-bold">{video.likesCount || 0}</span>
                </div>
                
                <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="bg-black/40 p-3 rounded-full group-hover:bg-black/60 transition-colors">
                        <FaCommentDots className="text-white text-2xl" />
                    </div>
                    <span className="text-white text-xs font-bold">{video.commentCount || 0}</span>
                </div>

                <div className="flex flex-col items-center gap-1 group cursor-pointer">
                    <div className="bg-black/40 p-3 rounded-full group-hover:bg-black/60 transition-colors">
                        <FaShare className="text-white text-2xl" />
                    </div>
                    <span className="text-white text-xs font-bold">Share</span>
                </div>
            </div>
        </div>
    );
};

export default ShortPlayer;
