# Backend Architecture Guide

> This document defines the standard directory structure and conventions for the backend application. It is designed to be **modular** — add or remove features based on your project's needs.

---

## Overview

The backend follows a **feature-based** architecture. The core principle is simple:

> **Source code that serves the same feature lives in the same place.**

Instead of grouping all routes together, all services together, etc., each feature bundles everything it needs — routes, business logic, data access, schemas, and exceptions. This makes a feature fully self-contained: you can read, test, and even delete it without touching the rest of the codebase.

Cross-cutting concerns that span multiple features (database setup, auth middleware, shared exceptions, common utilities) live in a shared `core/` directory.

---

## Directory Tree

```plaintext
backend/
├── src/
│   ├── main.py                  # Application entry point (FastAPI / Flask app factory)
│   │
│   ├── config/                  # Configuration & environment
│   │   ├── settings.py         # Pydantic settings (loaded from env vars)
│   │   └── dependencies.py     # FastAPI dependency injection (shared)
│   │
│   ├── core/                    # Cross-cutting concerns (shared across all features)
│   │   ├── database.py         # DB connection, session, base model
│   │   ├── redis.py            # Redis client setup
│   │   ├── exceptions.py       # Shared exception classes
│   │   ├── middleware.py       # Shared middleware (CORS, logging, timing)
│   │   ├── auth.py             # JWT / OAuth helpers, password hashing
│   │   ├── pagination.py       # Shared pagination logic
│   │   └── types.py            # Shared TypeDefs / base schemas
│   │
│   ├── features/               # Feature modules (self-contained bundles)
│   │   │
│   │   ├── auth/               # Authentication & authorization
│   │   │   ├── __init__.py
│   │   │   ├── routes.py       # Route definitions + decorators
│   │   │   ├── schemas.py      # Request / response Pydantic schemas
│   │   │   ├── service.py      # Business logic (login, register, token refresh)
│   │   │   ├── repository.py   # Data access (user lookup, token storage)
│   │   │   ├── models.py       # ORM models (SQLAlchemy) — optional
│   │   │   ├── dependencies.py # Feature-specific FastAPI dependencies
│   │   │   └── tests/          # Unit / integration tests
│   │   │       ├── test_routes.py
│   │   │       ├── test_service.py
│   │   │       └── test_repository.py
│   │   │
│   │   ├── users/              # User management
│   │   │   ├── __init__.py
│   │   │   ├── routes.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   ├── models.py       # optional
│   │   │   ├── dependencies.py
│   │   │   └── tests/
│   │   │
│   │   ├── posts/              # Blog / content posts
│   │   │   ├── __init__.py
│   │   │   ├── routes.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   ├── models.py
│   │   │   ├── dependencies.py
│   │   │   └── tests/
│   │   │
│   │   ├── uploads/            # File / media uploads
│   │   │   ├── __init__.py
│   │   │   ├── routes.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py
│   │   │   ├── repository.py   # optional — may not need DB for uploads
│   │   │   ├── models.py
│   │   │   ├── dependencies.py
│   │   │   └── tests/
│   │   │
│   │   ├── notifications/      # Email / push notifications
│   │   │   ├── __init__.py
│   │   │   ├── routes.py
│   │   │   ├── schemas.py
│   │   │   ├── service.py      # Composes email provider + queue logic
│   │   │   ├── providers/     # Notification providers (email, push)
│   │   │   │   ├── base.py
│   │   │   │   ├── email.py
│   │   │   │   └── push.py
│   │   │   └── tests/
│   │   │
│   │   └── health/            # Health check endpoint
│   │       ├── __init__.py
│   │       ├── routes.py       # GET /health, GET /ready
│   │       └── tests/
│   │
│   └── utils/                  # Shared pure utility functions (outside any feature)
│       ├── datetime.py         # Date / time helpers
│       ├── string.py           # Slugify, random string generation
│       └── validators.py       # Generic validation helpers
│
├── tests/                      # End-to-end / integration tests
│   ├── fixtures/              # Pytest fixtures (DB session, test client)
│   ├── conftest.py
│   └── e2e/                   # Full-flow end-to-end tests
│
├── scripts/                    # Operational scripts (migrations, seeds, CLI)
│   ├── migrate.py
│   └── seed.py
│
├── pyproject.toml
└── README.md
```

---

## Key Notes

### 1. Feature Modules are Self-Contained (`features/`)

Each feature owns everything it needs. If you want to understand the `auth` feature, you go to `features/auth/` and find routes, service, repository, schemas, and tests — all in one place.

```plaintext
features/auth/
├── routes.py       → FastAPI route decorators (@router.post("/login"))
├── schemas.py     → Pydantic models for request/response validation
├── service.py     → Business logic (register, login, token refresh)
├── repository.py  → Data access (DB queries, user lookup)
├── models.py      → ORM models (SQLAlchemy) — optional
├── dependencies.py → Feature-scoped FastAPI dependencies
└── tests/         → Unit tests for routes, service, repository
```

