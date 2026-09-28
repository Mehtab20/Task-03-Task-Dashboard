# TaskPulse — Interactive Dynamic Task Dashboard

> **PROGREE Full-Stack Development — Task 3**

A modern full-stack task management application featuring a React + TypeScript frontend, Express REST API backend, and persistent SQLite database.

---

## Features

- **Full CRUD Operations** — Create, Read, Update, and Delete tasks with real-time UI feedback
- **Dashboard Analytics** — Real-time stats: total, to-do, in-progress, completed, high-priority, and overdue task counts
- **Search & Filters** — Search by title/description, filter by status and priority, sort by date/title/priority
- **SQLite Persistence** — Task data persists to disk via sql.js and survives server restarts
- **Input Validation** — Server-side validation with express-validator, client-side form validation
- **Toast Notifications** — Success/error feedback for all CRUD actions
- **Confirmation Dialogs** — Delete confirmation modal prevents accidental data loss
- **Loading & Error States** — Spinners during data fetch, error messages with retry options
- **Responsive Layout** — Desktop sidebar layout collapses to mobile hamburger menu
- **Dark Theme** — Modern dark-mode UI with a curated color palette and Inter typography

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| **Frontend** | React 19, TypeScript, Vite 8, Vanilla CSS |
| **Backend**  | Node.js, Express 4, express-validator   |
| **Database** | SQLite via sql.js (file persistence)    |
| **Tooling**  | OxLint, TypeScript compiler             |

---

## Project Structure

```
Task-03-Task-Dashboard/
├── backend/
│   ├── src/
│   │   ├── server.js        # Express app entry point
│   │   ├── routes.js         # CRUD API routes (/api/tasks)
│   │   ├── database.js       # sql.js init, load, save, close
│   │   └── validators.js     # express-validator rules
│   ├── database/
│   │   └── tasks.db          # SQLite database file (auto-created)
│   ├── seed.js               # Seed script (seeds via API)
│   ├── .env                  # Server config (PORT, DB_PATH, CORS)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx          # React entry point
│   │   ├── App.tsx           # Root component with page routing
│   │   ├── api.ts            # fetch + async/await API client
│   │   ├── index.css         # Design system (CSS custom properties)
│   │   ├── hooks/
│   │   │   └── useToast.ts   # Toast notification hook
│   │   ├── components/
│   │   │   ├── Sidebar.tsx   # Navigation sidebar
│   │   │   ├── Topbar.tsx    # Page header with title
│   │   │   ├── DeleteModal.tsx
│   │   │   └── ToastContainer.tsx
│   │   └── pages/
│   │       ├── Dashboard.tsx      # Stats + recent tasks
│   │       ├── TaskList.tsx       # Full task list with search/filter/sort
│   │       ├── TaskForm.tsx       # Create / Edit task form
│   │       ├── TaskDetail.tsx     # Single task detail view
│   │       ├── CompletedTasks.tsx # Completed tasks archive
│   │       └── About.tsx         # About page + API health check
│   ├── index.html
│   └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Run the Application

```bash
# Terminal 1 — Start backend (port 5000)
cd backend
npm start

# Terminal 2 — Start frontend dev server (port 5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

### Seed Sample Data (Optional)

With the backend running:

```bash
cd backend
node seed.js
```

---

## REST API Endpoints

| Method   | Endpoint           | Description                                   |
|----------|--------------------|-----------------------------------------------|
| `GET`    | `/api/tasks`       | List tasks (supports `?search`, `?status`, `?priority`, `?sort`, `?order`) |
| `GET`    | `/api/tasks/stats` | Dashboard statistics (counts by status, priority, overdue) |
| `GET`    | `/api/tasks/:id`   | Get single task by ID                         |
| `POST`   | `/api/tasks`       | Create a new task                             |
| `PUT`    | `/api/tasks/:id`   | Update an existing task                       |
| `DELETE` | `/api/tasks/:id`   | Delete a task                                 |
| `GET`    | `/api/health`      | Health check                                  |

---

## Frontend Build

```bash
cd frontend
npm run build
```

Production output is in `frontend/dist/`.

---

## Environment Variables (backend/.env)

| Variable      | Default                   | Description           |
|---------------|---------------------------|-----------------------|
| `PORT`        | `5000`                    | Backend server port   |
| `DB_PATH`     | `./database/tasks.db`     | SQLite database path  |
| `CORS_ORIGIN` | `http://localhost:5173`   | Allowed CORS origin   |
