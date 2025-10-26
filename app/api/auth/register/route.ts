import { connectionToDb } from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
        return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    try {
        await connectionToDb();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        // const newUser = new User({ email, password, role: "user" });//Just creates an object in memory.
        // await newUser.save();//To make it persist and appear in DB queries, we need to save it:

        await User.create({
            email,
            password,
            role: "user" // default role
        });
        

        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal Server Error, Failed to register user" }, { status: 500 });
    }
}