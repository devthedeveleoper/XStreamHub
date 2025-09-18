import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Video from '@/models/Video';
import { buildVideoAggregation } from '@/lib/videoUtils';
import redis from '@/lib/redis';

export async function GET(request) {
    await dbConnect();
    try {
        const { searchParams } = request.nextUrl;
        const searchQuery = searchParams.get('q');
        const sortOption = searchParams.get('sort') || 'relevance';

        if (!searchQuery) {
            return NextResponse.json([]);
        }

        const cacheKey = `search:${searchQuery}:${sortOption}`;

        const cachedResults = await redis.get(cacheKey);
        if (cachedResults) {
            console.log(`CACHE HIT for key: ${cacheKey}`);
            return NextResponse.json(cachedResults);
        }

        console.log(`CACHE MISS for key: ${cacheKey}`);

        await dbConnect();

        const searchFilter = { 
            $text: { $search: searchQuery },
            visibility: 'public'
        };

        let sortCriteria;
        if (sortOption === 'relevance') {
            sortCriteria = { score: { $meta: 'textScore' } };
        } else {
            sortCriteria = {
                'date_desc': { createdAt: -1 },
                'views_desc': { views: -1 },
                'likes_desc': { likesCount: -1 },
                'comments_desc': { commentCount: -1 }
            }[sortOption] || { createdAt: -1 };
        }
        
        const aggregation = buildVideoAggregation(searchFilter, sortCriteria);
        
        if (sortOption === 'relevance') {
            const projectStage = aggregation.find(stage => stage.$project);
            if (projectStage) {
                projectStage.$project.score = { $meta: 'textScore' };
            }
        }
        
        const videos = await Video.aggregate(aggregation);

        await redis.set(cacheKey, JSON.stringify(videos), { ex: 600 });

        return NextResponse.json(videos);

    } catch (error) {
        console.error('Error searching videos:', error);
        return NextResponse.json({ message: 'Server error during search.' }, { status: 500 });
    }
}