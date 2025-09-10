import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Video from '@/models/Video';
import Comment from '@/models/Comment';
import { buildVideoAggregation } from '@/lib/videoUtils';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from 'axios';

const AURA_API_BASE_URL = "https://api.aurahub.fun";

export async function GET(request, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid video ID format." }, { status: 400 });
    }

    const videoId = new mongoose.Types.ObjectId(id);
    const aggregation = buildVideoAggregation({ _id: videoId });
    const results = await Video.aggregate(aggregation);

    if (!results || results.length === 0) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    const videoObject = results[0];
    
    const session = await getServerSession(authOptions);
    const user = session?.user;

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

    const { id } = params;
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    if (video.uploader.toString() !== user.id) {
      return NextResponse.json({ message: "User not authorized to edit this video" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description } = body;
    video.title = title || video.title;
    video.description = description || video.description;
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

        const video = await Video.findById(params.id);
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

        await Video.deleteOne({ _id: params.id });
        await Comment.deleteMany({ video: params.id });

        return NextResponse.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error("Error deleting video:", error);
        return NextResponse.json({ message: 'Server error while deleting video' }, { status: 500 });
    }
}