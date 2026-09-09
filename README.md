# ⏳ TimeBank — Community Skill Exchange Platform (Phase 1 MVP)

TimeBank is a decentralized community skill-exchange platform where members trade knowledge and practical services using **equal-value time credits** (**1 hour of service provided = 1 time credit earned**).

---

## 🏗️ Architecture & Monorepo Structure

This project is organized as an independently runnable monorepo:

```
TimeBank_Project/
├── backend/                  # FastAPI Python service
│   ├── alembic/              # Database schema migrations
│   ├── app/
│   │   ├── models/           # SQLAlchemy ORM models (users, skills, user_skills)
│   │   ├── schemas/          # Pydantic validation & response schemas
│   │   ├── routers/          # API endpoints (auth, users, skills, admin)
│   │   ├── utils/            # Security (bcrypt, PyJWT, Google token verification)
│   │   ├── config.py         # App settings & env loading
│   │   ├── database.py       # SQLAlchemy engine & session factory
│   │   └── main.py           # FastAPI entrypoint with strict CORS
│   ├── scripts/
│   │   └── seed.py           # Seed script for initial skills & admin/test users
│   ├── tests/
│   │   └── test_api.py       # Automated API & RBAC test suite
│   ├── .env.example          # Backend environment template
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # Vite + React 19 + Tailwind CSS SPA
│   ├── src/
│   │   ├── api/              # Universal fetch client (credentials: include)
│   │   ├── context/          # AuthContext (session validation via GET /users/me)
│   │   ├── components/       # ProtectedRoute, Navbar, GoogleSignInButton
│   │   ├── pages/            # LoginPage, SignupPage, DashboardPage, AdminPage
│   │   ├── App.jsx           # App shell & router
│   │   └── index.css         # Custom styling & Tailwind design system
│   ├── .env.example          # Frontend environment template
│   └── package.json          # Frontend scripts and packages
│
├── docker-compose.yml        # Docker service for MySQL 8.0
└── README.md                 # Project documentation & setup guide
```

---

## 🗄️ Database Setup (MySQL)

You can run MySQL using **Docker Compose** (recommended) or your **local MySQL installation**.

### Option A: Using Docker Compose (Fastest)

Ensure Docker Desktop is running, then execute from the project root:

```bash
docker compose up -d
```

This starts a MySQL 8.0 container on `localhost:3306` with:
- **Database:** `timebank_db`
- **User:** `timebank_user`
- **Password:** `timebank_pass`
- **Root Password:** `rootpassword`

To stop the container:
```bash
docker compose down
```

---

### Option B: Local MySQL Installation (macOS / Linux)

1. **Install MySQL via Homebrew (macOS):**
   ```bash
   brew install mysql
   brew services start mysql
   ```

2. **Create the Database and User:**
   ```sql
   mysql -u root -p
   ```
   Execute the following SQL commands:
   ```sql
   CREATE DATABASE IF NOT EXISTS timebank_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER IF NOT EXISTS 'timebank_user'@'localhost' IDENTIFIED BY 'timebank_pass';
   GRANT ALL PRIVILEGES ON timebank_db.* TO 'timebank_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

---

## 🔑 Google Cloud OAuth Setup (Sign in with Google)

To enable **"Sign in with Google"** using Google Identity Services (GIS):

### Step-by-Step Instructions:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. **Create a New Project** (e.g., `TimeBank Dev`).
3. Navigate to **APIs & Services > OAuth consent screen**:
   - Select **External** and click **Create**.
   - Fill in **App Name** (`TimeBank`), **User Support Email**, and **Developer Contact Email**.
   - Click **Save and Continue** through Scopes (default `.../auth/userinfo.email` and `.../auth/userinfo.profile` are sufficient).
   - Under **Test users**, add your personal Google email address.
4. Navigate to **APIs & Services > Credentials**:
   - Click **Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - Name: `TimeBank Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
     - `http://127.0.0.1:5173`
   - **Authorized redirect URIs**:
     - `http://localhost:5173`
5. Click **Create** and copy your **Client ID** (e.g., `1234567890-xyz.apps.googleusercontent.com`).

### Add to Environment Files:

- In `backend/.env`:
  ```env
  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
  ```
- In `frontend/.env`:
  ```env
  VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
  ```

---

## 🚀 Running the Project

### 1. Start Backend Service

```bash
cd backend

# Create & activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Alembic Database Migrations
alembic upgrade head

# Seed Initial Skills & Test Users
python scripts/seed.py

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

- **API Base URL:** `http://localhost:8000`
- **Interactive OpenAPI Documentation:** `http://localhost:8000/docs`

---

### 2. Start Frontend App

In a new terminal window:

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

- **Frontend App:** `http://localhost:5173`

---

## 👥 Seeded Test Credentials

After running `python scripts/seed.py`, you can test with:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@timebank.org` | `AdminPassword123!` | Access to `/dashboard` & `/admin` Portal (user ban/unban, stats) |
| **Member** | `alex@timebank.org` | `Password123!` | Member Dashboard with offering/seeking skills |

---

## 🧪 Testing & Code Quality

### Backend Automated Tests
```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. pytest -v tests/
```

### Frontend Typecheck, Lint & Build
```bash
cd frontend
npm run lint
npm run build
```

---

## 🛡️ Authentication & Security Implementation

1. **HttpOnly Cookie Sessions**:
   - JWT tokens are issued strictly inside `HttpOnly`, `SameSite=Lax` cookies.
   - Frontend never handles or stores raw tokens in `localStorage` / `sessionStorage`, mitigating XSS attacks.
2. **Strict CORS**:
   - FastAPI CORS configured with `allow_credentials=True` restricted specifically to `http://localhost:5173` (no wildcards).
3. **Google OAuth Token Verification**:
   - Google ID tokens are verified server-side via `google-auth` against Google public keys.
   - Prevents silent account takeover if an email already exists under a password login.
4. **Role-Based Access Control (RBAC)**:
   - `verify_token` dependency decodes session cookies and blocks suspended (`banned`) accounts with `403 Forbidden`.
   - `verify_admin` dependency guarantees admin-only routes (`/admin/*`) are protected.
