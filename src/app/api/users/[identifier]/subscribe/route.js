import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request, { params }) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { identifier } = await params;
        const targetUserId = identifier;
        const currentUserId = session.user.id;

        if (targetUserId === currentUserId) {
            return NextResponse.json({ message: 'You cannot subscribe to yourself' }, { status: 400 });
        }

        const targetUser = await User.findById(targetUserId);
        const user = await User.findById(currentUserId);

        if (!targetUser || !user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (!user.subscriptions) user.subscriptions = [];
        
        const isSubscribed = user.subscriptions.includes(targetUserId);

        if (isSubscribed) {
            await User.updateOne({ _id: currentUserId }, { $pull: { subscriptions: targetUserId } });
            await User.updateOne({ _id: targetUserId }, { $pull: { subscribers: currentUserId } });
        } else {
            await User.updateOne({ _id: currentUserId }, { $push: { subscriptions: targetUserId } });
            await User.updateOne({ _id: targetUserId }, { $push: { subscribers: currentUserId } });
        }
        
        const updatedTargetUser = await User.findById(targetUserId);
        
        return NextResponse.json({
            isSubscribed: !isSubscribed,
            subscriberCount: updatedTargetUser.subscribers ? updatedTargetUser.subscribers.length : 0,
        });

    } catch (error) {
        console.error("Subscription error:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}