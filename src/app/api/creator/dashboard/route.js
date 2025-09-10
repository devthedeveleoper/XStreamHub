import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Video from '@/models/Video';
import { buildVideoAggregation } from '@/lib/videoUtils';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = request.nextUrl;
        const searchQuery = searchParams.get('q');
        
        const uploaderId = new mongoose.Types.ObjectId(session.user.id);
        const filter = { uploader: uploaderId };

        if (searchQuery) {
            filter.$text = { $search: searchQuery };
        }
        
        const aggregation = buildVideoAggregation(filter, { createdAt: -1 });
        const videos = await Video.aggregate(aggregation);

        return NextResponse.json(videos);
    } catch (error) {
        console.error('Error fetching creator videos:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}