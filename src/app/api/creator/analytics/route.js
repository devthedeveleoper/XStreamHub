import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Video from '@/models/Video';
import User from '@/models/User';
import UserActivity from '@/models/UserActivity';
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

        const uploaderId = new mongoose.Types.ObjectId(session.user.id);
        
        // Fetch creator's lifetime stats
        const user = await User.findById(uploaderId).select('subscribersCount');
        const subscribersCount = user?.subscribersCount || 0;

        // Fetch all videos owned by the creator to get lifetime views/likes and their IDs
        const videos = await Video.find({ uploader: uploaderId }).select('_id views likesCount commentCount');
        
        const videoIds = videos.map(v => v._id);
        
        const lifetimeStats = videos.reduce((acc, v) => {
            acc.views += v.views || 0;
            acc.likes += v.likesCount || 0;
            acc.comments += v.commentCount || 0;
            return acc;
        }, { views: 0, likes: 0, comments: 0 });

        // Build 30-day time-series array
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        // Aggregate UserActivity for these videos
        const activities = await UserActivity.aggregate([
            {
                $match: {
                    videoId: { $in: videoIds },
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        type: "$interactionType"
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Process the aggregation into a complete time-series array (filling empty days with 0)
        const timeSeries = [];
        for (let i = 0; i < 30; i++) {
            const d = new Date(thirtyDaysAgo);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            
            // Format for display (e.g., "Jul 01")
            const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            const dayData = {
                date: displayDate,
                views: 0,
                likes: 0
            };

            // Find views/likes for this exact date string
            activities.forEach(a => {
                if (a._id.date === dateStr) {
                    if (a._id.type === 'view') dayData.views = a.count;
                    if (a._id.type === 'like') dayData.likes = a.count;
                }
            });

            timeSeries.push(dayData);
        }

        return NextResponse.json({
            lifetimeStats: {
                ...lifetimeStats,
                subscribers: subscribersCount
            },
            timeSeries
        });

    } catch (error) {
        console.error('Error fetching creator analytics:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
