# MBA Case Study Interactive Learning Platform

A production-ready web application that transforms MBA business cases into interactive learning environments. Students can read cases, highlight text, chat with AI personas of the case characters, view exhibits, and draft their recommendations.

## 🎯 Features

### Reading Interface
- **Typography-first design** with beautiful, readable layout
- **Text highlighting** in 5 colors with persistent storage
- **Inline and margin notes** anchored to text selections
- **Table of contents** with section navigation
- **Reading progress** indicator
- **Export** highlights and notes to Markdown or PDF

### AI Persona Chat
- **6 characters** from the Coffee Wars case:
  - V.G. Siddhartha (CCD Founder)
  - Venu Madhav (CCD Director)
  - Ramakrishnan (CCD Marketing President)
  - Jayaraj Hubli (CCD CFO)
  - Sushant Dash (Tata Starbucks Marketing)
  - Harish Bijoor (Industry Consultant)
- **Grounded responses** — personas only use information from the case
- **Adversarial resistance** — prevents jailbreaks and information leakage
- **Suggested questions** for each persona
- **Conversation history** with persistence

### Exhibits & Charts
- **14 exhibits** from the case
- **Interactive charts** (bar, line, pie, area) using Recharts
- **Data tables** with sorting
- **Image lightbox** for photos and figures
- **Clickable references** in case text

### Proposal Workspace
- **Rich text editor** with formatting (bold, italic, headings, lists)
- **Autosave** every 2 seconds
- **4 templates**: Executive Summary, Proposal, Analysis, Recommendation
- **Reference panel** showing your highlights and notes
- **Export** to Markdown, HTML, or PDF
- **Word count** and reading time

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:3000**

### Demo Login
Enter any username and password to access the demo (authentication is mocked for development).

## 📁 Project Structure

```
src/
├── App.tsx                 # Main app with routing
├── pages/                  # Page components
│   ├── MBAHome.tsx        # Landing page
│   ├── ReadingPage.tsx    # Reading interface
│   ├── ChatPage.tsx       # Persona chat
│   ├── NotesPage.tsx      # Highlights & notes overview
│   ├── WorkspacePage.tsx  # Proposal editor
│   ├── LoginPage.tsx      # Auth
│   └── RegisterPage.tsx   # Auth
├── features/               # Feature modules
│   ├── reading/           # Reading + annotation
│   ├── chat/              # Persona chat UI
│   ├── exhibits/          # Charts, tables, images
│   └── workspace/         # Proposal editor
├── backend/               # Cloudflare backend (Hono + D1)
├── personaEngine/         # AI persona logic
├── ingestion/             # Case parsing & knowledge base
└── ingestion/
    └── sampleCaseData.ts  # Coffee Wars case data
```

## 🏗️ Architecture

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **TipTap** for rich text editing
- **Recharts** for data visualization

### Backend (Cloudflare)
- **Cloudflare Pages** for hosting
- **D1** (SQLite) for database
- **Hono** for API routes
- **Server-side LLM proxy** (API key never exposed to client)

### AI Layer
- **Retrieval-grounded** persona responses
- **Data-layer enforcement** of information boundaries
- **Adversarial defense** against jailbreak attempts
- **Per-character access maps** (each persona knows only what they'd plausibly know)

## 🔒 Information Boundary Enforcement

The platform enforces strict information boundaries to prevent personas from:
- Revealing instructor-only content (teaching notes, answers)
- Inventing facts not in the case
- Speaking about another character's private information
- Following instruction-override attempts

This is enforced at the **data layer** through:
1. **Visibility tagging** — chunks marked as `instructor` are never retrievable
2. **Character access maps** — each persona has a defined knowledge scope
3. **Retrieval filtering** — only student-facing, character-appropriate chunks are passed to the LLM
4. **System prompts** — reinforce grounding constraints
5. **Adversarial detection** — flags and handles jailbreak attempts

## 📖 Adding a New Case

1. **Create case data** in `src/ingestion/sampleCaseData.ts` (or a new file)
2. **Define chunks** with visibility tags (`student` or `instructor`)
3. **Create persona profiles** for each character
4. **Build character access maps** (what each persona knows)
5. **Add exhibits** (tables, charts, images)
6. **Update the case selector** in `MBAHome.tsx`

## 🔑 API Key Configuration

For production deployment, set the LLM API key as a Cloudflare secret:

```bash
npx wrangler secret put LLM_API_KEY
```

The key is used server-side only and never exposed to the client.

## 🧪 Testing

```bash
# Run tests
npm test

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

## 📦 Deployment

```bash
# Deploy to Cloudflare Pages
npm run deploy
```

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## 🎨 Design System

- **Primary Color**: Burgundy (`#A82222`)
- **Fonts**: Source Serif 4 (reading), Inter (UI)
- **Typography**: Generous line height, optimal line length (~65 characters)
- **Spacing**: Consistent 4px grid
- **Shadows**: Subtle, layered shadows for depth

## 📝 License

Built as a demonstration of Fabric AI capabilities.

## 🙏 Acknowledgments

- Case study: "Coffee Wars in India: Café Coffee Day Takes On the Global Brands" (Harvard Business School)
- Powered by Fabric AI and Cloudflare
