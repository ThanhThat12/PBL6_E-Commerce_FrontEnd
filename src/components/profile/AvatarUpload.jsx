import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiCamera, FiUpload, FiX } from 'react-icons/fi';
import Button from '../common/Button';
import Loading from '../common/Loading';
import api from '../../services/api';

/**
 * AvatarUpload Component
 * Component for uploading and previewing avatar images
 */
const AvatarUpload = ({ currentAvatarUrl, currentFullName, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Vui lòng chọn file ảnh (JPEG, PNG, GIF)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn ảnh');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post('/user/avatar/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.statusCode === 200) {
        toast.success('Cập nhật ảnh đại diện thành công');
        onSuccess(response.data);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        toast.error(response.message || 'Không thể tải ảnh lên');
      }
    } catch (error) {
      console.error('Upload avatar error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tải ảnh lên';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <FiCamera className="w-12 h-12 text-gray-400" />
          )}
        </div>
        
        {/* Camera Icon Overlay */}
        <button
          onClick={handleButtonClick}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <FiCamera className="w-5 h-5" />
        </button>
      </div>

      {/* User Name Display */}
      {currentFullName && (
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{currentFullName}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Selected File Info & Actions */}
      {selectedFile && (
        <div className="w-full max-w-md bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FiUpload className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 truncate">
                {selectedFile.name}
              </span>
            </div>
            <button
              onClick={handleCancel}
              disabled={uploading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 flex-shrink-0 ml-2"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={uploading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handleUpload}
              variant="primary"
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loading size="sm" />
                  <span>Đang tải...</span>
                </div>
              ) : (
                'Tải lên'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedFile && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Nhấp vào biểu tượng camera để chọn ảnh
          </p>
          <p className="text-xs text-gray-500 mt-1">
            JPEG, PNG, GIF (tối đa 5MB)
          </p>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
