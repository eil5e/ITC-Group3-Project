import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const usersFilePath = path.join(process.cwd(), "src/data/studentInfo.json");

export const dynamic = "force-dynamic";

export async function POST(request) {
    try {
        const { username, name, studentId, email } = await request.json();
        
        if (!username || !name || !studentId || !email) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (!fs.existsSync(usersFilePath)) {
            return NextResponse.json({ error: "Users database not found" }, { status: 404 });
        }

        const fileContents = fs.readFileSync(usersFilePath, "utf8");
        let users = fileContents.trim() ? JSON.parse(fileContents) : [];

        const userIndex = users.findIndex(user => user.username === username);

        if (userIndex === -1) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const initial = name.charAt(0).toUpperCase();

        //overwrite only profile object
        users[userIndex] = {
            ...users[userIndex],
            profile: {
                name,
                initial,
                studentId,
                email,
                schedule: users[userIndex].profile?.courses || []
            }
        };

        fs. writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

        return NextResponse.json({ message:" Profile details saved successfully." });
    } catch (error) {
        console.error("Profile update error occurred:", error);
        return NextResponse.json({ error: error.message }, {status: 500 });
    }
}