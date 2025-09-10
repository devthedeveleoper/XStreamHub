import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Video from '@/models/Video';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, { params }) {
    await dbConnect();
    try {
        const { identifier } = await params;
        const username = identifier;
        const user = await User.findOne({ username: username });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const videos = await Video.find({ uploader: user._id })
            .sort({ createdAt: -1 })
            .populate('uploader', 'username avatar');

        const session = await getServerSession(authOptions);
        const viewingUser = session?.user;
        
        const isSubscribed = viewingUser && user.subscribers ? user.subscribers.includes(viewingUser.id) : false;

        return NextResponse.json({
            user: {
                id: user._id,
                username: user.username,
                joined: user.createdAt,
                subscriberCount: user.subscribers ? user.subscribers.length : 0,
                isSubscribed: isSubscribed,
            },
            videos: videos
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}