// lib/useFileUpload.ts
import { useCallback } from 'react';

export function useFileUpload() {
  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handleDocumentUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('http://localhost:5000/translate_document', {
        method: 'POST',
        body: formData,
      });
      const blob = await response.blob();
      downloadFile(blob, 'translated.txt');
    }
  }, []);

  return { handleDocumentUpload };
}