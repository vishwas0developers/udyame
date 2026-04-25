import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.redis_client import redis_client

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Redis-backed sliding window rate limiter.
    Limits requests per IP address for API endpoints.
    """
    async def dispatch(self, request: Request, call_next):
        # Only limit API v1 endpoints, excluding health check
        if not request.url.path.startswith("/api/v1") or request.url.path.endswith("/health"):
            return await call_next(request)

        client_ip = request.client.host
        key = f"rate_limit:{client_ip}"
        
        # Configuration (could be moved to settings)
        LIMIT = 60  # requests
        WINDOW = 60 # seconds (1 minute)
        
        if not redis_client.redis:
            return await call_next(request)

        try:
            now = time.time()
            
            # Using Redis pipeline for atomicity and performance
            pipe = redis_client.redis.pipeline()
            # 1. Remove expired timestamps
            pipe.zremrangebyscore(key, 0, now - WINDOW)
            # 2. Count remaining timestamps in the window
            pipe.zcard(key)
            # 3. Add current timestamp
            pipe.zadd(key, {str(now): now})
            # 4. Refresh TTL for the key
            pipe.expire(key, WINDOW)
            
            results = await pipe.execute()
            request_count = results[1]
            
            if request_count >= LIMIT:
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return Response(
                    content='{"detail": "Rate limit exceeded. Please try again in a minute."}',
                    status_code=429,
                    media_type="application/json"
                )
                
        except Exception as e:
            logger.error(f"Rate limiter error: {e}")
            # Fail-safe: allow request if Redis fails
            return await call_next(request)

        return await call_next(request)
