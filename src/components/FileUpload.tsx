import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
  label?: string;
  progress?: number;
  uploading?: boolean;
}

export default function FileUpload({
  onFileSelect,
  accept = {
    'video/*': ['.mp4', '.mov', '.avi', '.wmv'],
    'image/*': ['.png', '.jpg', '.jpeg', '.gif']
  },
  maxSize = 100 * 1024 * 1024, // 100MB
  className,
  label = 'Drop files here or click to browse',
  progress = 0,
  uploading = false
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      if (rejectedFiles[0].errors[0].code === 'file-too-large') {
        setError(`File is too large. Max size is ${Math.round(maxSize / (1024 * 1024))}MB`);
      } else {
        setError(rejectedFiles[0].errors[0].message);
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      onFileSelect(acceptedFiles[0]);
      setError(null);
    }
  }, [maxSize, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer',
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:bg-gray-50',
          error && 'border-red-500'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-10 h-10 mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            {isDragActive ? 'Drop the files here' : label}
          </p>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {Object.keys(accept).join(', ')}
          </p>
        </div>
           {file && (
        <div className="w-full mt-4">
          {uploading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <div className="text-sm text-center text-gray-500">
              Selected: {file.name} ({Math.round(file.size / 1024)} KB)
            </div>
          )}
        </div>
      )}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
      
      {file && (
        <div className="flex justify-end mt-4">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
            }}
            variant="outline"
            className="mr-2"
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}
