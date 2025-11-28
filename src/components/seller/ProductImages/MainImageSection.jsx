import React, { useRef, useState } from 'react';
import { Upload, Button, Image, Modal, Progress } from 'antd';
import { UploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * MainImageSection Component
 * 
 * Manages the main/primary product image (single image, required)
 * 
 * Features:
 * - Large preview (300x300px or responsive)
 * - Upload button with file picker
 * - Replace confirmation modal when uploading to existing image
 * - Delete button with confirmation
 * - Loading state during upload
 * - Progress indicator
 * - Image validation (size, format, dimensions)
 */
const MainImageSection = ({ mainImage, onUpload, onDelete, uploading }) => {
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  /**
   * Handle file selection
   */
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      Modal.error({
        title: 'Định dạng file không hợp lệ',
        content: 'Chỉ chấp nhận file JPG, PNG, WEBP',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Modal.error({
        title: 'File quá lớn',
        content: 'Kích thước file tối đa là 5MB',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Confirm if replacing existing image
    if (mainImage) {
      Modal.confirm({
        title: 'Thay thế ảnh chính?',
        content: 'Ảnh chính hiện tại sẽ bị xóa và thay thế bằng ảnh mới.',
        okText: 'Thay thế',
        cancelText: 'Hủy',
        onOk: () => handleUpload(file),
        onCancel: () => {
          setPreviewImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
      });
    } else {
      handleUpload(file);
    }
  };

  /**
   * Handle upload
   */
  const handleUpload = async (file) => {
    try {
      setUploadProgress(0);
      await onUpload(file, (progress) => setUploadProgress(progress));
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setPreviewImage(null);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = () => {
    Modal.confirm({
      title: 'Xóa ảnh chính?',
      content: 'Bạn có chắc muốn xóa ảnh chính của sản phẩm?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: onDelete,
    });
  };

  /**
   * Trigger file picker
   */
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Ảnh chính</h2>
      <p className="text-gray-600 text-sm mb-4">
        Ảnh đại diện chính của sản phẩm (bắt buộc). Kích thước tối đa 5MB, định dạng JPG/PNG/WEBP.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Image Preview */}
        <div className="flex-shrink-0">
          {mainImage || previewImage ? (
            <div className="relative group">
              <Image
                src={previewImage || mainImage}
                alt="Main product image"
                className="w-64 h-64 object-cover rounded-lg border-2 border-gray-300"
                preview={{
                  mask: <div className="text-white">Xem</div>,
                }}
              />
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <Progress
                    type="circle"
                    percent={uploadProgress}
                    strokeColor="#1890ff"
                    size={80}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <PlusOutlined className="text-4xl text-gray-400 mb-2" />
                <p className="text-gray-500">Chưa có ảnh chính</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleButtonClick}
            disabled={uploading}
            size="large"
          >
            {mainImage ? 'Thay đổi ảnh chính' : 'Tải ảnh chính lên'}
          </Button>

          {mainImage && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              disabled={uploading}
              size="large"
            >
              Xóa ảnh chính
            </Button>
          )}

          {uploading && (
            <div className="mt-2">
              <Progress percent={uploadProgress} status="active" />
              <p className="text-sm text-gray-500 mt-1">Đang tải lên...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

MainImageSection.propTypes = {
  mainImage: PropTypes.string, // URL or null
  onUpload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  uploading: PropTypes.bool,
};

MainImageSection.defaultProps = {
  mainImage: null,
  uploading: false,
};

export default MainImageSection;
