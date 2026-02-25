# 🍳 Grocery Tracker — Backend

FastAPI + PostgreSQL + WebSockets backend for the Roommate Shared Grocery Tracker.

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL 15+

## 🚀 Local Setup

```bash
# 1. Clone & enter directory
cd backend

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate   # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and a strong SECRET_KEY

# 5. Run migrations
alembic upgrade head

# 6. Start the server
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

## 🗄️ Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Async PostgreSQL URL | `postgresql+asyncpg://user:pass@localhost/db` |
| `SECRET_KEY` | JWT signing key | `openssl rand -hex 32` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `10080` (7 days) |
| `CORS_ORIGINS` | Comma-separated allowed origins (use `*` for all) | `*` |

## 🔄 Alembic Migrations

```bash
# Generate new migration after model changes
alembic revision --autogenerate -m "describe change"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

## 🐳 Docker

```bash
docker build -t grocery-tracker-api .
docker run -p 8000:8000 --env-file .env grocery-tracker-api
```

## ☁️ Deploy to Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Runtime** to Python
5. Set **Build Command**: `pip install -r requirements.txt && alembic upgrade head`
6. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add all environment variables from the table above
8. Create a **PostgreSQL** database on Render and use the internal connection URL

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, get JWT |
| POST | `/rooms` | Create room |
| POST | `/rooms/join` | Join by invite code |
| GET | `/rooms/{id}` | Get room details |
| GET | `/rooms/{id}/items` | List items |
| POST | `/rooms/{id}/items` | Add item |
| POST | `/items/{id}/consume` | Log consumption |
| GET | `/rooms/{id}/activity` | Activity feed |
| GET | `/rooms/{id}/summary` | Usage summary |
| WS | `/ws/room/{id}?token=JWT` | Real-time updates |

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── core/
│   │   ├── config.py        # Settings
│   │   └── security.py      # JWT + bcrypt
│   ├── db/
│   │   ├── session.py       # Async engine + session
│   │   └── base.py          # Model imports for Alembic
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic v2 schemas
│   ├── api/
│   │   ├── deps.py          # Auth dependencies
│   │   └── v1/              # Route handlers
│   └── websocket/           # WS manager + router
├── alembic/                 # Migrations
├── Dockerfile
└── requirements.txt
```
