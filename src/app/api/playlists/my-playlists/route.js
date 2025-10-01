import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Playlist from '@/models/Playlist';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const playlists = await Playlist.find({ owner: session.user.id })
            .sort({ updatedAt: -1 }).populate('videos');

        return NextResponse.json(playlists);
    } catch (error) {
        console.error("Error fetching user's playlists:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(request) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { title, isPublic } = await request.json();
        if (!title) {
            return NextResponse.json({ message: 'Title is required' }, { status: 400 });
        }

        const newPlaylist = new Playlist({
            title,
            owner: session.user.id,
            videos: [],
            isPublic: isPublic,
        });
        await newPlaylist.save();
        return NextResponse.json(newPlaylist, { status: 201 });
    } catch (error) {
        console.error("Error creating playlist:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(request) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { playlistId, title, isPublic } = await request.json();
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return NextResponse.json({ message: 'Playlist not found' }, { status: 404 });
        }
        if (playlist.owner.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        if (title) playlist.title = title;
        if (typeof isPublic === 'boolean') playlist.isPublic = isPublic;
        
        await playlist.save();
        return NextResponse.json(playlist);
    } catch (error) {
        console.error("Error updating playlist:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}