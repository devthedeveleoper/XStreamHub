import { NextResponse } from 'next/server';
import axios from 'axios';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const AURA_API_BASE_URL = "https://api.aurahub.fun";
const UPLOAD_FOLDER_ID = process.env.UPLOAD_FOLDER_ID;

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { videoUrl } = await request.json();
    if (!videoUrl) {
      return NextResponse.json(
        { message: "Video URL is required" },
        { status: 400 }
      );
    }

    const response = await axios.get(`${AURA_API_BASE_URL}/remote/add`, {
      params: { url: videoUrl, folder: UPLOAD_FOLDER_ID },
    });

    return NextResponse.json(response.data, { status: 202 });
  } catch (error) {
    console.error("Error starting remote upload:", error);
    return NextResponse.json(
      { message: "Failed to start remote upload" },
      { status: 500 }
    );
  }
}