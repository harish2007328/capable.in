# Skill: Capable Project Assistant

This skill provides comprehensive knowledge about the **Capable** project, an AI-powered strategic advisor platform. It covers the tech stack, architecture patterns, and key implementation details to ensure consistent development.

## Project Overview
**Capable** transforms business ideas into actionable 60-day execution plans using real-time market signals and AI-driven strategic analysis.

## Tech Stack

### Frontend
- **Framework**: React 19.2.0 (Functional components, Hooks)
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.12.0
- **Styling**: Tailwind CSS 3.4.17 + Custom CSS (Glassmorphism, Premium Aesthetics)
- **Animations**: 
  - Framer Motion 12.29.2 (Micro-interactions, component transitions)
  - GSAP 3.14.2 + ScrollTrigger (Advanced scroll-driven animations)
- **UI Components**: Lucide React (Icons)
- **Data Fetching**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **AI Model**: Groq (Llama 3.1-8b-instant)
- **Web Scraping**: Axios + Cheerio (DuckDuckGo, Reddit)
- **Environment**: dotenv

### Data & Persistence
- **Storage**: Browser `localStorage` (current persistence layer)
- **Authentication**: Context-based (AuthContext.jsx) with local storage sync

## Architecture Patterns

### Frontend Structure
- **Pages** (`src/pages/`): Route-level components (e.g., `HomePage`, `VenturePage`, `DashboardPage`).
- **Components** (`src/components/`): Reusable UI elements (e.g., `Header`, `Layout`, `MentorChat`).
- **Context** (`src/context/`): Global state management (e.g., `AuthContext`).
- **Services** (`src/services/`): API client layer (e.g., `ai.js` for AI/Backend calls).

### Backend Structure
- **Unified Server**: `server.js` handles both API endpoints and static file serving for the frontend build.
- **API Endpoints**:
  - `/api/enhance-idea`: Shortens and refines business ideas.
  - `/api/research`: Scrapes market signals and generates discovery questions.
  - `/api/analyze`: Generates investor-ready strategic reports.
  - `/api/generate-plan`: Creates 60-day execution roadmaps.
  - `/api/chat`: Context-aware AI mentorship chat.

## Coding Standards & Conventions

### UI/UX Guidelines
- **Premium Design**: Use vibrant colors, dark modes, glassmorphism (`backdrop-blur`), and dynamic animations.
- **Responsive**: All components must be mobile-first and fully responsive.
- **Interactivity**: Prioritize smooth transitions and hover effects using Framer Motion.

### AI Implementation Pattern
- AI prompts are centralized in `server.js`.
- Always use `json_object` response format for structured data from LLMs.
- Implement retry logic for AI API calls (429 handling).
- Sanitize message history to include only `role` and `content` for Groq compatibility.

### State & Persistence
- Read/Write to `localStorage` using keys like `capable_projects`, `capable_venture`, etc.
- Sync UI state with local storage in `useEffect` hooks.

## Key Files & Entry Points
- `src/main.jsx`: React entry point.
- `src/App.jsx`: Main routing and provider setup.
- `server.js`: Backend entry point and API logic.
- `tailwind.config.js`: Custom theme configuration (colors, spacing).
- `vercel.json`: Deployment config for Vercel.
