# ⏳ TimeBank — Community Skill Exchange Platform

TimeBank is a decentralized, community-driven skill exchange web platform built on the principle of **equal-value time currency**:
$$\text{1 Hour of Service Provided} = \text{1 Time Credit Earned}$$

Whether someone teaches quantum physics, repairs a bicycle, speaks conversational Spanish, or mentors in Python architecture, **every human hour is valued equally**.

---

## 🎯 Presentation Highlights & Key Capabilities

### 1. 🔐 Complete Authentication & RBAC Integrity
- **Local Credentials**: Secure user registration & login hashed with **bcrypt**, sessions managed via **HttpOnly, SameSite JWT cookies** with cross-origin Bearer token fallback.
- **Google OAuth 2.0**: Direct "Sign in with Google" integration powered by Google Identity Services (GIS) with server-side token validation against Google's public keys.
- **Role-Based Access Control (RBAC)**: Strict role separation between standard **Members** and **Administrators** (`verify_token` & `verify_admin` dependencies).
- **Security Protections**: Auto-lockout for banned accounts, input sanitization, and strict CORS configuration.

### 2. 👥 Zero-Mock Live Community Directory
- **100% Database-Driven**: All mock datasets have been completely removed.
- **Dynamic Member Profiles**: Real-time listing of active registered members, avatars, neighborhood locations, bio, offering/seeking skills, and ratings.
- **Live Match & Compatibility**: Dynamic algorithm scoring compatibility based on shared availability, category alignment, and distance.

### 3. ⏱️ Decentralized Time Wallet & Escrow Ledger
- **Initial Welcome Balance**: Every newly registered user automatically starts with **10.0 Time Credits**.
- **Atomic Escrow Engine**:
  - When booking a swap session, credits are placed into **Escrow** (`in_escrow`) and held securely.
  - Upon session completion by the requester, credits are released to the provider's wallet.
  - If a session is cancelled, credits are instantly refunded to the requester.
- **Live Ledger**: Full transaction history showing earned credits, spent credits, and active escrow holds.

### 4. 🛡️ Comprehensive Admin Portal (`/admin`)
- **System Metrics**: Live stats for total users, active vs. banned members, admin count, skills catalog, total credits in circulation, credits held in escrow, and total swaps completed.
- **Member Management**: Filter by status (`active` / `banned`) or role (`user` / `admin`), instant name/email/location search, and pagination.
- **Deep User Inspection**: Modal showing full profile details, onboarding progress, contact info, offered/sought skills, and complete booking history.
- **Administrative Moderation**:
  - One-click **Ban / Unban** (with self-ban prevention for safety).
  - One-click **Role Promotion / Demotion** (`user` $\leftrightarrow$ `admin`).
  - **Credit Balance Adjustments** directly from the admin panel.

---

## 🏗️ Architecture & Monorepo Structure

```
TimeBank_Project/
├── backend/                       # FastAPI High-Performance Python Backend
│   ├── alembic/                   # Database schema migrations (001, 002, 003)
│   ├── app/
│   │   ├── models/                # SQLAlchemy ORM (User, Skill, UserSkill, Booking)
│   │   ├── schemas/               # Pydantic schemas for requests, responses & admin
│   │   ├── routers/               # auth, users, skills, bookings, admin
│   │   ├── utils/                 # Security (bcrypt, JWT, Google GIS verification)
│   │   ├── config.py              # Environment configuration & CORS resolution
│   │   ├── database.py            # Engine & session management
│   │   ├── dependencies.py        # RBAC & authentication guards
│   │   └── main.py                # FastAPI entrypoint
│   ├── scripts/
│   │   └── seed.py                # Database seeder (admin, demo user, catalog skills)
│   ├── tests/
│   │   └── test_api.py            # Comprehensive pytest test suite (4/4 passing)
│   ├── Dockerfile                 # Production backend container
│   ├── requirements.txt           # Python dependencies
│   └── .env.example               # Backend environment template
│
├── frontend/                      # React 19 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── api/                   # Universal client (HttpOnly cookies + Bearer auth)
│   │   ├── context/               # AuthContext & TimeBankContext (live state & bookings)
│   │   ├── components/            # Navbar, Sidebar, Modals, ProtectedRoute
│   │   ├── pages/                 # LoginPage, SignupPage, AdminPage
│   │   ├── views/                 # LandingView, DashboardView, DiscoverView,
│   │   │                          # MySkillsView, CreditHistoryView, MemberProfileView,
│   │   │                          # OnboardingView
│   │   └── App.jsx                # Application shell & route manager
│   ├── Dockerfile                 # Production multi-stage Nginx container
│   ├── nginx.conf                 # Nginx SPA reverse proxy & static routing
│   └── package.json               # Node dependencies & scripts
│
├── docker-compose.yml             # MySQL 8.0 container service
└── README.md                      # Project documentation & presentation guide
```