Not every file is required in every feature. Add a file only when the feature needs it:

|File|Required when...|
|---|---|
|`routes.py`|The feature exposes HTTP endpoints.|
|`schemas.py`|The feature has request/response bodies to validate.|
|`service.py`|The feature has non-trivial business logic.|
|`repository.py`|The feature reads or writes to the database.|
|`models.py`|Using ORM models directly in the feature (otherwise keep in `core/`).|
|`dependencies.py`|The feature has reusable FastAPI dependencies (e.g., `get_current_user`).|
|`tests/`|Always — even if minimal.|

### 2. Shared Core (`core/`)

Only **truly cross-cutting** concerns go here — things that every feature depends on:

|File|Purpose|
|---|---|
|`core/database.py`|DB engine, session factory, `Base` declarative class.|
|`core/redis.py`|Redis client setup.|
|`core/exceptions.py`|Shared exception classes (e.g., `NotFoundError`, `UnauthorizedError`).|
|`core/middleware.py`|Shared middleware (CORS, request logging, response timing).|
|`core/auth.py`|JWT encoding/decoding, password hashing (`bcrypt`), token utilities.|
|`core/pagination.py`|Skip/limit cursor helpers.|
|`core/types.py`|Base Pydantic schemas shared across features (e.g., `BaseResponse`).|

> **Rule of thumb:** If only one feature needs it, it belongs inside that feature. If two or more features need it, consider moving it to `core/`.

### 3. Request Lifecycle

A request flows through layers in this order:

```plaintext
HTTP Request
    │
    ├── core/middleware.py       (CORS, logging, timing)
    │
    ├── features/{name}/routes.py  (route decorator, path params)
    │       │
    │       ├── features/{name}/dependencies.py  (auth check, DB session injection)
    │       │
    │       ├── features/{name}/schemas.py       (request validation)
    │       │
    │       ├── features/{name}/service.py        (business logic)
    │       │       │
    │       │       ├── core/auth.py             (token verification)
    │       │       │
    │       │       └── features/{name}/repository.py  (DB query)
    │       │               │
    │       │               └── core/database.py      (session → DB)
    │       │
    │       └── features/{name}/schemas.py       (response validation)
    │
HTTP Response
```

### 4. Feature-to-Feature Communication

Features should **not** import each other's internals directly. Instead, use the public interface:

```python
# features/posts/service.py

# ✅ Good — import the service's public methods
from features.auth.service import AuthService

class PostService:
    def create_post(self, user_id: str, data: PostCreate) -> Post:
        # Verify the user exists via AuthService, not via PostsRepository
        user = AuthService().get_user_by_id(user_id)
        ...

# ❌ Bad — importing internals from another feature
from features.auth.repository import UserRepository
```

If feature-to-feature coupling grows, consider moving the shared logic to `core/`.

### 5. Data Access Pattern

Data access is always scoped to a feature's `repository.py`. The service layer never speaks to the DB directly — it delegates to the repository.

```python
# features/posts/service.py
class PostService:
    def __init__(self, post_repo: PostRepository):
        self._repo = post_repo

    def get_published_posts(self, page: int, page_size: int) -> list[Post]:
        return self._repo.find_published(offset=(page - 1) * page_size, limit=page_size)
```

```python
# features/posts/repository.py
class PostRepository:
    def __init__(self, session: Session):
        self._session = session

    def find_published(self, offset: int, limit: int) -> list[Post]:
        return self._session.query(Post).filter(...).offset(offset).limit(limit).all()
```

### 6. Exception Handling

Define feature-specific exceptions in `core/exceptions.py` (shared) or inline in the feature. Always catch and return a structured HTTP error from the route layer:

```python
# core/exceptions.py
class AppException(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code

class NotFoundError(AppException):
    status_code = 404

class UnauthorizedError(AppException):
    status_code = 401
```

Exception handlers are registered once in `main.py` and apply globally.

### 7. Configuration (`config/`)

Environment variables are loaded once in `config/settings.py` using Pydantic Settings. Feature code reads from here — **never import `os` directly** in feature code.

```python
# config/settings.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()
```

### 8. Testing Structure

- **Unit tests** live inside each feature's `tests/` folder — test the service and repository in isolation.
- **Integration / fixture tests** live in `tests/fixtures/` and `tests/conftest.py`.
- **End-to-end tests** live in `tests/e2e/` — test full HTTP flows via a test client.

```plaintext
features/auth/
└── tests/
    ├── conftest.py              # Feature-specific fixtures
    ├── test_routes.py           # HTTP endpoint tests
    ├── test_service.py          # Business logic unit tests
    └── test_repository.py       # Data access unit tests (uses a test DB)

tests/
├── conftest.py                  # Shared fixtures (test DB session, test client)
└── e2e/
    └── test_auth_flow.py       # Full login → token → protected route flow
```

Run tests with:

```bash
pytest
# with coverage
pytest --cov=src --cov-report=html
```

---

## Development Commands

See [`test-commands.md`](./test-commands.md) for the full list of available scripts.
