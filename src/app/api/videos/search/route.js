import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Video";
import { buildVideoAggregation } from "@/lib/videoUtils";

export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = request.nextUrl;
    const searchQuery = searchParams.get("q");
    const sortOption = searchParams.get("sort") || "relevance";

    if (!searchQuery) {
      return NextResponse.json([]);
    }

    const searchFilter = { $text: { $search: searchQuery } };

    let sortCriteria;
    if (sortOption === "relevance") {
      sortCriteria = { score: { $meta: "textScore" } };
    } else {
      sortCriteria = {
        date_desc: { createdAt: -1 },
        views_desc: { views: -1 },
        likes_desc: { likesCount: -1 },
        comments_desc: { commentCount: -1 },
      }[sortOption] || { createdAt: -1 };
    }

    const aggregation = buildVideoAggregation(searchFilter, sortCriteria);

    if (sortOption === "relevance") {
      aggregation[aggregation.length - 1].$project.score = {
        $meta: "textScore",
      };
    }

    const videos = await Video.aggregate(aggregation);
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error searching videos:", error);
    return NextResponse.json(
      { message: "Server error during search." },
      { status: 500 }
    );
  }
}
