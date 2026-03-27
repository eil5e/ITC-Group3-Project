import { NextResponse } from 'next/server';

async function extractText(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    if (ext === 'txt') {
        return buffer.toString('utf-8');
    }

    if (ext === 'pdf') {
        const pdfModule = await import('pdf-parse');
        const pdfParse = pdfModule.default ?? pdfModule;
        const data = await pdfParse(buffer);
        return String(data.text ?? '');
    }

    if (ext === 'docx') {
        const mammoth = (await import('mammoth')).default;
        const result = await mammoth.extractRawText({ buffer });
        return String(result.value ?? '');
    }

    if (ext === 'pptx') {
        const { parseOffice } = await import('officeparser');
        const text = await new Promise((resolve, reject) =>
            parseOffice(buffer, (data, err) => err ? reject(err) : resolve(data))
        );
        return String(text ?? '');
    }

    throw new Error(`Unsupported file type: .${ext}. Please upload a PDF, DOCX, PPTX, or TXT file.`);
}

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const moduleCode = formData.get('moduleCode');

        if (!file) {
            return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
        }

        const text = await extractText(file);

        if (!text || text.trim().length < 20) {
            return NextResponse.json({ error: 'Could not extract enough text from this file. It may be image-based or empty.' }, { status: 422 });
        }

        const prompt = `You are an expert academic AI assistant. Please read the following lecture notes for the module ${moduleCode} and provide a clear, concise, and highly structured summary using bullet points. Focus heavily on the key concepts, formulas, and definitions.\n\nNotes Content:\n${text.slice(0, 12000)}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'system', content: prompt }],
                temperature: 0.5,
                max_tokens: 800,
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('OpenAI API Error:', data);
            throw new Error('OpenAI API request failed');
        }

        return NextResponse.json({ summary: data.choices[0].message.content });

    } catch (error) {
        console.error('Summarize API Error:', error.message);
        return NextResponse.json({ error: error.message || 'Failed to generate summary.' }, { status: 500 });
    }
}
