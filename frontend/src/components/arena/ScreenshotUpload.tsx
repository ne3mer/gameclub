'use client';

import { useState, useRef } from 'react';
import { Icon } from '@/components/icons/Icon';
import { API_BASE_URL } from '@/lib/api';

interface ScreenshotUploadProps {
  onUpload: (url: string) => void;
  maxSize?: number; // in bytes, default 5MB
  acceptedTypes?: string[];
}

export default function ScreenshotUpload({ 
  onUpload, 
  maxSize = 5 * 1024 * 1024,
  acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg']
}: ScreenshotUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!acceptedTypes.includes(file.type)) {
      setError('فرمت فایل نامعتبر است. لطفاً تصویر PNG یا JPG آپلود کنید.');
      return;
    }

    if (file.size > maxSize) {
      setError(`حجم فایل نباید بیشتر از ${maxSize / (1024 * 1024)} مگابایت باشد.`);
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('screenshot', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/arena/upload/screenshot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('خطا در آپلود فایل');
      }

      const data = await response.json();
      onUpload(data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('خطا در آپلود تصویر. لطفاً مجدداً تلاش کنید.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      // Create a synthetic event to reuse handleFileSelect logic
      // Or just call uploadFile directly if validation passes
      if (!acceptedTypes.includes(file.type) || file.size > maxSize) {
         // Let handleFileSelect handle validation if we could trigger it, 
         // but easier to just duplicate validation or extract it.
         // For brevity, let's just set the input files
         const dataTransfer = new DataTransfer();
         dataTransfer.items.add(file);
         fileInputRef.current.files = dataTransfer.files;
         
         // Trigger change event manually or call handler
         const event = { target: { files: fileInputRef.current.files } } as React.ChangeEvent<HTMLInputElement>;
         handleFileSelect(event);
    }
  }};

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={acceptedTypes.join(',')}
        className="hidden"
      />

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed border-slate-700 rounded-2xl p-8
            flex flex-col items-center justify-center cursor-pointer
            hover:border-purple-500 hover:bg-slate-800/50 transition-all
            ${error ? 'border-red-500/50 bg-red-500/5' : ''}
          `}
        >
          {uploading ? (
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mb-2" />
          ) : (
            <Icon name="upload" size={32} className="text-slate-400 mb-2" />
          )}
          <p className="text-sm text-slate-300 font-bold mb-1">
            {uploading ? 'در حال آپلود...' : 'آپلود اسکرین‌شات'}
          </p>
          <p className="text-xs text-slate-500">
            کلیک کنید یا فایل را اینجا رها کنید
          </p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 group">
          <img src={preview} alt="Screenshot preview" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => {
                setPreview(null);
                fileInputRef.current!.value = '';
              }}
              className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition"
            >
              <Icon name="trash" size={20} />
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
          <Icon name="alert" size={12} />
          {error}
        </p>
      )}
    </div>
  );
}
