import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import WatchHistory from "@/models/WatchHistory";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const history = await WatchHistory.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .populate({
        path: "videoId",
        populate: { path: "uploader", select: "username" },
      });

    const validHistory = history.filter((item) => item.videoId);

    return NextResponse.json(validHistory);
  } catch (error) {
    console.error("Error fetching watch history:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const videoId = searchParams.get("videoId");

    if (videoId) {
      await WatchHistory.deleteOne({
        userId: session.user.id,
        videoId: videoId,
      });
      return NextResponse.json({ message: "Video removed from history" });
    } else {
      await WatchHistory.deleteMany({ userId: session.user.id });
      return NextResponse.json({ message: "Watch history cleared" });
    }
  } catch (error) {
    console.error("Error managing watch history:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}