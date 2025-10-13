import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Video";
import Notification from "@/models/Notification";
import UserActivity from "@/models/UserActivity";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";

export async function POST(request, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }

    if (!video.likes) video.likes = [];

    const userIndex = video.likes.indexOf(user.id);

    if (userIndex === -1) {
      // User is liking the video
      video.likes.push(user.id);
      await UserActivity.updateOne(
        { userId: user.id, videoId: video._id, interactionType: "like" },
        { $set: { updatedAt: new Date() } },
        { upsert: true }
      );

      // Create a notification if it's not the user's own video
      if (video.uploader.toString() !== user.id) {
        const notification = await new Notification({
          recipient: video.uploader,
          sender: user.id,
          type: "like",
          video: video._id,
        }).save();

        const populatedNotif = await Notification.findById(notification._id)
          .populate("sender", "username avatar")
          .populate("video", "title");

        // Trigger the real-time notification via your Express server
        axios
          .post(`${process.env.NOTIFICATION_SERVER_URL}/api/notify`, {
            recipientId: video.uploader.toString(),
            notification: populatedNotif,
          })
          .catch((err) =>
            console.error(
              "Failed to trigger real-time notification:",
              err.message
            )
          );
      }
    } else {
      // User is unliking the video
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
    console.error("Error toggling like:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
