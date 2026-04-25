import redis.asyncio as redis
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self.redis: redis.Redis = None

    async def connect(self):
        try:
            self.redis = await redis.from_url(
                settings.redis_connection_url,
                encoding="utf-8",
                decode_responses=True
            )
            await self.redis.ping()
            logger.info("Connected to Redis successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise e

    async def disconnect(self):
        if self.redis:
            await self.redis.close()
            logger.info("Disconnected from Redis")

    async def set(self, key: str, value: str, expire: int = None):
        if not self.redis:
            await self.connect()
        return await self.redis.set(key, value, ex=expire)

    async def get(self, key: str):
        if not self.redis:
            await self.connect()
        return await self.redis.get(key)

    async def delete(self, key: str):
        if not self.redis:
            await self.connect()
        return await self.redis.delete(key)

redis_client = RedisClient()
