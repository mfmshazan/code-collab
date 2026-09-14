# ⚡ CodeCollab — Real-Time Collaborative Coding Classroom

<div align="center">

![CodeCollab Banner](https://img.shields.io/badge/CodeCollab-Real--Time%20IDE-blue?style=for-the-badge&logo=visualstudiocode)

**A high-performance, real-time collaborative coding platform and virtual classroom environment.**  
Empowering teachers, students, and developer teams to write, run, and learn code together with live cursor tracking, host moderation controls, and remote execution.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-010101?style=flat-square&logo=socketdotio)](https://socket.io/)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-VS_Code_Engine-007acc?style=flat-square&logo=visualstudiocode)](https://microsoft.github.io/monaco-editor/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Permissions & Classroom Management](#-classroom-management--permissions) • [Invite Links](#-instant-invite-links) • [Architecture](#-project-architecture)

</div>

---

## 🚀 Key Features

### 🌐 Multi-Language Playground (4 Core Languages)
- **JavaScript** (Node.js 17)
- **Java** (OpenJDK 17)
- **Python** (Python 3.10)
- **C++** (GCC 11 / C++17)
- **Landing Page Language Pre-selection**: Select any language on the home screen, and the generated room immediately initializes with that language's syntax highlighting and starter code.
- **Dynamic Language Quick-Switching**: Switch languages on the fly using header pills or the status bar selector.

---

### 👥 Classroom Moderation & Host Permissions
Designed specifically to prevent classroom chaos (where 10+ students type simultaneously and overwrite each other):
- **👑 Automatic Host/Admin Election**: The room creator is securely recognized as the **Host / Admin** via a persistent cryptographic host token stored locally.
- **🛡️ Room Modes**:
  - **Host-Only Mode (Default)**: The host retains full edit rights while students join in **View-Only Mode**, maintaining a clean presentation canvas.
  - **Collaborative Mode**: Host can toggle the room into open collaboration where all participants can type simultaneously.
- **✋ Student Hand-Raising**: View-only students can request edit permission with a single click (`Ask Edit ✋`). Hosts receive instant visual notifications with pulsing activity badges.
- **✏️ Granular Student Control**: Hosts can proactively grant edit access (`[Give Edit Access ✏️]`) or revoke it (`[Revoke 🔒]`) for individual students without waiting for a request.
- **⚡ Batch Permissions**: Host can click `[Grant All ✏️]` to give everyone edit power instantly, or `[Lock All 🔒]` to regain exclusive control.
- **🏷️ Free Student Renaming**: Students can rename their display handle at any time directly from the participants panel without requiring admin approval.
- **👑 Host Succession**: If the host disconnects or leaves, any participant can claim the Admin role with the `Claim Host` action.

---

### 🔗 Instant Shareable Invite Links
Sharing room access with students is frictionless:
- **Top Bar Quick Copy**: Persistent `[🔗 Copy Invite]` button located in the header right next to "Run Code", transforming into `[✓ Link Copied!]` on click.
- **Participants Panel Invite Card**: A dedicated "Invite Students" card at the top of the participants drawer with the full URL, click-to-select input, and one-click copy button.
- **Explorer Panel Invite Button**: Available inside the VS Code Explorer sidebar.
- **Full Context URL**: Invite URLs automatically include the pre-selected language (`/room/<id>?lang=cpp`), ensuring students land directly on the correct language workspace.

---

### 💻 Monaco Editor & Live Remote Cursors
- **VS Code Engine**: Full VS Code dark theme experience with line numbering, mini-map, bracket matching, syntax validation, and code folding.
- **Live Multi-Cursor Awareness**: See where your peers and students are reading and typing in real time, complete with distinctive color badges and participant names.
- **Zero-Latency In-Memory Sync**: Changes propagate across WebSockets instantaneously, backed by in-memory room caching and PostgreSQL persistence.

---

### ▶️ Remote Cloud Code Execution
- Integrated with the **JDoodle Compiler API**.
- Click **"Run Code"** to compile and execute JavaScript, Python, Java, or C++ in secure sandbox environments.
- Integrated **VS Code Output Terminal** showing program stdout, stderr, compile errors, and runtime stats.

---

### 📚 Interactive Coding Challenges Panel
- Built-in library of coding exercises and algorithmic challenges.
- Filterable by language and difficulty (Easy, Medium, Hard).
- One-click template insertion directly into the editor for classroom assignments.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Code Editor** | [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) (VS Code Core) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom VS Code Dark Theme Design System |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Real-time Engine** | [Socket.io](https://socket.io/) (v4.8 Client & Dedicated Standalone Server) |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) + [Prisma ORM 5](https://www.prisma.io/) |
| **Code Execution** | [JDoodle Compiler API](https://www.jdoodle.com/compiler-api) (Node.js, Java, Python 3, C++17) |

---

## 🏁 Quick Start

### 1. Prerequisites
- **Node.js**: v18.18+ or v20+ recommended
- **npm** / **yarn** / **pnpm**
- **PostgreSQL Database** (local or hosted, e.g. Supabase, Neon, Railway)
- **JDoodle API Credentials** ([Sign up free at JDoodle](https://www.jdoodle.com/compiler-api))

---

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/your-username/code-collab.git
cd code-collab

npm install
```

---

### 3. Environment Variables Configuration
Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

Fill in your configuration:
```env
# PostgreSQL Database URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/codecollab?schema=public"

# JDoodle API credentials for executing code
JDOODLE_CLIENT_ID="your_jdoodle_client_id"
JDOODLE_CLIENT_SECRET="your_jdoodle_client_secret"

# Optional: Next.js public socket URL (default: http://localhost:4000)
NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"
```

---

### 4. Database Setup (Prisma)
Initialize the PostgreSQL schema:

```bash
# Push Prisma schema to your database
npx prisma db push

# Generate the Prisma client
npx prisma generate
```

---

### 5. Running the Application

CodeCollab requires two processes: the **Next.js Frontend** and the **Socket.io Real-Time Server**.

#### Terminal 1 — Next.js Web Application:
```bash
npm run dev
```
> App runs at **http://localhost:3000**

#### Terminal 2 — Real-Time WebSocket Server:
```bash
npm run socket
```
> WebSocket server runs on port **4000** (`http://localhost:4000`)

---

## 📖 How It Works

```
                     ┌─────────────────────────────┐
                     │   Browser / Client (Monaco) │
                     └──────┬───────────────▲──────┘
                            │               │
                 code-change│               │code-update
               cursor-move  │               │participants-update
                            ▼               │
                     ┌─────────────────────────────┐
                     │   Socket.io Server (:4000)  │
                     │  - In-Memory Room Caching   │
                     │  - Host & Permission Rules  │
                     └──────┬───────────────▲──────┘
                            │               │
               upsert(code) │               │run-code HTTP POST
                            ▼               ▼
                 ┌────────────────────┐   ┌──────────────────────┐
                 │ PostgreSQL (Prisma)│   │ JDoodle Compiler API │
                 │ Persistent Storage │   │ Remote Code Runner   │
                 └────────────────────┘   └──────────────────────┘
```

1. **Room Creation**: Clicking **"Create New Room"** on the landing page generates a random room ID and an ephemeral host token saved in the creator's browser `localStorage`.
2. **Language Bootstrap**: If a specific language was picked (e.g. C++), the query parameter `?lang=cpp` instructs the socket server to initialize the room with that language's template.
3. **Host Moderation**: When participants join, the server evaluates host credentials:
   - Creator matching the host token is assigned the `Crown 👑 Host` role.
   - Others join as `Student` in view-only mode by default.
4. **Real-Time Synchronisation**:
   - Edits are validated on the server against the user's `canEdit` status before broadcasting.
   - Live cursor coordinates are broadcast to render colored badges for each collaborator.
   - Code changes are debounced and saved to PostgreSQL, while maintaining instant in-memory cache for joining clients.
5. **Code Execution**:
   - Pressing **"Run Code"** transmits the active buffer and language identifier to the socket server.
   - The server delegates compilation to the JDoodle REST API and returns stdout/stderr directly into the terminal window.

---

## 📁 Project Architecture

```
code-collab/
├── app/
│   ├── layout.tsx              # Root HTML wrapper and fonts
│   ├── page.tsx                # Landing page with language picker & room creator
│   ├── globals.css             # Tailwind v4 dark theme styles
│   └── room/
│       └── [roomId]/
│           └── page.tsx        # Collaborative IDE workspace (Tabs, Editor, Terminal)
├── components/
│   ├── EditorComponent.tsx     # Monaco Editor wrapper with remote cursor decorations
│   ├── InviteButton.tsx        # Multi-variant room invite link component (header/card/btn)
│   ├── ParticipantsPanel.tsx   # Roster, host controls, raise-hand & permission toggles
│   └── ChallengesPanel.tsx     # Interactive algorithm challenges panel
├── lib/
│   ├── challenges.ts           # Starter code templates & problem sets for all 4 languages
│   └── prisma.ts               # Prisma ORM database client singleton
├── prisma/
│   └── schema.prisma           # Room and Code persistence schema
├── socket-server.ts            # Standalone Socket.io server with permission & JDoodle logic
├── tsconfig.json               # Next.js TypeScript config
├── tsconfig.server.json        # Dedicated ts-node config for socket server
└── package.json                # Dependencies and npm scripts
```

---

## ⌨️ Useful Controls & Shortcuts

| Action | Where | Shortcut / Control |
|---|---|---|
| **Copy Invite Link** | Header / Top Bar | Click `[🔗 Copy Invite]` |
| **Invite via Drawer** | Sidebar | Click `Users` icon -> `Copy Link` in Invite Card |
| **Run Code** | Header | Click `Run Code` or `Ctrl + Enter` / `Cmd + Enter` |
| **Switch Language** | Top Bar / Footer | Click language pill (`⚡ JS`, `☕ Java`, `🐍 Py`, `⚙ C++`) |
| **Request Edit Access** | Header / Editor Overlay | Click `[View Only (Ask Edit ✋)]` |
| **Grant / Revoke Access** | Participants Panel (Host) | Click `[Give Edit Access ✏️]` or `[Revoke 🔒]` |
| **Unlock All Students** | Participants Panel (Host) | Click `[Grant All ✏️]` |
| **Lock All Students** | Participants Panel (Host) | Click `[Lock All 🔒]` |
| **Rename Yourself** | Participants Panel | Click pencil icon next to your name |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to open an issue or submit a pull request:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

<div align="center">
Built with ❤️ for collaborative coding and interactive learning.
</div>
