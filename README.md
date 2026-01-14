# 🤖 CRM AI Agent - MCP Server

An enterprise-grade **Model Context Protocol (MCP)** server serving as the centralized "Brain" and "Guard" for AI operations within the CRM & Project Management platform.

## 🏗️ Technical Architecture

This project follows a strict **Layered Architecture** to ensure security, scalability, and maintainability.

| Layer | Analogy | Description |
| :--- | :--- | :--- |
| **Tools** | The Menu | The public interface exposed to LLMs (Cursor, Claude, etc.). |
| **Capabilities** | The Brain | Core AI business logic, calculations, and analysis. |
| **Policies** | The Guard | Granular permission checks (RBAC) on every request. |
| **Context** | The Librarian | Data abstraction layer that fetches raw data from the DB via Prisma. |
| **Prompts** | The Script | (Planned) Decoupled templates governing how the AI speaks. |

## 🛠️ Integrated Capabilities & Tools

The server exposes specialized tools for project management and financial analysis:

### 1. Project Insights
- `get_project_summary`: Generates detailed overviews of project progress, module status, and stakeholder activity.
- `get_project_risk`: Advanced analysis of timeline velocity gaps, budget health, and stagnation alerts.

### 2. Intelligent Actions
- `suggest_tasks`: Industry-aware task and module generation for new project blueprints.
- `generate_email_draft`: Context-aware drafting for payment reminders, status updates, and client check-ins.

### 3. Financial Analysis
- `explain_invoice`: Translates complex financial documents into simple terms, including budget utilization impact.

## 🛡️ Security & Access Control

This server is **identity-aware**. Every tool call is intercepted by the `AIPermissionsPolicy` to verify:
- **Project Membership**: Users can only see projects they are assigned to.
- **Role Permissions**: Financial details are restricted to `ADMIN` and `OWNER` roles.
- **Context Injection**: Standardized in `server.ts` to prevent "Ghost" or anonymous requests.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- A running database (PostgreSQL/MongoDB) connected via Prisma.

### Installation
```bash
npm install
```

### Development
```bash
# Run with live reload
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="your_database_url"
```

## 📜 Development Standards
- **Strict Types**: All data flows are typed via `ai.types.ts`.
- **Centralized Handler**: Tools use the `registerMcpTool` helper in `server.ts` for consistent error handling.
- **Relational Integrity**: Context layers use Prisma `select` and `include` to minimize database roundtrips.

---

