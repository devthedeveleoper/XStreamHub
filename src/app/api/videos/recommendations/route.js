import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserActivity from "@/models/UserActivity";
import Video from "@/models/Video";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json([]);

    const { searchParams } = request.nextUrl;
    const currentVideoId = searchParams.get("exclude");
    const limit = 10;

    const user = await User.findById(session.user.id);
    const interactedVideoIds = (
      await UserActivity.find({ userId: user._id }).distinct("videoId")
    ).map((id) => id.toString());
    const excludedIds = [...interactedVideoIds, currentVideoId];

    let recommendations = await Video.find({
      _id: { $nin: excludedIds },
      uploader: { $in: user.subscriptions },
      visibility: "public",
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("uploader", "username avatar");

    if (recommendations.length < limit) {
      const remainingLimit = limit - recommendations.length;
      const interactedVideos = await Video.find({
        _id: { $in: interactedVideoIds },
      }).select("tags category");

      if (interactedVideos.length > 0) {
        const tagScores = {};
        const categoryScores = {};
        interactedVideos.forEach((video) => {
          if (video.category)
            categoryScores[video.category] =
              (categoryScores[video.category] || 0) + 1;
          video.tags.forEach(
            (tag) => (tagScores[tag] = (tagScores[tag] || 0) + 1)
          );
        });

        const favoriteTags = Object.keys(tagScores)
          .sort((a, b) => tagScores[b] - tagScores[a])
          .slice(0, 5);
        const favoriteCategories = Object.keys(categoryScores)
          .sort((a, b) => categoryScores[b] - categoryScores[a])
          .slice(0, 3);

        const contentBasedRecs = await Video.find({
          _id: { $nin: [...excludedIds, ...recommendations.map((r) => r._id)] },
          visibility: "public",
          $or: [
            { tags: { $in: favoriteTags } },
            { category: { $in: favoriteCategories } },
          ],
        })
          .sort({ views: -1 })
          .limit(remainingLimit)
          .populate("uploader", "username avatar");

        recommendations = [...recommendations, ...contentBasedRecs];
      }
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
