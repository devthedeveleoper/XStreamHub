import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Video from '@/models/Video';
import { buildVideoAggregation } from '@/lib/videoUtils';
import redis from '@/lib/redis';

export async function GET(request) {
    try {
        const { searchParams } = request.nextUrl;
        const sortOption = searchParams.get('sort') || 'date_desc';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '12');
        const category = searchParams.get('category');

        const cacheKey = `videos:${category || 'all'}:${sortOption}:p${page}`;

        const cachedData = await redis.get(cacheKey);

        if (cachedData) {
            console.log(`CACHE HIT for key: ${cacheKey}`);
            return NextResponse.json(cachedData);
        }

        console.log(`CACHE MISS for key: ${cacheKey}`);
        
        await dbConnect();
        
        const skip = (page - 1) * limit;
        const sortCriteria = {
            'date_desc': { createdAt: -1 },
            'views_desc': { views: -1 },
            'likes_desc': { likesCount: -1 },
            'comments_desc': { commentCount: -1 }
        }[sortOption] || { createdAt: -1 };

        const filter = { visibility: 'public' };
        if (category && category !== "All") {
            filter.category = category;
        }

        const totalVideos = await Video.countDocuments(filter);
        const aggregation = buildVideoAggregation(filter, sortCriteria);
        aggregation.push({ $skip: skip });
        aggregation.push({ $limit: limit });

        const videos = await Video.aggregate(aggregation);

        const responseData = {
            videos,
            currentPage: page,
            totalPages: Math.ceil(totalVideos / limit),
        };

        await redis.set(cacheKey, JSON.stringify(responseData), { ex: 300 });

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error fetching videos:', error);
        return NextResponse.json({ message: 'Failed to fetch videos' }, { status: 500 });
    }
}