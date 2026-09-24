import React from 'react';
import Video from '@/models/Video';
import dbConnect from '@/lib/dbConnect';
import VideoPlayerPageClient from './VideoPlayerPageClient';

export async function generateMetadata({ params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const video = await Video.findById(id);
    if (!video) {
      return {
        title: 'Video Not Found',
        description: 'This video could not be found.',
      };
    }
    return {
      title: `${video.title} - Aurahub`,
      description: video.description,
      keywords: video.tags.join(', '),
      openGraph: {
        title: video.title,
        description: video.description,
        images: [
          {
            url: video.thumbnailUrl,
            width: 1200,
            height: 630,
          },
        ],
      },
    };
  } catch (error) {
    return {
      title: 'Server Error',
      description: 'An error occurred while fetching video data.',
    };
  }
}

const VideoPlayerPage = async ({ params }) => {
  await params; // params is a Promise in Next.js 15+; client uses useParams() directly
  return <VideoPlayerPageClient />;
};

export default VideoPlayerPage;