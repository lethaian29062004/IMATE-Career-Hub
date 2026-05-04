# IMATE: AI-Powered Interview, Mentoring & Hiring Platform 

## Description
This project is a comprehensive **educational and recruitment platform** specifically built to help IT candidates easily connect with the real-world job market, while simultaneously providing **recruiters with dedicated tools to effortlessly source and manage top tech talent**. The application provides an **all-in-one ecosystem** where candidates can practice their skills through **interactive mock interviews powered by AI, get their resumes automatically analyzed for improvements, and seamlessly schedule real-time 1-on-1 sessions with experienced mentors**, alongside a professional workspace for companies to **publish job vacancies and seamlessly track applicant resumes throughout the hiring process**. The system is designed with a highly scalable multi-layer architecture that securely integrates modern programming frameworks and external services to handle complex daily operations smoothly.

## 🌐 Live Access / Demo
You can easily access and test the application directly without any local setup by visiting our live deployment:
👉 **[Visit IMATE Live: https://imate.vn/](https://imate.vn/)**

## Key Features
* **AI-Driven Mock Interviews (Candidate):** Dynamic question generation and real-time candidate evaluation powered by Google Gemini, augmented with Azure Speech Synthesis (TTS) for natural voice interactions.
* **Automated CV Analysis (Candidate):** Intelligent parsing of resumes to determine IT-relevance, estimate candidate proficiency levels, and identify skill gaps against provided Job Descriptions (JD).
* **Job Posting & Management (Recruiter):** Comprehensive tools to create, publish, and manage IT job vacancies, allowing recruiters to effortlessly reach a targeted pool of tech professionals.
* **Applicant Tracking & CV Management (Recruiter):** A streamlined dashboard to receive applications, review submitted resumes, and efficiently track candidates throughout the hiring pipeline.
* **Mentor Booking & RTC Video Calls (Candidate, Mentor):** A seamless scheduling system integrated with Agora RTC for high-quality, real-time peer-to-peer video mentoring sessions.
* **Integrated Wallet & Payments (Candidate, Mentor):** Secure in-app wallet management, subscription packages, and automated transaction processing powered by the PayOS gateway.
* **Advanced Role-Based Access Control (RBAC):** Secure JWT-based authentication handling diverse privileges across five distinct roles: Candidate, Mentor, Recruiter, Staff, and Admin.
* **Real-Time Notifications:** Instant cross-platform alerts and workflow updates powered by SignalR WebSockets to keep all users seamlessly connected.

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

The repository follows a strict N-Tier architecture for the backend and a feature-based modular structure for the frontend, ensuring high scalability and maintainability.
```text
.
├── Backend/
│   └── Imate-BackEnd-main/
│       ├── Imate.API/                          # Core Web API & Application Entry Point
│       │   ├── BackgroundServices/             # Automated background tasks (e.g., Subscriptions)
│       │   ├── Business/                       # Core Business Logic (Booking, Payment, CV Services)
│       │   ├── DataAccess/                     # EF Core DbContext, Repositories, and Configurations
│       │   ├── ExternalServices/               # 3rd-party integrations (AWS S3, PayOS)
│       │   ├── Infrastructure/                 # App configurations (Firebase, JWT, Mail Settings)
│       │   ├── Middleware/                     # Global exception handling & request pipelines
│       │   ├── Migrations/                     # EF Core database schema migrations
│       │   ├── Models/                         # Database Entities and System Enums
│       │   └── Presentation/                   # RESTful Controllers, Request/Response DTOs, SignalR
│       │
│       ├── Imate.AI.Module/                    # Isolated AI Orchestration Module
│       │   ├── API/Controllers/                # Endpoints specific to AI operations
│       │   ├── Core/Agents/                    # LLM interaction logic (Gemini, Azure TTS)
│       │   ├── Core/Orchestrators/             # Complex AI workflows (Interview flow, CV Analysis)
│       │   └── SystemMessages/                 # Finely-tuned system prompts for the LLM
│       │
│       └── Imate.API.UnitTest/                 # Automated unit testing suite for Controllers & Services
│
└── Frontend/
    └── Imate-FrontEnd-main/
        └── imate_frontend/
            ├── public/                         # Static public assets
            ├── src/                            # Main Source Code
            │   ├── assets/                     # Images, Global CSS, and Videos
            │   ├── components/                 # Reusable UI components
            │   │   ├── custom/                 # Domain-specific components (e.g., Mentor Cards)
            │   │   ├── meeting/                # Agora WebRTC Video Call components
            │   │   └── ui/                     # shadcn/ui base components (Buttons, Dialogs, etc.)
            │   ├── config/                     # API Endpoint paths and Management routes
            │   ├── constants/                  # Application-wide constants & Role Enums
            │   ├── helpers/                    # Route Guards (Auth/Role/Status), Agora API helpers
            │   ├── layout/                     # MainLayout and ManagementLayout wrappers
            │   ├── lib/                        # Third-party setups (Firebase config, utility functions)
            │   ├── pages/                      # Role-specific and Feature-specific views
            │   │   ├── admin/                  # Admin dashboard & system management
            │   │   ├── auth/                   # Login, Register, Forgot Password flows
            │   │   ├── candidate/              # CV upload, Mock Interview room, Job applications
            │   │   ├── mentor/                 # Calendar setup, Pricing, Interview scheduling
            │   │   ├── recruiter/              # Job posting creation, Candidate tracking
            │   │   ├── staff/                  # Application review for Mentors and Recruiters
            │   │   └── videocall/              # Dedicated real-time meeting room interface
            │   ├── routes/                     # React Router DOM definitions
            │   ├── services/                   # Axios client & API service wrappers
            │   ├── store/                      # React Context (AuthContext, SignalRContext)
            │   └── types/                      # TypeScript Interfaces (Requests, Responses, Models)
            │
            ├── .env.example                    # Template for required environment variables
            ├── package.json                    # Project dependencies and NPM scripts
            └── vite.config.ts                  # Vite bundler and build configuration


```

## How To Run The Application (Locally)

### 1. Prerequisites
Ensure you have the following installed on your local machine before proceeding:
* **Node.js:** v18 or higher
* **.NET SDK:** v8.0 or higher
* **Database:** SQL Server (Local or via Docker container)
* **Cloud API Keys:** Firebase, Gemini, Azure, Agora, AWS, PayOS

### 2. Backend Setup (.NET API)
To explore the code and start the backend server:
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/lethaian29062004/IMATE-Career-Hub.git](https://github.com/lethaian29062004/IMATE-Career-Hub.git)
    ```
2.  **Navigate to the API directory:**
    ```bash
    cd Backend/Imate-BackEnd-main/Imate.API
    ```
3.  **Configure Environment:** 
    * Create an `appsettings.json` file in the root of the `Imate.API` folder (use `appsettings.example.json` as a reference if available). 
    * Provide your SQL Server connection string and all necessary Cloud API keys.
4.  **Apply Database Migrations:**
    ```bash
    dotnet ef database update
    ```
5.  **Run the Server:**
    ```bash
    dotnet run
    ```
    *The backend will typically start on `http://localhost:5067` or `https://localhost:7067`.*

### 3. Frontend Setup (React/Vite)
To start the interactive user interface:
1.  **Navigate to the frontend directory:** Open a new terminal window and run:
    ```bash
    cd Frontend/Imate-FrontEnd-main/imate_frontend
    ```
2.  **Configure Environment Variables:** 
    * Rename the `.env.example` file to `.env`.
    * Fill in the required values (e.g., set `VITE_API_BASE_URL=http://localhost:5067`).
3.  **Install Dependencies:**
    ```bash
    npm install
    # or yarn install
    ```
4.  **Start the Development Server:**
    
```bash
    npm run dev
    # or yarn dev
    ```
    *The application will be accessible at `http://localhost:5173`.*

> [!IMPORTANT]
> **Security Notice:** All sensitive configuration files (`.env`, `appsettings.json`, `serviceAccountKey.json`) are strictly ignored in this repository via `.gitignore` to prevent secret leakage. For deployment or local testing, you must supply your own infrastructure credentials.
