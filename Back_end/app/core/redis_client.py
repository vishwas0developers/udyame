import redis.asyncio as redis
from app.core.config import settings
import logging
import asyncio
import time

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self.redis: redis.Redis = None
        self._lock = asyncio.Lock()
        self._last_attempt = 0
        self._retry_delay = 5 # seconds

    async def connect(self):
        # Prevent thundering herd
        async with self._lock:
            # Check if another thread already connected while we were waiting for the lock
            if self.redis:
                try:
                    await self.redis.ping()
                    return
                except:
                    self.redis = None

            # Don't retry too often if it's failing
            now = time.time()
            if now - self._last_attempt < self._retry_delay:
                return

            self._last_attempt = now
            try:
                self.redis = await redis.from_url(
                    settings.redis_connection_url,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_timeout=2.0,
                    socket_connect_timeout=2.0,
                    retry_on_timeout=False
                )
                await self.redis.ping()
                logger.info("Connected to Redis successfully")
            except Exception as e:
                self.redis = None
                logger.error(f"Failed to connect to Redis: {e}")
                # Don't raise, just log. The middleware will handle it.

    async def disconnect(self):
        async with self._lock:
            if self.redis:
                await self.redis.close()
                self.redis = None
                logger.info("Disconnected from Redis")

    async def get_redis(self):
        if not self.redis:
            await self.connect()
        return self.redis

    async def set(self, key: str, value: str, expire: int = None):
        client = await self.get_redis()
        if client:
            try:
                return await client.set(key, value, ex=expire)
            except Exception as e:
                logger.error(f"Redis SET error: {e}")
                self.redis = None # Trigger reconnect on next call
        return None

    async def get(self, key: str):
        client = await self.get_redis()
        if client:
            try:
                return await client.get(key)
            except Exception as e:
                logger.error(f"Redis GET error: {e}")
                self.redis = None
        return None

    async def delete(self, key: str):
        client = await self.get_redis()
        if client:
            try:
                return await client.delete(key)
            except Exception as e:
                logger.error(f"Redis DELETE error: {e}")
                self.redis = None
        return None

redis_client = RedisClient()
