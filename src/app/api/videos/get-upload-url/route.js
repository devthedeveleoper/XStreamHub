import { NextResponse } from "next/server";
import axios from "axios";

const AURA_API_BASE_URL = "https://api.aurahub.fun";
const UPLOAD_FOLDER_ID = process.env.UPLOAD_FOLDER_ID;

export async function GET(request) {
  try {
    const response = await axios.get(`${AURA_API_BASE_URL}/upload/url`, {
      params: { folder: UPLOAD_FOLDER_ID },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error getting direct upload URL:", error);
    return NextResponse.json(
      { message: "Failed to get upload URL" },
      { status: 500 }
    );
  }
}
