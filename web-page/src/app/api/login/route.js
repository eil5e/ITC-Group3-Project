import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const usersFilePath = path.join(process.cwd(), "src/data/studentInfo.json");

export const dynamic = "force-dynamic";

export async function POST(request) {
    try {
        const { username, password } = await request.json();
        
        if (!username || !password) {
            return NextResponse.json({ error: "Username and Password are required" }, { status: 400 });
        }

        if (!fs.existsSync(usersFilePath)) {
            return NextResponse.json({ error: "Database not found. Please sign up first." }, { status: 404 });
        }

        const fileContents = fs.readFileSync(usersFilePath, "utf8");
        let users = fileContents.trim() ? JSON.parse(fileContents) : [];
        const user = users.find(u => u.username === username);

        if (!user) {
            return NextResponse.json({ error: "Invalid username or password" }, {status: 401 });
        }

        if (user.password !== password) {
            return NextResponse.json({ error: "Invalid username or password" }, {status: 401 });
        }

        if (!user.profile) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        //success scenario
        return NextResponse.json({
            message: "Login successful",
            username: user.username,
            profile: user.profile || { name: user.username, initial: user.username[0] },
            schedule: user.schedule || [],
            modules: user.modules || [],
        });
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Failed to login on server" }, { status: 500 });
    }
}