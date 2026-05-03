# AI-Powered Interview Mentoring Platform (IMATE)

## Description
An enterprise-grade HRTech and EdTech platform designed to bridge the gap between IT candidates and the job market. The application features a comprehensive ecosystem that combines AI-driven mock interviews, automated CV analysis, and a real-time mentor booking system. Built with a scalable N-Tier Cloud-Native architecture, this project serves as a comprehensive thesis implementation at the Vietnamese-German University (VGU), demonstrating advanced integrations of modern frameworks, third-party cloud services, and complex business logic.

## Key Features
* **🧠 AI-Driven Mock Interviews:** Dynamic question generation and real-time candidate evaluation powered by Google Gemini, augmented with Azure Speech Synthesis (TTS) for natural voice interactions.
* **📄 Automated CV Analysis:** Intelligent parsing of resumes to determine IT-relevance, estimate candidate proficiency levels, and identify skill gaps against provided Job Descriptions (JD).
* **🧑‍🏫 Mentor Booking & RTC Video Calls:** A seamless scheduling system integrated with Agora RTC for high-quality, real-time peer-to-peer video mentoring sessions.
* **💳 Integrated Wallet & Payments:** Secure in-app wallet management, subscription packages, and transaction processing powered by the PayOS gateway.
* **🔐 Advanced Role-Based Access Control (RBAC):** Secure JWT-based authentication handling diverse privileges across five distinct roles: Candidate, Mentor, Recruiter, Staff, and Admin.
* **⚡ Real-Time Notifications:** Instant cross-platform alerts and workflow updates powered by SignalR WebSockets.

## Technology Stack
**Frontend (Web):** 
* TypeScript, ReactJS, Vite
* TailwindCSS, shadcn/ui (Declarative & Accessible UI components)
* Axios (with custom interceptors for seamless token refresh)

**Backend (API & AI Core):** 
* C#, ASP.NET Core Web API (.NET 8)
* Entity Framework Core, SQL Server
* SignalR (WebSocket communication)
* Repository Pattern & Unit of Work (Clean Architecture)

**External Services & Cloud:** 
* Google Gemini API (LLM for interview orchestration)
* Azure Speech Services (Speech-to-Text & Text-to-Speech)
* Agora RTC (Video/Audio streaming)
* AWS S3 (Cloud object storage for CVs and Media)
* Firebase Authentication (Social Login)
* PayOS (Payment Gateway)

## Project Structure
```text
.
├── Backend/
│   └── Imate-BackEnd-main/
│       ├── Imate.API/                  # Core Web API, Business Logic, and Data Access
│       │   ├── Business/               # Services layer (Booking, Payment, CV, etc.)
│       │   ├── DataAccess/             # EF Core DbContext, Repositories, Migrations
│       │   └── Presentation/           # RESTful Controllers and SignalR Hubs
│       ├── Imate.AI.Module/            # Isolated AI Orchestration & Agents
│       │   └── Core/Agents/            # Logic for Gemini & Azure integration
│       └── Imate.API.UnitTest/         # Automated unit testing suite
│
└── Frontend/
    └── Imate-FrontEnd-main/
        └── imate_frontend/
            ├── src/
            │   ├── components/         # Reusable UI components (shadcn/ui, Custom)
            │   ├── pages/              # Role-specific views (Admin, Candidate, Mentor, etc.)
            │   ├── services/           # Axios API client implementations
            │   ├── store/              # Context API (AuthContext, SignalRContext)
            │   ├── routes/             # React Router configuration & Guards
            │   └── helpers/            # Utilities (Agora setup, Role Guards)
            └── .env.example            # Environment variables template
