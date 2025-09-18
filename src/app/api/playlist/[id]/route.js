import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Playlist from '@/models/Playlist';
import mongoose from 'mongoose';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, { params }) {
    await dbConnect();
    try {
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid Playlist ID' }, { status: 400 });
        }

        const playlist = await Playlist.findById(id).populate({
            path: 'videos',
            match: { visibility: { $in: ['public', 'unlisted'] } },
            populate: {
                path: 'uploader',
                select: 'username'
            }
        });

        if (playlist) {
            playlist.videos = playlist.videos.filter(video => video !== null);
        }

        if (!playlist) {
            return NextResponse.json({ message: 'Playlist not found' }, { status: 404 });
        }

        const session = await getServerSession(authOptions);
        if (!playlist.isPublic && playlist.owner.toString() !== session?.user?.id) {
            return NextResponse.json({ message: 'This playlist is private' }, { status: 403 });
        }
        
        return NextResponse.json(playlist);
    } catch (error) {
        console.error('Error fetching playlist:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const playlist = await Playlist.findById(params.id);
        if (!playlist) {
            return NextResponse.json({ message: 'Playlist not found' }, { status: 404 });
        }
        
        if (playlist.owner.toString() !== session.user.id) {
            return NextResponse.json({ message: 'User not authorized to delete this playlist' }, { status: 403 });
        }

        await Playlist.deleteOne({ _id: params.id });

        return NextResponse.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        console.error("Error deleting playlist:", error);
        return NextResponse.json({ message: 'Server error while deleting playlist' }, { status: 500 });
    }
}