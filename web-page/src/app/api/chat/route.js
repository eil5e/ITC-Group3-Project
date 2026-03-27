import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Grab the chat history sent from the frontend
        const { messages } = await req.json();

        // 1. Get the latest live student data
        const dataFilePath = path.join(process.cwd(), "src/data/studentInfo.json");
        const fileContents = fs.readFileSync(dataFilePath, "utf8");
        const student = JSON.parse(fileContents);

        // 2. Build the "System Prompt" context
        const studentContext = `You are a friendly and helpful academic assistant for SIMConnect, a university student portal. You have access to the student's personal information and should give warm, clear, well-formatted responses.

STUDENT INFORMATION:
- Name: ${student.profile.name} (address them by first name only)

ENROLLED MODULES (${student.modules.length} modules):
${student.modules.map(m => `- **${m.code}** — ${m.title} | Lecturer: ${m.lecturer} | ${m.credits} credits`).join('\n')}

CLASS SCHEDULE:
${student.schedule.map(s => `- **${s.code}** (${s.days.join(', ')}): ${s.time} @ ${s.location}`).join('\n')}

INSTRUCTIONS:
- Be warm, concise, and encouraging — like a helpful senior student.
- Use markdown formatting: **bold** for emphasis, bullet lists for multiple items, and short paragraphs.
- Always use the student's first name at least once per response.
- When listing schedule info, always include the day, time, and location.
- Never use overly formal language. Keep it friendly and approachable.
- If asked something outside your knowledge, suggest they check the university website or contact their lecturer.`;

        // 3. Send everything to OpenAI
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // The model from your reference file
                messages: [
                    { role: 'system', content: studentContext },
                    ...messages // Attach the user's actual conversation here
                ],
                temperature: 0.7,
                max_tokens: 500,
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('OpenAI API Error:', data);
            throw new Error(data.error?.message || 'OpenAI API request failed');
        }

        // Return the AI's response to the frontend
        return NextResponse.json({ message: data.choices[0].message.content });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Failed to get AI response. Check your API key.' }, { status: 500 });
    }
}