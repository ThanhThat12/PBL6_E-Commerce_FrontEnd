// src/components/common/ImageUploader.jsx

import React, { useState, useRef } from 'react';
import { uploadReviewImages, validateImageFile } from '../../services/cloudinaryService';
import './ImageUploader.css';

/**
 * ImageUploader Component
 * 
 * Reusable component for uploading images to Cloudinary
 * 
 * Props:
 * - maxImages: Maximum number of images (default: 5)
 * - onUploadSuccess: Callback when upload succeeds (urls)
 * - onUploadError: Callback when upload fails (error)
 * - uploadType: 'avatar' | 'product' | 'review' (default: 'review')
 */
const ImageUploader = ({
  maxImages = 5,
  onUploadSuccess,
  onUploadError,
  uploadType = 'review'
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    if (selectedFiles.length + files.length > maxImages) {
      if (onUploadError) {
        onUploadError(new Error(`Chỉ được chọn tối đa ${maxImages} ảnh`));
      }
      return;
    }

    // Validate each file
    try {
      files.forEach(file => validateImageFile(file));
    } catch (error) {
      if (onUploadError) {
        onUploadError(error);
      }
      return;
    }

    // Add files to selected files
    setSelectedFiles(prev => [...prev, ...files]);

    // Generate preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  /**
   * Remove selected file
   */
  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      // Revoke object URL to free memory
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  /**
   * Upload images to Cloudinary
   */
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      if (onUploadError) {
        onUploadError(new Error('Chưa chọn ảnh nào'));
      }
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload all images
      const urls = await uploadReviewImages(selectedFiles);
      
      setUploadProgress(100);
      
      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(urls);
      }

      // Reset state
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload failed:', error);
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Clear all selected files
   */
  const handleClear = () => {
    setSelectedFiles([]);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader">
      {/* File Input */}
      <div className="upload-input-section">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileSelect}
          disabled={uploading || selectedFiles.length >= maxImages}
          className="file-input"
          id="image-upload-input"
        />
        <label 
          htmlFor="image-upload-input" 
          className={`upload-label ${uploading || selectedFiles.length >= maxImages ? 'disabled' : ''}`}
        >
          <span className="upload-icon">📷</span>
          <span className="upload-text">
            {selectedFiles.length === 0 
              ? 'Chọn ảnh' 
              : `Đã chọn ${selectedFiles.length}/${maxImages} ảnh`}
          </span>
        </label>
        <p className="upload-hint">
          Tối đa {maxImages} ảnh, mỗi ảnh &lt; 5MB (JPEG, PNG, GIF, WEBP)
        </p>
      </div>

      {/* Preview Section */}
      {previewUrls.length > 0 && (
        <div className="preview-section">
          <div className="preview-grid">
            {previewUrls.map((url, index) => (
              <div key={index} className="preview-item">
                <img src={url} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveFile(index)}
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="upload-actions">
            <button
              type="button"
              className="btn-clear"
              onClick={handleClear}
              disabled={uploading}
            >
              Xóa tất cả
            </button>
            <button
              type="button"
              className="btn-upload"
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? 'Đang tải lên...' : 'Tải lên'}
            </button>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="upload-progress">
              <div 
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
