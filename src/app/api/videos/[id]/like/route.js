import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Video";
import UserActivity from "@/models/UserActivity";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const video = await Video.findById(id);
    if (!video)
      return NextResponse.json({ message: "Video not found" }, { status: 404 });

    if (!video.likes) video.likes = [];

    const userIndex = video.likes.indexOf(user.id);

    if (userIndex === -1) {
      video.likes.push(user.id);
      await UserActivity.updateOne(
        { userId: user.id, videoId: video._id, interactionType: "like" },
        { $set: { updatedAt: new Date() } },
        { upsert: true }
      );
    } else {
      video.likes.splice(userIndex, 1);
      await UserActivity.deleteOne({
        userId: user.id,
        videoId: video._id,
        interactionType: "like",
      });
    }

    await video.save();
    return NextResponse.json({
      likes: video.likes.length,
      isLiked: userIndex === -1,
    });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
