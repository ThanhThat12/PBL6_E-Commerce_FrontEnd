import React, { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

/**
 * ImageUpload Component - Upload hình ảnh với drag & drop
 * 
 * @param {function} onUpload - Callback khi upload (nhận file hoặc array files)
 * @param {boolean} multiple - Cho phép upload nhiều file
 * @param {number} maxSize - Kích thước tối đa (MB)
 * @param {array} acceptedFormats - Các format được chấp nhận
 * @param {string} preview - URL preview image hiện tại
 * @param {string} className - Custom classes
 */
const ImageUpload = ({ 
  onUpload,
  multiple = false,
  maxSize = 5, // MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  preview = null,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState(preview ? [preview] : []);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `File ${file.name} không đúng định dạng. Chỉ chấp nhận: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      return `File ${file.name} vượt quá kích thước cho phép (${maxSize}MB)`;
    }

    return null;
  };

  const handleFiles = (files) => {
    setError('');
    const fileArray = Array.from(files);

    // Validate files
    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Limit number of files if not multiple
    const filesToProcess = multiple ? fileArray : [fileArray[0]];

    // Create preview URLs
    const urls = filesToProcess.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setSelectedFiles(filesToProcess);

    // Callback
    if (onUpload) {
      onUpload(multiple ? filesToProcess : filesToProcess[0]);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke old URL
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);

    if (onUpload) {
      onUpload(multiple ? newFiles : newFiles[0] || null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative
          border-2 
          border-dashed 
          rounded-lg 
          p-8
          text-center
          cursor-pointer
          transition-all
          duration-300
          ${isDragging 
            ? 'border-primary-500 bg-primary-50 scale-105' 
            : 'border-border hover:border-primary-400 hover:bg-background-secondary'
          }
          ${error ? 'border-error bg-accent-red-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          className="hidden"
          aria-label="Upload file"
        />

        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className={`
            w-16 h-16 
            rounded-full 
            flex items-center justify-center
            mb-4
            transition-colors
            ${isDragging ? 'bg-primary-100' : 'bg-neutral-100'}
          `}>
            {isDragging ? (
              <CloudArrowUpIcon className="w-8 h-8 text-primary-500" />
            ) : (
              <PhotoIcon className="w-8 h-8 text-neutral-500" />
            )}
          </div>

          {/* Text */}
          <p className="text-base font-semibold text-text-primary mb-1">
            {isDragging ? 'Thả file vào đây' : 'Nhấn để chọn hoặc kéo thả file'}
          </p>
          <p className="text-sm text-text-tertiary">
            {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} 
            {' '}(Tối đa {maxSize}MB)
          </p>
          {multiple && (
            <p className="text-xs text-text-tertiary mt-1">
              Có thể upload nhiều file cùng lúc
            </p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 text-sm text-error flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Preview Images */}
      {previewUrls.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-border shadow-soft"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
                className="
                  absolute 
                  top-2 
                  right-2 
                  w-6 h-6 
                  bg-error 
                  text-white 
                  rounded-full 
                  flex items-center justify-center
                  opacity-0 
                  group-hover:opacity-100
                  transition-opacity
                  hover:bg-accent-red-700
                "
                aria-label="Remove image"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
              {selectedFiles[index] && (
                <p className="text-xs text-text-tertiary mt-1 truncate">
                  {selectedFiles[index].name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
