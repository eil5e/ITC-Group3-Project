import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const dataFilePath = path.join(process.cwd(), "src/data/studentInfo.json");

export const dynamic = "force-dynamic";

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { username, name, studentId, email, pfp } = body;

        if (!username) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }

        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        try {
            await fs.access(dataFilePath);
        } catch {
            return NextResponse.json({ error: "User data file not found" }, { status: 404 });
        }

        const fileContents = await fs.readFile(dataFilePath, "utf8");
        let users = fileContents.trim() ? JSON.parse(fileContents) : [];
        
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex === -1) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        users[userIndex] = {
            ...users[userIndex],
            profile: {
                ...users[userIndex].profile,
                name: name.trim(),
                initial: name.trim()[0].toUpperCase(),
                studentId: studentId || "",
                email: email || "",
                schedule: users[userIndex].profile?.schedule || [],
                pfp: pfp !== undefined ? pfp : (users[userIndex].profile?.pfp || null)
            }
        };

        await fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), "utf8");
        return NextResponse.json({ message: "Profile updated successfully" });
        } catch (err) {
        console.error("SERVER ERROR:", err);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
