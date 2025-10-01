import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Video from "@/models/Video";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";
import FormData from "form-data";

const FREEIMAGE_API_URL = "https://freeimage.host/api/1/upload";

export async function POST(request, { params }) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }
    if (video.uploader.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "User not authorized" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const thumbnailFile = formData.get("thumbnailFile");

    if (!thumbnailFile) {
      return NextResponse.json(
        { message: "Thumbnail file is required." },
        { status: 400 }
      );
    }

    const bytes = await thumbnailFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageAsBase64 = buffer.toString("base64");

    const freeimageFormData = new FormData();
    freeimageFormData.append("key", process.env.FREEIMAGE_API_KEY);
    freeimageFormData.append("source", imageAsBase64);
    freeimageFormData.append("action", "upload");

    const freeimageRes = await axios.post(FREEIMAGE_API_URL, freeimageFormData);

    if (freeimageRes.data.status_code === 200) {
      video.thumbnailUrl = freeimageRes.data.image.url;
      await video.save();
      return NextResponse.json({ thumbnailUrl: video.thumbnailUrl });
    } else {
      throw new Error("Image upload failed");
    }
  } catch (error) {
    console.error("Error updating thumbnail:", error);
    return NextResponse.json(
      { message: "Failed to update thumbnail" },
      { status: 500 }
    );
  }
}
