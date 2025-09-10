import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
    await dbConnect();
    try {
        const { username, email, password, avatar } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json({ message: "All fields are required." }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: "User with this email already exists." }, { status: 409 });
        }

        const newUser = new User({
            username,
            email,
            password,
            avatar,
        });

        await newUser.save();
        return NextResponse.json({ message: "User created successfully." }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}