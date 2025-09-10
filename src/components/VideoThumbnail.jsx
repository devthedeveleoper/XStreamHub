import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";

const FALLBACK_IMAGE_URL = "https://i.ibb.co/hRHpLpv3/luffy-crying.gif";

const VideoThumbnail = ({ fileId, customThumbnailUrl, altText }) => {
  const [imageUrl, setImageUrl] = useState(
    customThumbnailUrl || FALLBACK_IMAGE_URL
  );
  const [isLoading, setIsLoading] = useState(!customThumbnailUrl);

  useEffect(() => {
    if (customThumbnailUrl) {
      setImageUrl(customThumbnailUrl);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchThumbnail = async () => {
      try {
        const response = await axios.get(
          `https://api.aurahub.fun/fs/files/thumbnail/${fileId}`
        );
        if (isMounted && response.data?.thumbnail_url) {
          setImageUrl(response.data.thumbnail_url);
        } else if (isMounted) {
          setImageUrl(FALLBACK_IMAGE_URL);
        }
      } catch (error) {
        console.log(
          `Could not fetch thumbnail for ${fileId}, using fallback.`
        );
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
  }, [fileId, customThumbnailUrl]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-300 animate-pulse rounded-lg"></div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={altText}
      width={500}
      height={300}
      onError={() => setImageUrl(FALLBACK_IMAGE_URL)}
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-lg"
    />
  );
};

export default VideoThumbnail;
