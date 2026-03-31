import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const usersFilePath = path.join(process.cwd(), "src/data/studentInfo.json");

export const dynamic = "force-dynamic";

export async function POST(request) {
    try {
        const { username } = await request.json();

        if (!fs.existsSync(usersFilePath)) {
            return NextResponse.json({ error: "No users found" }, { status:404 });
        }

        const fileContents = fs.readFileSync(usersFilePath, "utf8");
        const users = fileContents.trim() ? JSON.parse(fileContents) : [];
        const user = users.find(u => u.username === username);

        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        return NextResponse.json({ profile: user.profile });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}