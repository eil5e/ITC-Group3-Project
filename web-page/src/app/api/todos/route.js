import { NextResponse } from "next/server";

let mockDatabase = [];

export async function GET() {
    return NextResponse.json(mockDatabase);
}

export async function POST(request) {
    try {
        const body = await request.json();
        const newTask = {
            id: Date.now(),
            title: body.title,
            status: "not_started",
            dueDate: body.dueDate || null,
        };
        mockDatabase.push(newTask);
        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to add task" }, { status: 500 });
    }
}

export async function PATCH(request) {
    try {
        const body = await request.json();
        const task = mockDatabase.find(t => t.id === body.id);
        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
        if (body.status !== undefined) task.status = body.status;
        if (body.dueDate !== undefined) task.dueDate = body.dueDate;
        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const body = await request.json();
        mockDatabase = mockDatabase.filter(task => task.id !== body.id);
        return NextResponse.json({ message: "Task deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}
