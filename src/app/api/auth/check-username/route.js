import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(request) {
  await dbConnect();
  try {
    const { username } = await request.json();
    if (!username) {
      return NextResponse.json(
        { available: false, message: "Username is required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ username: username });
    if (user) {
      return NextResponse.json({
        available: false,
        message: "Username is already taken.",
      });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
