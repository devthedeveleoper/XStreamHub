import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Notification from '@/models/Notification';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'username')
            .populate('video', 'title')
            .sort({ createdAt: -1 })
            .limit(20);
        
        const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Error fetching notifications:", error);
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
        
        const userId = session.user.id;

        await Notification.updateMany({ recipient: userId, isRead: false }, { $set: { isRead: true } });

        return NextResponse.json({ message: 'Notifications marked as read' });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}