import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Video";
import mongoose from "mongoose";

export async function POST(request, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid video ID format." },
        { status: 400 }
      );
    }
    await Video.findByIdAndUpdate(id, { $inc: { views: 1 } });
    return NextResponse.json({
      success: true,
      message: "View count incremented.",
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return NextResponse.json({
      success: false,
      message: "Could not increment view count.",
    });
  }
}
