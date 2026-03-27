import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Find exactly where the JSON file lives in your project
const dataFilePath = path.join(process.cwd(), "src/data/studentInfo.json");

// Helper function to read the file
function getStudentData() {
    const fileContents = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(fileContents);
}

// 1. POST: ADD A NEW MODULE
export async function POST(request) {
    try {
        const newModule = await request.json();
        const data = getStudentData();

        const credits = Number(newModule.credits);
        
        // Calculate the fee dynamically (e.g., $300 per credit)
        const calculatedFee = credits * 300.00; 

        // Add to the 'modules' array
        data.modules.push({
            code: newModule.code,
            title: newModule.name,
            lecturer: newModule.instructor,
            credits: credits,
            fee: calculatedFee, // <-- Saves the calculated dollar amount to the database!
            theme: "bg-teal-100 text-teal-800 border-teal-300" 
        });

        // Add to the 'schedule' array
        data.schedule.push({
            id: Date.now(),
            code: newModule.code,
            name: newModule.name,
            time: newModule.time,
            dayTimes: newModule.dayTimes || null,
            startDate: newModule.startDate || null,
            endDate: newModule.endDate || null,
            location: newModule.location,
            instructor: newModule.instructor,
            days: newModule.days.split(",").map(d => d.trim())
        });

        // Save the file
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        return NextResponse.json({ message: "Enrolled Successfully" }, { status: 200 });
        
    } catch (error) {
        return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
    }
}

// 2. PATCH: EDIT A MODULE
export async function PATCH(request) {
    try {
        const body = await request.json();
        const data = getStudentData();

        const mod = data.modules.find(m => m.code === body.code);
        if (mod) {
            mod.title = body.title;
            mod.lecturer = body.lecturer;
            mod.credits = Number(body.credits);
            mod.fee = Number(body.credits) * 300;
        }

        const sched = data.schedule.find(s => s.code === body.code);
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

        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        return NextResponse.json({ message: "Updated Successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update module" }, { status: 500 });
    }
}

// 3. DELETE: DROP A MODULE
export async function DELETE(request) {
    try {
        const { code } = await request.json();
        const data = getStudentData();

        // Filter out the dropped class from both arrays
        data.modules = data.modules.filter(mod => mod.code !== code);
        data.schedule = data.schedule.filter(cls => cls.code !== code);

        // Save the file
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        return NextResponse.json({ message: "Dropped Successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Failed to drop module" }, { status: 500 });
    }
}