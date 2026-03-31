import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const usersFilePath = path.join(process.cwd(), "src/data/studentInfo.json");

export const dynamic = "force-dynamic";

function getUsers() {
    if (!fs.existsSync(usersFilePath)) return [];
    const fileContents = fs.readFileSync(usersFilePath, "utf8");
    return fileContents.trim() ? JSON.parse(fileContents) : [];
}

// export async function GET() {
//     return NextResponse.json(mockDatabase);
// }

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get("username");
        if (!username) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }

        const users = getUsers();
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex === -1) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userTodos = users[userIndex].todos || [];
        return NextResponse.json(userTodos);
    } catch (error) {
        console.error("Todo GET error:", error);
        return NextResponse.json({ error: "Failed to load tasks" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, action, title, dueDate, id, status } = body;
        if (!username) {
            return NextResponse.json({ error: "Username is required" }, { status: 400 });
        }

        const users = getUsers();
        const userIndex = users.findIndex(u => u.username === username);
        if (userIndex === -1) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (!users[userIndex].todos) {
            users[userIndex].todos = [];
        }

        const userTodos = users[userIndex].todos;

        if (action === "FETCH") {
            return NextResponse.json(userTodos);
        }

        if (action === "ADD") {
            if (!title)
                return NextResponse.json({ error: "Task title is required" }, { status: 400 });
            const newTask = {
                id: Date.now(),
                title: body.title,
                status: "not_started",
                dueDate: body.dueDate || null,
            };

            users[userIndex].todos.push(newTask);
            fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
            return NextResponse.json(newTask, { status: 201 });
        }
        
        if (action === "UPDATE") {
            const taskIndex = userTodos.findIndex(t => t.id === id);
            if (taskIndex === -1) {
                return NextResponse.json({ error: "Task not found" }, { status: 404 });
            }
            if (status !== undefined) userTodos[taskIndex].status = status;
            if (dueDate !== undefined) userTodos[taskIndex].dueDate = dueDate;
            fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
            return NextResponse.json(userTodos[taskIndex]);
        }

        if (action === "DELETE") {
            users[userIndex].todos = userTodos.filter(t => t.id !== id);
            fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
            return NextResponse.json({ message: "Task deleted successfully" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("TO-Do processing error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}