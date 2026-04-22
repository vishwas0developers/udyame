import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface DocumentDownloaderProps {
  documentId: string;
  fileName: string;
}

/**
 * Secure Document Downloader
 * Fetches a TTL-based Presigned URL from the backend and triggers direct browser download.
 */
export const DocumentDownloader: React.FC<DocumentDownloaderProps> = ({ documentId, fileName }) => {
  const [loading, setLoading] = useState(false);


  const handleDownload = async () => {
    setLoading(true);
    try {
      // Request Presigned URL from Backend (No direct MinIO credentials in frontend)
      const response = await axios.get(`/api/v1/documents/${documentId}/download-url`);
      const { presigned_url } = response.data;

      if (!presigned_url) throw new Error("Failed to retrieve signed URL");

      // Redirect browser to MinIO Presigned Link for secure direct download
      window.open(presigned_url, '_blank');

      toast.success("Download Started", {
        description: `Downloading ${fileName}...`,
      });
    } catch (error) {
      console.error("Storage Error:", error);
      toast.error("Download Failed", {
        description: "Could not retrieve secure download link. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleDownload} 
      disabled={loading}
      className="flex items-center gap-2"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DownloadCloud className="h-4 w-4" />}
      Download {fileName}
    </Button>
  );
};
