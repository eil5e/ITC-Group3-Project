import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const usersFilePath = path.join(process.cwd(), "src/data/studentInfo.json");

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
        }

        let users = [];
        
        const dir = path.dirname(usersFilePath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        if (fs.existsSync(usersFilePath)) {
            const fileContents = fs.readFileSync(usersFilePath, "utf8");
            users = fileContents.trim() ? JSON.parse(fileContents) : [];
        }

        const userExists = users.some(user => user.username === username);
        if (userExists) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }

        users.push({ 
            username,
            password ,
            profile: null, //set in signup-details
            schedule: [],
            modules: []
        });

        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

        return NextResponse.json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Signup error occurred:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
