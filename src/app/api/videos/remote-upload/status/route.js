import { NextResponse } from "next/server";
import axios from "axios";

const AURA_API_BASE_URL = "https://api.aurahub.fun";

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const remoteId = searchParams.get("id");

  if (!remoteId) {
    return NextResponse.json(
      { message: "Remote ID is required." },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(`${AURA_API_BASE_URL}/remote/status`, {
      params: { id: remoteId },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error checking remote upload status:", error);
    return NextResponse.json(
      { message: "Failed to check status" },
      { status: 500 }
    );
  }
}
