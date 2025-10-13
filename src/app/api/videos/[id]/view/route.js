import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Video";
import UserActivity from "@/models/UserActivity";
import WatchHistory from "@/models/WatchHistory";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    await Video.findByIdAndUpdate(id, { $inc: { views: 1 } });

    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (user) {
      await UserActivity.updateOne(
        { userId: user.id, videoId: id, interactionType: "view" },
        { $set: { updatedAt: new Date() } },
        { upsert: true }
      );
    }

    if (user) {
      await WatchHistory.updateOne(
        { userId: user.id, videoId: params.id },
        { $set: { updatedAt: new Date() } },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Could not count view.",
    });
  }
}
