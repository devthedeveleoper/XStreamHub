import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Video";
import mongoose from "mongoose";

export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const excludeId = searchParams.get("exclude");
    const skip = (page - 1) * limit;

    const filter = {};
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const totalVideos = await Video.countDocuments(filter);
    const videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .populate("uploader", "username")
      .limit(limit)
      .skip(skip);

    return NextResponse.json({
      videos,
      currentPage: page,
      totalPages: Math.ceil(totalVideos / limit),
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { message: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
