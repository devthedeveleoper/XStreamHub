import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserActivity from "@/models/UserActivity";
import Video from "@/models/Video";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import redis from "@/lib/redis";
import mongoose from "mongoose";

export async function GET(request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ videos: [], currentPage: 1, totalPages: 1 });
    }

    const { searchParams } = request.nextUrl;
    const currentVideoId = searchParams.get("exclude");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const cacheKey = `recommendations:${session.user.id}:p${page}:exclude:${
      currentVideoId || "none"
    }`;
    const cachedRecs = await redis.get(cacheKey);
    if (cachedRecs) {
      const data = typeof cachedRecs === 'string' ? JSON.parse(cachedRecs) : cachedRecs;
      return NextResponse.json(data);
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ videos: [], currentPage: 1, totalPages: 1 });
    }

    // Extract interacting history
    const interactedVideoIds = await UserActivity.find({
      userId: user._id,
    }).distinct("videoId");
    const interactedVideos = await Video.find({
      _id: { $in: interactedVideoIds },
    }).select("tags category");

    const tagScores = {};
    const categoryScores = {};
    interactedVideos.forEach((video) => {
      if (video.category) {
        categoryScores[video.category] =
          (categoryScores[video.category] || 0) + 1;
      }
      if (video.tags) {
        video.tags.forEach((tag) => {
          tagScores[tag] = (tagScores[tag] || 0) + 1;
        });
      }
    });

    const favoriteTags = Object.keys(tagScores)
      .sort((a, b) => tagScores[b] - tagScores[a])
      .slice(0, 5);
    const favoriteCategories = Object.keys(categoryScores)
      .sort((a, b) => categoryScores[b] - categoryScores[a])
      .slice(0, 3);

    let currentVideo = null;
    if (currentVideoId && mongoose.Types.ObjectId.isValid(currentVideoId)) {
      currentVideo = await Video.findById(currentVideoId).select(
        "tags category"
      );
    }

    const pipeline = [];

    // Base match: only public videos, exclude the currently watching video completely
    const baseMatch = { visibility: "public" };
    if (currentVideoId && mongoose.Types.ObjectId.isValid(currentVideoId)) {
      baseMatch._id = { $ne: new mongoose.Types.ObjectId(currentVideoId) };
    }
    pipeline.push({ $match: baseMatch });

    // Scoring logic
    pipeline.push({
      $addFields: {
        score: {
          $add: [
            // Subscriptions boost
            {
              $cond: [
                {
                  $in: [
                    "$uploader",
                    user.subscriptions.map(
                      (id) => new mongoose.Types.ObjectId(id)
                    ),
                  ],
                },
                50,
                0,
              ],
            },

            // Favorite Categories boost
            {
              $cond: [{ $in: ["$category", favoriteCategories] }, 30, 0],
            },

            // Favorite Tags boost (10 per matched tag)
            {
              $multiply: [
                {
                  $size: {
                    $setIntersection: [{ $ifNull: ["$tags", []] }, favoriteTags],
                  },
                },
                10,
              ],
            },

            // Current Video Context boost
            currentVideo && currentVideo.category
              ? {
                  $cond: [
                    { $eq: ["$category", currentVideo.category] },
                    20,
                    0,
                  ],
                }
              : 0,

            currentVideo && currentVideo.tags
              ? {
                  $multiply: [
                    {
                      $size: {
                        $setIntersection: [
                          { $ifNull: ["$tags", []] },
                          currentVideo.tags,
                        ],
                      },
                    },
                    15,
                  ],
                }
              : 0,

            // Penalty for already watched videos (-40)
            {
              $cond: [
                {
                  $in: [
                    "$_id",
                    interactedVideoIds.map(
                      (id) => new mongoose.Types.ObjectId(id)
                    ),
                  ],
                },
                -40,
                0,
              ],
            },
          ],
        },
      },
    });

    // Sort by score (descending), then views (descending), then creation date (descending)
    pipeline.push({
      $sort: { score: -1, views: -1, createdAt: -1 },
    });

    // Calculate total count (we use a $facet for count and pagination)
    const facetPipeline = [
      ...pipeline,
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            // Lookup uploader to populate username and avatar
            {
              $lookup: {
                from: "users",
                localField: "uploader",
                foreignField: "_id",
                as: "uploaderDetails",
              },
            },
            {
              $unwind: {
                path: "$uploaderDetails",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                uploader: {
                  _id: "$uploaderDetails._id",
                  username: "$uploaderDetails.username",
                  avatar: "$uploaderDetails.avatar",
                },
              },
            },
            {
              $project: {
                uploaderDetails: 0,
              },
            },
          ],
        },
      },
    ];

    const results = await Video.aggregate(facetPipeline);
    const totalVideos = results[0].metadata[0]?.total || 0;
    const videos = results[0].data;

    const responseData = {
      videos,
      currentPage: page,
      totalPages: Math.ceil(totalVideos / limit),
    };

    // Cache the result for 5 minutes
    await redis.set(cacheKey, JSON.stringify(responseData), { ex: 300 });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
