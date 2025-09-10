import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Comment from '@/models/Comment';

export async function GET(request, { params }) {
    await dbConnect();
    try {
        const { id } = await params;

        const replies = await Comment.find({ parentComment: id })
            .populate('author', 'username avatar')
            .sort({ createdAt: 'asc' });

        return NextResponse.json(replies);

    } catch (error) {
        console.error("Error fetching replies:", error);
        return NextResponse.json({ message: 'Server error while fetching replies' }, { status: 500 });
    }
}