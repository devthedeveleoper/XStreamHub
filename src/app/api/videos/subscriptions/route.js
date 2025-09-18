import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Video from '@/models/Video';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(session.user.id);
        if (!user || !user.subscriptions) {
            return NextResponse.json([]);
        }
        
        const videos = await Video.find({ uploader: { $in: user.subscriptions }, visibility: 'public' })
            .sort({ createdAt: -1 })
            .populate('uploader', 'username avatar');

        return NextResponse.json(videos);

    } catch (error) {
        console.error('Error fetching subscription feed:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}