import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(request) {
  await dbConnect();
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { available: false, message: "Email is required." },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return NextResponse.json({
        available: false,
        message: "An account with this email already exists.",
      });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
