"""FinFlow — Request/Response Logging Middleware."""
import time
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from loguru import logger


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())[:8]
        start_time = time.time()

        # Add request ID header
        request.state.request_id = request_id

        try:
            response = await call_next(request)
        except Exception as e:
            logger.error(f"[{request_id}] Unhandled error: {e}")
            raise

        duration_ms = round((time.time() - start_time) * 1000, 2)
        status = response.status_code

        log_fn = logger.info if status < 400 else logger.warning
        log_fn(
            f"[{request_id}] {request.method} {request.url.path} "
            f"→ {status} ({duration_ms}ms)"
        )

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration_ms}ms"
        return response
