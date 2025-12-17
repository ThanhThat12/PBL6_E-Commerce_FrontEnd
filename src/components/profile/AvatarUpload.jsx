import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiCamera, FiX, FiUpload } from 'react-icons/fi';
import ImageUploadService from '../../services/ImageUploadService';
import { updateAvatar } from '../../services/userService';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { DEFAULT_AVATAR_IMAGE, handleImageError } from '../../utils/imageDefaults';

/**
 * AvatarUpload Component
 * Allows users to upload and update their profile avatar
 */
const AvatarUpload = ({ currentAvatar, onAvatarUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Vui lòng chọn file ảnh (JPG, PNG, WEBP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setSelectedFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn ảnh trước');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload to Cloudinary via backend
      // Backend: POST /api/users/me/avatar
      // Returns: ResponseDTO<ImageUploadResponse>
      const uploadResult = await ImageUploadService.uploadAvatar(
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      console.log('Avatar upload result:', uploadResult);

      // Extract avatar URL from response
      // uploadResult is already unwrapped by interceptor: { status, message, data: ImageUploadResponse }
      let avatarUrl = null;
      
      if (uploadResult.data?.url) {
        // ImageUploadResponse { id, url, publicId, ... }
        avatarUrl = uploadResult.data.url;
      } else if (uploadResult.url) {
        // Direct url field
        avatarUrl = uploadResult.url;
      }

      if (!avatarUrl) {
        throw new Error('Không nhận được URL ảnh từ server');
      }

      // Update user profile with new avatar URL
      // Backend: PUT /api/user/avatar?avatarUrl=...
      const updateResponse = await updateAvatar(avatarUrl);
      console.log('Update avatar response:', updateResponse);

      if (updateResponse.status === 200) {
        toast.success('Cập nhật ảnh đại diện thành công');
        
        // Notify parent component
        if (onAvatarUpdate) {
          onAvatarUpdate(avatarUrl);
        }

        // Clear preview
        setPreviewUrl(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toast.error(updateResponse.message || 'Cập nhật ảnh đại diện thất bại');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Upload ảnh thất bại';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const displayAvatar = previewUrl || currentAvatar || DEFAULT_AVATAR_IMAGE;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
          <img
            src={displayAvatar}
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={(e) => handleImageError(e, DEFAULT_AVATAR_IMAGE)}
          />
        </div>

        {/* Upload Button Overlay */}
        {!previewUrl && (
          <button
            onClick={handleClickUpload}
            disabled={uploading}
            className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <FiCamera className="w-8 h-8 text-white" />
          </button>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Đang upload...</span>
            <span className="text-sm font-semibold text-primary-600">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {previewUrl && !uploading && (
        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            variant="primary"
            className="flex items-center gap-2"
          >
            <FiUpload className="w-4 h-4" />
            Upload
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FiX className="w-4 h-4" />
            Hủy
          </Button>
        </div>
      )}

      {/* Upload Button (if no preview) */}
      {!previewUrl && !uploading && (
        <Button
          onClick={handleClickUpload}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FiCamera className="w-4 h-4" />
          Chọn Ảnh
        </Button>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="flex items-center gap-2 text-gray-600">
          <Loading size="sm" />
          <span className="text-sm">Đang xử lý...</span>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center max-w-xs">
        JPG, PNG hoặc WEBP. Tối đa 5MB.
      </p>
    </div>
  );
};

export default AvatarUpload;
