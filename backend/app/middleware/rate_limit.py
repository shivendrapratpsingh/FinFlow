"""FinFlow — Simple Redis-backed Rate Limiting Middleware."""
import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiter.
    In production, replace with Redis-backed sliding window.
    """
    LIMITS = {
        "/api/v1/auth/login": (5, 60),       # 5 req / 60 sec
        "/api/v1/auth/send-otp": (3, 60),    # 3 req / 60 sec
        "default": (100, 60),                 # 100 req / 60 sec
    }

    def __init__(self, app):
        super().__init__(app)
        self._counters: dict = {}

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        client_ip = request.client.host if request.client else "unknown"

        limit, window = self.LIMITS.get(path, self.LIMITS["default"])
        key = f"{client_ip}:{path}"
        now = time.time()

        bucket = self._counters.get(key, {"count": 0, "reset_at": now + window})

        if now > bucket["reset_at"]:
            bucket = {"count": 0, "reset_at": now + window}

        bucket["count"] += 1
        self._counters[key] = bucket

        if bucket["count"] > limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down."},
                headers={"Retry-After": str(int(bucket["reset_at"] - now))},
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - bucket["count"]))
        return response
