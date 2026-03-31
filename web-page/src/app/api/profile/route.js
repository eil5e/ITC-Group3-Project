import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const dataFilePath = path.join(process.cwd(), "src/data/studentInfo.json");

export const dynamic = "force-dynamic";

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { username, name, studentId, email } = body;
        if (!username) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        if (!fs.existsSync(dataFilePath)) {
            return NextResponse.json({ error: "User data not found" }, { status: 404 });
        }
        const fileContents = fs.readFileSync(dataFilePath, "utf8");
        let users = fileContents.trim() ? JSON.parse(fileContents) : [];
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex === -1) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        users[userIndex] = {
            ...users[userIndex],
            profile: {
                name: name.trim(),
                initial: name.trim()[0].toUpperCase(),
                studentId: studentId || "",
                email: email || "",
                schedule: users[userIndex].profile?.schedule || []
            }
        };

        fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
        return NextResponse.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("SERVER ERROR:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
