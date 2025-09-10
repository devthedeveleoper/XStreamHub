import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Comment from '@/models/Comment';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request, { params }) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const comment = await Comment.findById(id);
        if (!comment) {
            return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }

        if (comment.author.toString() !== session.user.id) {
            return NextResponse.json({ message: 'User not authorized' }, { status: 403 });
        }

        const { text } = await request.json();
        if (!text) {
            return NextResponse.json({ message: 'Text is required' }, { status: 400 });
        }

        comment.text = text;
        await comment.save();
        
        const populatedComment = await Comment.findById(comment._id).populate('author', 'username');
        return NextResponse.json(populatedComment);
    } catch (error) {
        console.error("Error updating comment:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    await dbConnect();
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const comment = await Comment.findById(id);
        if (!comment) {
            return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }
        
        if (comment.author.toString() !== session.user.id) {
            return NextResponse.json({ message: 'User not authorized' }, { status: 403 });
        }

        await Comment.deleteMany({ $or: [{ _id: id }, { parentComment: id }] });

        return NextResponse.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error("Error deleting comment:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}