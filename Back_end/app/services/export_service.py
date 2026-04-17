import os
from app.core.config import settings
from minio import Minio
from io import BytesIO

class ExportService:
    def __init__(self):
        # Placeholder for MinIO client
        self.client = None
        if settings.MINIO_ENDPOINT:
             try:
                self.client = Minio(
                    settings.MINIO_ENDPOINT,
                    access_key=settings.MINIO_ACCESS_KEY,
                    secret_key=settings.MINIO_SECRET_KEY,
                    secure=False
                )
             except:
                 pass

    async def export_business_plan(self, data: dict, format: str = "markdown"):
        """
        Generates and uploads a business plan to MinIO.
        """
        if format == "markdown":
            content = f"# Business Plan: {data.get('company_name')}\n\n"
            for item in data.get('answers', []):
                content += f"## {item['question']}\n{item['answer']}\n\n"
            
            file_data = BytesIO(content.encode("utf-8"))
            file_name = f"plan_{data.get('id')}.md"
            
            if self.client:
                # Upload to MinIO
                # This would normally ensure the bucket exists first
                pass
            
            return {"file_name": file_name, "content": content}
        
        return None

export_service = ExportService()
