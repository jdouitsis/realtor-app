import { Upload, X } from 'lucide-react'
import * as React from 'react'
import { type DropzoneOptions, useDropzone } from 'react-dropzone'

import { Button, Progress } from '@/components/ui'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onUpload?: (files: File[]) => void
  accept?: DropzoneOptions['accept']
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  className?: string
}

interface UploadedFile {
  file: File
  progress: number
  preview?: string
}

/**
 * Drag and drop file upload with preview and progress.
 *
 * @example
 * <FileUpload
 *   onUpload={(files) => handleUpload(files)}
 *   accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
 *   maxFiles={5}
 * />
 */
export function FileUpload({
  onUpload,
  accept,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024,
  disabled,
  className,
}: FileUploadProps) {
  const [files, setFiles] = React.useState<UploadedFile[]>([])

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }))
      setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles))
      onUpload?.(acceptedFiles)
    },
    [maxFiles, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  React.useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [files])

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8',
          'transition-colors duration-150',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm text-primary">Drop the files here...</p>
        ) : (
          <>
            <p className="text-sm font-medium">Drag & drop files here</p>
            <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.file.name}-${index}`}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              {file.preview && (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="h-10 w-10 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{file.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.file.size / 1024).toFixed(1)} KB
                </p>
                {file.progress > 0 && file.progress < 100 && (
                  <Progress value={file.progress} className="mt-1 h-1" />
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
