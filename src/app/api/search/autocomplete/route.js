import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Video from '@/models/Video';
import User from '@/models/User';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ videos: [], users: [] });
    }

    await dbConnect();

    // Use a case-insensitive regex for the search query
    const regex = new RegExp(query, 'i');

    // Fetch up to 4 matching public videos
    const videoPromise = Video.find({
      visibility: 'public',
      title: { $regex: regex }
    })
      .select('_id title thumbnailUrl')
      .limit(4)
      .lean();

    // Fetch up to 2 matching users
    const userPromise = User.find({
      $or: [
        { username: { $regex: regex } },
        { name: { $regex: regex } }
      ]
    })
      .select('username name image')
      .limit(2)
      .lean();

    const [videos, users] = await Promise.all([videoPromise, userPromise]);

    return NextResponse.json({ videos, users });
  } catch (error) {
    console.error('Autocomplete Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
