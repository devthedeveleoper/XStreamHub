"use client";

import React, { useState, useEffect } from 'react';
import API from '@/lib/api';
import Image from 'next/image';

const FALLBACK_IMAGE_URL = 'https://iili.io/Ku93A2n.png';

const VideoThumbnail = ({ videoId, altText }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchThumbnail = async () => {
            if (!videoId) {
                if (isMounted) {
                    setImageUrl(FALLBACK_IMAGE_URL);
                    setIsLoading(false);
                }
                return;
            }
            try {
                const response = await API.get(`/videos/${videoId}/thumbnail`);
                if (isMounted) {
                    setImageUrl(response.data.thumbnailUrl);
                }

            } catch (error) {
                console.error(`Could not fetch thumbnail for ${videoId}, using fallback.`);
                if (isMounted) {
                    setImageUrl(FALLBACK_IMAGE_URL);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchThumbnail();

        return () => {
            isMounted = false;
        };
    }, [videoId]);

    if (isLoading) {
        return <div className="w-full h-full bg-gray-300 animate-pulse rounded-lg"></div>;
    }

    return (
        <Image
            src={imageUrl || FALLBACK_IMAGE_URL}
            alt={altText}
            width={500}
            height={300}
            onError={() => setImageUrl(FALLBACK_IMAGE_URL)}
            className="w-full h-full object-cover rounded-lg"
        />
    );
};

export default VideoThumbnail;