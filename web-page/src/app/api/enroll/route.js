import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Find exactly where the JSON file lives in your project
const dataFilePath = path.join(process.cwd(), "src/data/studentInfo.json");

function readAllStudents() {
    const fileContents = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(fileContents);
}

function getStudentData(username) {
    const allStudents = readAllStudents();
    const student = allStudents.find((item) => item.username === username);
    if (!student) {
        throw new Error("Student not found");
    }
    return { allStudents, student };
}

// 1. POST: ADD A NEW MODULE
export async function POST(request) {
    try {
        const newModule = await request.json();
        const { allStudents, student } = getStudentData(newModule.username);

        const credits = Number(newModule.credits);
        const calculatedFee = credits * 300.00;

        // Add to the 'modules' array
        student.modules.push({
            code: newModule.code,
            title: newModule.name,
            lecturer: newModule.instructor,
            credits,
            fee: calculatedFee,
            theme: "bg-teal-100 text-teal-800 border-teal-300"
        });

        // Add to the 'schedule' array
        student.schedule.push({
            id: Date.now(),
            code: newModule.code,
            name: newModule.name,
            time: newModule.time,
            dayTimes: newModule.dayTimes || null,
            startDate: newModule.startDate || null,
            endDate: newModule.endDate || null,
            location: newModule.location,
            instructor: newModule.instructor,
            days: newModule.days.split(",").map((d) => d.trim())
        });

        // Save the file
        fs.writeFileSync(dataFilePath, JSON.stringify(allStudents, null, 2));
        return NextResponse.json({ message: "Enrolled Successfully" }, { status: 200 });
        
    } catch (error) {
        return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
    }
}

// 2. PATCH: EDIT A MODULE
export async function PATCH(request) {
    try {
        const body = await request.json();
        const { allStudents, student } = getStudentData(body.username);

        const mod = student.modules.find((m) => m.code === body.code);
        if (mod) {
            mod.title = body.title;
            mod.lecturer = body.lecturer;
            mod.credits = Number(body.credits);
            mod.fee = Number(body.credits) * 300;
        }

        const sched = student.schedule.find((s) => s.code === body.code);
        if (sched) {
            sched.name = body.title;
            sched.instructor = body.lecturer;
            sched.location = body.location;
            sched.days = body.days;
            sched.time = body.time;
            sched.dayTimes = body.dayTimes || null;
            sched.startDate = body.startDate || null;
            sched.endDate = body.endDate || null;
        }

        fs.writeFileSync(dataFilePath, JSON.stringify(allStudents, null, 2));
        return NextResponse.json({ message: "Updated Successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
    }
}

// 3. DELETE: DROP A MODULE
export async function DELETE(request) {
    try {
        const { username, code } = await request.json();
        const { allStudents, student } = getStudentData(username);

        student.modules = student.modules.filter((mod) => mod.code !== code);
        student.schedule = student.schedule.filter((cls) => cls.code !== code);

        // Save the file
        fs.writeFileSync(dataFilePath, JSON.stringify(allStudents, null, 2));
        return NextResponse.json({ message: "Dropped Successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to drop module" }, { status: 500 });
    }
}