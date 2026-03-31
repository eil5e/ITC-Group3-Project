import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const dataFilePath = path.join(process.cwd(), "src/data/studentInfo.json");

function getStudentData() {
    const fileContents = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(fileContents);
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const { name, studentId, email } = body;
        if (!name || !name.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }
        const data = getStudentData();
        data.profile.name = name.trim();
        data.profile.initial = name.trim()[0].toUpperCase();
        data.profile.studentId = studentId || "";
        data.profile.email = email || "";
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        return NextResponse.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("SERVER ERROR:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}
