import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Video from '@/models/Video';
import Playlist from '@/models/Playlist';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from 'axios';
import FormData from 'form-data';

const FREEIMAGE_API_URL = "https://freeimage.host/api/1/upload";

export async function POST(request) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const title = formData.get("title");
        const description = formData.get("description");
        const videoId = formData.get("videoId");
        const thumbnailFile = formData.get("thumbnailFile");
        const category = formData.get('category');
        const tagsString = formData.get('tags');
        const visibility = formData.get('visibility');
        const playlistId = formData.get('playlistId');

        if (!title || !description || !videoId) {
            return NextResponse.json({ message: "Title, description, and videoId are required." }, { status: 400 });
        }

        const tags = tagsString ? JSON.parse(tagsString) : [];

        const videoData = {
            title,
            description,
            fileId: videoId,
            uploader: session.user.id,
            category: category,
            tags: tags,
            visibility: visibility,
        };

        if (thumbnailFile) {
            try {
                const bytes = await thumbnailFile.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const imageAsBase64 = buffer.toString("base64");

                const freeimageFormData = new FormData();
                freeimageFormData.append("key", process.env.FREEIMAGE_API_KEY);
                freeimageFormData.append("source", imageAsBase64);
                freeimageFormData.append("action", "upload");

                const freeimageRes = await axios.post(
                    FREEIMAGE_API_URL,
                    freeimageFormData
                );

                if (freeimageRes.data.status_code === 200) {
                    videoData.thumbnailUrl = freeimageRes.data.image.url;
                }
            } catch (uploadError) {
                console.error("Freeimage.host upload failed:", uploadError);
            }
        }

        const newVideo = new Video(videoData);
        await newVideo.save();

        if (playlistId) {
            await Playlist.updateOne(
                { _id: playlistId, owner: session.user.id },
                { $push: { videos: newVideo._id } }
            );
        }

        return NextResponse.json(
            { message: "Video published successfully!", video: newVideo },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating video record:", error);
        return NextResponse.json(
            { message: "Failed to create video record" },
            { status: 500 }
        );
    }
}