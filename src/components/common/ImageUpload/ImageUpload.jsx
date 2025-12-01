import React, { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';
import { IMAGE_UPLOAD } from '../../../utils/constants';

/**
 * ImageUpload Component
 * Drag-and-drop image upload zone with validation, progress tracking, and preview
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onFilesAdded - Callback when files are added
 * @param {Array} props.files - Current files in upload queue
 * @param {Object} props.progress - Progress for each file (fileId: percentage)
 * @param {Object} props.errors - Errors for each file (fileId: errorMessage)
 * @param {Function} props.onRemoveFile - Callback to remove a file
 * @param {Function} props.onRetryUpload - Callback to retry failed upload
 * @param {boolean} props.multiple - Allow multiple file selection
 * @param {number} props.maxFiles - Maximum number of files
 * @param {boolean} props.disabled - Disable upload zone
 * @param {string} props.accept - Accepted file types
 * @param {string} props.label - Label text for upload zone
 * @param {string} props.helpText - Help text displayed below label
 */
const ImageUpload = ({
  onFilesAdded,
  files = [],
  progress = {},
  errors = {},
  onRemoveFile,
  onRetryUpload,
  multiple = true,
  maxFiles = 10,
  disabled = false,
  accept = 'image/jpeg,image/png,image/webp',
  label = 'Upload Images',
  helpText = 'Drag and drop images here, or click to select files',
}) => {
  // Calculate if max files reached
  const isMaxFilesReached = files.length >= maxFiles;

  // Dropzone callback for file drop/selection
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (disabled || isMaxFilesReached) {
        return;
      }

      // Call parent callback with accepted files
      if (onFilesAdded) {
        onFilesAdded(acceptedFiles);
      }

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rejection) => {
          console.warn('File rejected:', rejection.file.name, rejection.errors);
        });
      }
    },
    [disabled, isMaxFilesReached, onFilesAdded]
  );

  // Configure react-dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple,
    maxFiles: maxFiles - files.length,
    disabled: disabled || isMaxFilesReached,
    maxSize: IMAGE_UPLOAD.maxFileSize,
  });

  // Get dropzone class names
  const dropzoneClassName = useMemo(() => {
    let classes = 'relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ';
    
    if (isDragActive && !isDragReject) {
      classes += 'border-primary-500 bg-primary-100 ';
    } else if (isDragReject) {
      classes += 'border-red-500 bg-red-50 ';
    } else if (disabled || isMaxFilesReached) {
      classes += 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed ';
    } else {
      classes += 'border-gray-300 hover:border-primary-500 hover:bg-primary-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 ';
    }
    
    return classes;
  }, [isDragActive, isDragReject, disabled, isMaxFilesReached]);

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get status icon for file
  const getFileStatusIcon = (file) => {
    if (file.status === 'completed') {
      return (
        <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (file.status === 'error') {
      return (
        <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (file.status === 'pending' && progress[file.id] > 0) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
          {label}
          {multiple && maxFiles && (
            <span className="text-xs font-normal text-gray-500 ml-2">
              {files.length} / {maxFiles}
            </span>
          )}
        </label>
      )}

      {/* Dropzone */}
      <div {...getRootProps({ className: dropzoneClassName })}>
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center">
          {/* Upload icon */}
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Text */}
          <div className="space-y-1">
            {isDragActive && !isDragReject && (
              <p className="text-base font-medium text-primary-600">Drop images here...</p>
            )}
            {isDragReject && (
              <p className="text-base font-medium text-red-600">Some files are not supported</p>
            )}
            {!isDragActive && !isMaxFilesReached && (
              <>
                <p className="text-sm text-gray-600">{helpText}</p>
                <p className="text-xs text-gray-500">
                  {IMAGE_UPLOAD.formats.join(', ')} up to{' '}
                  {formatFileSize(IMAGE_UPLOAD.maxFileSize)}
                </p>
              </>
            )}
            {isMaxFilesReached && (
              <p className="text-sm text-yellow-600">Maximum {maxFiles} files reached</p>
            )}
          </div>
        </div>
      </div>

      {/* File Preview List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => {
            const fileProgress = progress[file.id] || 0;
            const fileError = errors[file.id];
            const isUploading = file.status === 'pending' && fileProgress > 0;
            
            const itemClassName = 'flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ' +
              (file.status === 'error' ? 'border-red-300 bg-red-50 ' : '') +
              (file.status === 'completed' ? 'border-green-300 bg-green-50 ' : '') +
              (!file.status || file.status === 'pending' ? 'border-gray-200 bg-white ' : '');

            return (
              <div key={file.id} className={itemClassName}>
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  {file.preview && (
                    <img className="w-full h-full object-cover" src={file.preview} alt={file.name} />
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</div>
                  
                  {/* Progress bar */}
                  {isUploading && (
                    <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary-600 transition-all duration-300 ease-out"
                        style={{ width: `${fileProgress}%` }}
                      />
                      <span className="absolute top-0 right-0 text-xs text-gray-600 -mt-5">{fileProgress}%</span>
                    </div>
                  )}
                  
                  {/* Error message */}
                  {fileError && (
                    <div className="text-xs text-red-600 mt-1">{fileError}</div>
                  )}
                </div>

                {/* Status icon */}
                <div className="flex-shrink-0">
                  {getFileStatusIcon(file)}
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {file.status === 'error' && onRetryUpload && (
                    <button
                      type="button"
                      onClick={() => onRetryUpload(file.id)}
                      className="p-1.5 rounded-md text-blue-600 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                      title="Retry upload"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  
                  {onRemoveFile && !isUploading && (
                    <button
                      type="button"
                      onClick={() => onRemoveFile(file.id)}
                      className="p-1.5 rounded-md text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                      title="Remove file"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

ImageUpload.propTypes = {
  onFilesAdded: PropTypes.func,
  files: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      status: PropTypes.oneOf(['pending', 'uploading', 'completed', 'error', 'cancelled']),
      preview: PropTypes.string,
    })
  ),
  progress: PropTypes.objectOf(PropTypes.number),
  errors: PropTypes.objectOf(PropTypes.string),
  onRemoveFile: PropTypes.func,
  onRetryUpload: PropTypes.func,
  multiple: PropTypes.bool,
  maxFiles: PropTypes.number,
  disabled: PropTypes.bool,
  accept: PropTypes.string,
  label: PropTypes.string,
  helpText: PropTypes.string,
};

export default ImageUpload;
