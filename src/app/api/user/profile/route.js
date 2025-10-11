import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, email, password, avatar } = body;

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Update fields only if they are provided in the request
    if (username) user.username = username;
    if (email) user.email = email.toLowerCase();
    if (password) user.password = password; // The 'pre-save' hook in the model will hash it
    if (avatar) user.avatar = avatar;

    await user.save();

    // Return a sanitized user object (without the password)
    const sanitizedUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    };

    return NextResponse.json(sanitizedUser);
  } catch (error) {
    // Handle potential duplicate key errors if username/email is already taken
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { message: `An account with this ${field} already exists.` },
        { status: 409 }
      );
    }
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