---

## 🚀 Quickstart & Presentation Setup

### Step 1: Database (MySQL 8.0)

Using Docker Compose:
```bash
docker compose up -d
```
*MySQL is now reachable at `localhost:3307` (or `3306` based on your docker-compose mapping) with database `timebank_db`.*

---

### Step 2: Backend Setup & Seeding

In a terminal window:
```bash
cd backend

# 1. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply all database migrations (including bookings & escrow)
alembic upgrade head

# 4. Seed initial skills & test accounts
python scripts/seed.py

# 5. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

- **Backend API URL**: `http://localhost:8000`
- **Swagger / Interactive OpenAPI Docs**: `http://localhost:8000/docs`
- **Health Check Endpoint**: `http://localhost:8000/health`

---

### Step 3: Frontend Setup

In a second terminal window:
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

- **Frontend Application URL**: `http://localhost:5173`

---

## 👥 Seeded Credentials for Demo

Use these pre-configured accounts during the presentation:

| Role | Email | Password | What to Demo |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@timebank.org` | `AdminPassword123!` | System metrics, all registered users, ban/unban, role changes, credit adjustments. |
| **Member** | `alex@timebank.org` | `Password123!` | Member dashboard, skill offerings, booking swaps, releasing escrow, wallet ledger. |

*(You can also sign up brand-new accounts via the Sign Up form or Sign In with Google!)*

---

## 🎬 Recommended 5-Minute Demo Flow

1. **Landing Page (`/`)**:
   - Present the core concept: 1 hour = 1 credit.
   - Show the dynamic "Meet Community Members Ready to Swap" section pulling real registered profiles.
2. **Authentication Flow (`/signup` & `/login`)**:
   - Register a new user or log in with Google GIS.
   - Point out that new users immediately receive **10.0 Time Credits**.
3. **Skills & Profile Setup (`/onboarding` & `/my-skills`)**:
   - Add a skill offering (e.g. *Python Programming* or *Conversational Spanish*).
   - Show how the skill appears instantly in the platform's global catalog and community feed.
4. **Discover & Book a Swap (`/discover`)**:
   - Search for a skill or filter by category.
   - Click **Request (1 Cr)** on another registered member.
   - Confirm booking in the modal $\rightarrow$ celebrate with confetti and observe **1.0 credit moved into Escrow**.
5. **Wallet Ledger & Completion (`/wallet` & `/my-skills`)**:
   - View the Escrow section in My Skills.
   - Click **Confirm & Release** $\rightarrow$ credit transfers from escrow to provider; view ledger transaction.
6. **Administrator Portal (`/admin`)**:
   - Log in as `admin@timebank.org`.
   - Review live platform-wide metrics (active users, credits in circulation, completed swaps).
   - Search registered members, inspect their detail card, promote a member, or adjust credits.

---

## 🧪 Testing & Verification

### Run Backend Test Suite (100% Pass)
```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. pytest -v tests/
```
Tests cover:
- User signup, duplicate rejection, and profile updates.
- Skill catalog creation and duplicate checks.
- RBAC permissions, admin statistics, and account ban enforcement.
- Live community listing, booking creation, escrow credit deductions, session completion, and cancellation refunds.

### Lint & Production Build
```bash
cd frontend
npm run lint    # oxlint - 0 errors
npm run build   # vite build - production bundle
```

---

## 🐳 Production Deployment

Both frontend and backend are containerized and ready for cloud deployment (Docker, GCP Cloud Run, AWS ECS, or Render):

```bash
# Build and run backend container
docker build -t timebank-backend ./backend
docker run -p 8000:8000 --env-file backend/.env timebank-backend

# Build and run frontend container
docker build -t timebank-frontend ./frontend
docker run -p 80:80 timebank-frontend
```
