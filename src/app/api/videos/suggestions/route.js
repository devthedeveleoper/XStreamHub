import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Video from '@/models/Video';
import mongoose from 'mongoose';
import redis from '@/lib/redis';

export async function GET(request) {
    try {
        const { searchParams } = request.nextUrl;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const excludeId = searchParams.get('exclude');

        const cacheKey = `suggestions:p${page}:exclude:${excludeId || 'none'}`;
        
        const cachedSuggestions = await redis.get(cacheKey);
        if (cachedSuggestions) {
            console.log(`CACHE HIT for key: ${cacheKey}`);
            return NextResponse.json(cachedSuggestions);
        }

        console.log(`CACHE MISS for key: ${cacheKey}`);
        
        await dbConnect();
        
        const skip = (page - 1) * limit;
        const filter = { visibility: 'public' };
        if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
            filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
        }

        const totalVideos = await Video.countDocuments(filter);
        const videos = await Video.find(filter)
            .sort({ createdAt: -1 })
            .populate('uploader', 'username')
            .limit(limit)
            .skip(skip);
            
        const responseData = {
            videos,
            currentPage: page,
            totalPages: Math.ceil(totalVideos / limit),
        };

        await redis.set(cacheKey, JSON.stringify(responseData), { ex: 600 });
            
        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json({ message: 'Failed to fetch suggestions' }, { status: 500 });
    }
}