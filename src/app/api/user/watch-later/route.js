import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WatchLater from "@/models/WatchLater";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const videos = await WatchLater.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: "videoId",
        populate: { path: "uploader", select: "username" },
      });

    return NextResponse.json(videos.filter((item) => item.videoId));
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { videoId } = await request.json();

    await WatchLater.findOneAndUpdate(
      { userId: session.user.id, videoId: videoId },
      { userId: session.user.id, videoId: videoId },
      { upsert: true }
    );

    return NextResponse.json({ message: "Added to Watch Later" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const videoId = searchParams.get("videoId");

    await WatchLater.deleteOne({ userId: session.user.id, videoId: videoId });

    return NextResponse.json({ message: "Removed from Watch Later" });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
