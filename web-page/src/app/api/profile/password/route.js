import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const dataFilePath = path.join(process.cwd(), "src/data/studentInfo.json");

export const dynamic = "force-dynamic";

export async function POST(request) {
    try {
        const { username, currentPassword, newPassword } = await request.json();

        if (!username || !currentPassword || !newPassword) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const fileContents = fs.readFileSync(dataFilePath, "utf8");
        let users = JSON.parse(fileContents);

        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex === -1) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (users[userIndex].password !== currentPassword) {
            return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
        }

        users[userIndex].password = newPassword;

        fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Password Update Error:", error);
        return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }
}
