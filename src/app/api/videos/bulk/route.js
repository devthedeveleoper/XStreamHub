import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Video from '@/models/Video';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from 'mongoose';

// Bulk Update Visibility
export async function PUT(request) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { videoIds, visibility } = body;

        if (!Array.isArray(videoIds) || videoIds.length === 0) {
            return NextResponse.json({ message: 'No video IDs provided' }, { status: 400 });
        }

        if (!['public', 'unlisted', 'private'].includes(visibility)) {
            return NextResponse.json({ message: 'Invalid visibility state' }, { status: 400 });
        }

        // Validate ObjectIds
        const validIds = videoIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length === 0) {
            return NextResponse.json({ message: 'No valid video IDs provided' }, { status: 400 });
        }

        // Ensure user only updates their own videos
        const result = await Video.updateMany(
            { _id: { $in: validIds }, uploader: session.user.id },
            { $set: { visibility } }
        );

        return NextResponse.json({ 
            message: 'Bulk visibility update successful', 
            modifiedCount: result.modifiedCount 
        });

    } catch (error) {
        console.error('Error in bulk update API:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Bulk Delete
export async function DELETE(request) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { videoIds } = body;

        if (!Array.isArray(videoIds) || videoIds.length === 0) {
            return NextResponse.json({ message: 'No video IDs provided' }, { status: 400 });
        }

        // Validate ObjectIds
        const validIds = videoIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length === 0) {
            return NextResponse.json({ message: 'No valid video IDs provided' }, { status: 400 });
        }

        // Ensure user only deletes their own videos
        const result = await Video.deleteMany(
            { _id: { $in: validIds }, uploader: session.user.id }
        );

        return NextResponse.json({ 
            message: 'Bulk deletion successful', 
            deletedCount: result.deletedCount 
        });

    } catch (error) {
        console.error('Error in bulk delete API:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
