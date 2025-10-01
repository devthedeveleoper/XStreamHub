import axios from 'axios';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Video from '@/models/Video';
import Comment from '@/models/Comment';
import { buildVideoAggregation } from '@/lib/videoUtils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import redis from '@/lib/redis';

const AURA_API_BASE_URL = "https://api.aurahub.fun";

export async function GET(request, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid video ID format." }, { status: 400 });
    }

    const cacheKey = `video:${id}`;

    const cachedVideo = await redis.get(cacheKey);
    if (cachedVideo) {
      console.log(`CACHE HIT for key: ${cacheKey}`);
      const videoObject = cachedVideo;
      const session = await getServerSession(authOptions);
      const user = session?.user;
      if (user && videoObject.likes) {
        videoObject.isLiked = videoObject.likes.map(likeId => likeId.toString()).includes(user.id);
      } else {
        videoObject.isLiked = false;
      }
      return NextResponse.json(videoObject);
    }
    
    console.log(`CACHE MISS for key: ${cacheKey}`);

    await dbConnect();

    const video = await Video.findById(id);
    if (!video) {
        return NextResponse.json({ message: 'Video not found' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (video.visibility === 'private' && video.uploader.toString() !== user?.id) {
        return NextResponse.json({ message: 'This video is private' }, { status: 403 });
    }

    const videoId = new mongoose.Types.ObjectId(id);
    const aggregation = buildVideoAggregation({ _id: videoId });
    const results = await Video.aggregate(aggregation);
    const videoObject = results[0];

    await redis.set(cacheKey, JSON.stringify(videoObject), { ex: 3600 });

    if (user && videoObject.likes) {
      videoObject.isLiked = videoObject.likes.map((likeId) => likeId.toString()).includes(user.id);
    } else {
      videoObject.isLiked = false;
    }
    
    return NextResponse.json(videoObject);
  } catch (error) {
    console.error("Error fetching video by ID:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    if (video.uploader.toString() !== user.id) {
      return NextResponse.json({ message: "User not authorized to edit this video" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, visibility } = body;
    if (title) video.title = title;
    if (description) video.description = description;
    if (visibility) video.visibility = visibility;
    const updatedVideo = await video.save();
    return NextResponse.json(updatedVideo);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json({ message: "Server error while updating video" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user;
        if (!user) {
          return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const video = await Video.findById(id);
        if (!video) {
          return NextResponse.json({ message: 'Video not found' }, { status: 404 });
        }
        
        if (video.uploader.toString() !== user.id) {
            return NextResponse.json({ message: 'User not authorized to delete this video' }, { status: 403 });
        }

        try {
            await axios.delete(`${AURA_API_BASE_URL}/fs/files/delete/${video.fileId}`);
            console.log(`Successfully deleted file ${video.fileId} from AuraHub.`);
        } catch (auraError) {
            console.error(`Failed to delete file ${video.fileId} from AuraHub:`, auraError.message);
        }

        await Video.deleteOne({ _id: id });
        await Comment.deleteMany({ video: id });

        return NextResponse.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error("Error deleting video:", error);
        return NextResponse.json({ message: 'Server error while deleting video' }, { status: 500 });
    }
}