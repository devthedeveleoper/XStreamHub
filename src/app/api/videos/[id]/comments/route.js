import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Comment from '@/models/Comment';
import Video from '@/models/Video';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, { params }) {
    await dbConnect();
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid video ID format.' }, { status: 400 });
        }

        const comments = await Comment.find({ video: id, parentComment: null })
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 });
            
        return NextResponse.json(comments);
    } catch (error) {
        console.error("ERROR FETCHING COMMENTS:", error); 
        return NextResponse.json({ message: 'Server error while fetching comments' }, { status: 500 });
    }
}

export async function POST(request, { params }) {
    await dbConnect();
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid video ID format.' }, { status: 400 });
        }
        
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const user = session.user;

        const video = await Video.findById(id);
        if (!video) {
            return NextResponse.json({ message: 'Video not found' }, { status: 404 });
        }

        const { text, parentCommentId } = await request.json(); 

        if (!text || text.trim() === '') {
            return NextResponse.json({ message: 'Comment text is required.' }, { status: 400 });
        }

        const newComment = new Comment({
            text,
            author: user.id,
            video: id,
            parentComment: parentCommentId || null,
        });

        await newComment.save();
        
        if (video.uploader.toString() !== user.id) {
            await new Notification({
                recipient: video.uploader,
                sender: user.id,
                type: parentCommentId ? 'reply' : 'comment',
                video: video._id,
                comment: newComment._id
            }).save();
        }

        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (parentComment && parentComment.author.toString() !== user.id && parentComment.author.toString() !== video.uploader.toString()) {
                 await new Notification({
                    recipient: parentComment.author,
                    sender: user.id,
                    type: 'reply',
                    video: video._id,
                    comment: newComment._id
                }).save();
            }
        }
        
        const populatedComment = await Comment.findById(newComment._id).populate('author', 'username');
        return NextResponse.json(populatedComment, { status: 201 });

    } catch (error) {
        console.error("ERROR POSTING COMMENT:", error);
        return NextResponse.json({ message: 'Server error while posting comment' }, { status: 500 });
    }
}