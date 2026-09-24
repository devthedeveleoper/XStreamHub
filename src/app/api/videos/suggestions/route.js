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
        const currentVideoId = searchParams.get('exclude');

        const cacheKey = `suggestions:p${page}:exclude:${currentVideoId || 'none'}`;
        
        const cachedSuggestions = await redis.get(cacheKey);
        if (cachedSuggestions) {
            const data = typeof cachedSuggestions === 'string' ? JSON.parse(cachedSuggestions) : cachedSuggestions;
            return NextResponse.json(data);
        }
        
        await dbConnect();

        let currentVideo = null;
        if (currentVideoId && mongoose.Types.ObjectId.isValid(currentVideoId)) {
            currentVideo = await Video.findById(currentVideoId).select("tags category");
        }

        const skip = (page - 1) * limit;

        const pipeline = [];

        // Base match: only public videos, exclude the currently watching video
        const baseMatch = { visibility: 'public' };
        if (currentVideoId && mongoose.Types.ObjectId.isValid(currentVideoId)) {
            baseMatch._id = { $ne: new mongoose.Types.ObjectId(currentVideoId) };
        }
        pipeline.push({ $match: baseMatch });

        // Scoring logic (Context-aware based on current video + views)
        pipeline.push({
            $addFields: {
                score: {
                    $add: [
                        // Current Video Context boost
                        currentVideo && currentVideo.category
                        ? {
                            $cond: [
                                { $eq: ["$category", currentVideo.category] },
                                20,
                                0,
                            ],
                            }
                        : 0,

                        currentVideo && currentVideo.tags
                        ? {
                            $multiply: [
                                {
                                $size: {
                                    $setIntersection: [
                                    { $ifNull: ["$tags", []] },
                                    currentVideo.tags,
                                    ],
                                },
                                },
                                15,
                            ],
                            }
                        : 0,
                    ]
                }
            }
        });

        // Sort by score (descending), then views (descending), then creation date (descending)
        pipeline.push({
            $sort: { score: -1, views: -1, createdAt: -1 }
        });

        // Pagination and populated fields
        const facetPipeline = [
            ...pipeline,
            {
                $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                    $lookup: {
                        from: "users",
                        localField: "uploader",
                        foreignField: "_id",
                        as: "uploaderDetails",
                    },
                    },
                    {
                    $unwind: {
                        path: "$uploaderDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                    },
                    {
                    $addFields: {
                        uploader: {
                        _id: "$uploaderDetails._id",
                        username: "$uploaderDetails.username",
                        avatar: "$uploaderDetails.avatar",
                        },
                    },
                    },
                    {
                    $project: {
                        uploaderDetails: 0,
                    },
                    },
                ],
                },
            },
        ];

        const results = await Video.aggregate(facetPipeline);
        const totalVideos = results[0].metadata[0]?.total || 0;
        const videos = results[0].data;
            
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