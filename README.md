# SIMConnect — ITC Group 3 Project

> A student academic management portal built with Next.js and Tailwind CSS.

## Live Deployment

**[itc-group3-project.vercel.app](https://itc-group3-project.vercel.app)**

---

## Project Overview

SIMConnect is a modern, interactive web application designed to help university students seamlessly manage their academic lives. Built with **Next.js 14** and styled with **Tailwind CSS** using a distinctive neo-brutalist design language, the platform provides a unified space for students to track modules, schedules, tasks, and notes — all powered by an AI assistant.

---

## Features Summary

| Feature | Description |
|---|---|
| **Login Page** | Secure entry point with credential validation |
| **Dashboard** | Central hub with an AI-powered chatbot assistant |
| **Class Schedule** | Monthly calendar view with per-day class cards and date-range filtering |
| **Module Enrollment** | Enroll in modules with day toggles, time pickers, and start/end dates |
| **My Modules** | View and edit enrolled modules; shows schedule info per card |
| **Notes Buddy** | Upload `.txt`, `.pdf`, `.docx`, or `.pptx` files and get an AI-generated summary |
| **To-Do List** | Task manager with status cycling (Not Started → In Progress → Done) and due dates |
| **AI Chatbot** | Persistent assistant accessible from the dashboard, renders markdown responses |

---

## Setup Instructions

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/geraldchuaa/ITC-Group3-Project.git
cd ITC-Group3-Project/web-page
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the `web-page/` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

> The AI chatbot and Notes Buddy summarization features require a valid OpenAI API key.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Login credentials (demo)

| Field | Value |
|---|---|
| Username | `student` |
| Password | `password123` |

---

## Usage Guide

1. **Log in** at `localhost:3000` with the demo credentials above.
2. **Dashboard** — Chat with the AI assistant about your schedule or ask general questions.
3. **Schedule** — Navigate months to see your classes. Click any class card for details.
4. **Module Enrollment** — Fill in module details, select days, set times (same for all or per day), and choose a date range.
5. **My Modules** — View all enrolled modules. Click the pencil icon to edit a module, or use the **+ Module** button to enroll in a new one.
6. **Notes Buddy** — Upload a file (PDF, DOCX, PPTX, or TXT), get an AI summary, and save or download your note.
7. **To-Do List** — Add tasks with optional due dates. Click the status badge to cycle through Not Started → In Progress → Done.

---

## Known Limitations & Future Improvements

### Current Limitations
- **No real authentication** — credentials are hardcoded for demo purposes.
- **JSON file as database** — `studentInfo.json` is used as a mock database. Data does not persist across Vercel deployments.
- **Single user** — the app is designed for one student profile; no multi-user support.
- **No real academic data** — schedule and module data are manually entered, not pulled from a real university system.
- **OpenAI dependency** — the chatbot and summarization features require a paid OpenAI API key.

### Possible Future Improvements
- Replace JSON file storage with a real database (e.g., PostgreSQL, Supabase).
- Add proper authentication (e.g., NextAuth.js) with user accounts.
- Integrate with a real university API for live schedule/module data.
- Add notifications or reminders for upcoming classes and task due dates.
- Mobile-responsive improvements for smaller screens.

---

## Team Contribution Breakdown

| Member | Contributions |
|---|---|
| | |
| | |
| | |
| | |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **AI:** OpenAI GPT-4o-mini
- **File Parsing:** pdf-parse, mammoth, officeparser
- **Markdown Rendering:** react-markdown + @tailwindcss/typography
- **Deployment:** Vercel
