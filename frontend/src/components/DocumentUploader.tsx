import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { UploadCloud } from 'lucide-react';
import axios from 'axios';

/**
 * Secure Document Uploader
 * Uses Presigned POST policies to upload files directly to MinIO from the browser.
 */
export const DocumentUploader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Get Presigned Upload Policy/URL from Backend
      const { data: uploadPolicy } = await axios.post('/api/v1/documents/upload-policy', {
        filename: file.name,
        contentType: file.type
      });

      // 2. Upload directly to MinIO using the policy (Multipart Form)
      const formData = new FormData();
      Object.entries(uploadPolicy.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      await axios.post(uploadPolicy.url, formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setProgress(percent);
        },
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 3. Notify Backend that upload is complete for metadata syncing
      await axios.patch(`/api/v1/documents/${uploadPolicy.document_id}/complete`);

      toast.success("Upload Successful!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload Failed", {
        description: "Check CORS or network settings."
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

  return (
    <div {...getRootProps()} className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors">
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <UploadCloud className="h-10 w-10 text-slate-400" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop the file here...</p>
        ) : (
          <p className="text-slate-600">Drag & drop a file here, or click to select</p>
        )}
        <p className="text-xs text-slate-400">PDF, Excel, or PNG/JPG (Max 10MB)</p>
      </div>
      
      {uploading && (
        <div className="mt-4">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs mt-1 text-slate-500">Uploading: {progress}%</p>
        </div>
      )}
    </div>
  );
};
