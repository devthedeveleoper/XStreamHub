import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Video from "@/models/Video";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import redis from "@/lib/redis";

export async function GET(request, { params }) {
  try {
    const { identifier } = await params;
    const username = identifier;

    const cacheKey = `profile:${username}`;

    const cachedProfile = await redis.get(cacheKey);

    if (cachedProfile) {
      console.log(`CACHE HIT for key: ${cacheKey}`);
      const profileData = cachedProfile;

      const session = await getServerSession(authOptions);
      const viewingUser = session?.user;
      profileData.user.isSubscribed =
        viewingUser && profileData.user.subscribers
          ? profileData.user.subscribers.includes(viewingUser.id)
          : false;

      return NextResponse.json(profileData);
    }

    console.log(`CACHE MISS for key: ${cacheKey}`);

    await dbConnect();

    const user = await User.findOne({ username: username });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const videos = await Video.find({
      uploader: user._id,
      visibility: "public",
    })
      .sort({ createdAt: -1 })
      .populate("uploader", "username avatar");

    const profileData = {
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        joined: user.createdAt,
        subscriberCount: user.subscribers ? user.subscribers.length : 0,
        subscribers: user.subscribers,
      },
      videos: videos,
    };

    await redis.set(cacheKey, JSON.stringify(profileData), { ex: 900 });

    const session = await getServerSession(authOptions);
    const viewingUser = session?.user;
    profileData.user.isSubscribed =
      viewingUser && user.subscribers
        ? user.subscribers.includes(viewingUser.id)
        : false;

    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error getting user profile:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
