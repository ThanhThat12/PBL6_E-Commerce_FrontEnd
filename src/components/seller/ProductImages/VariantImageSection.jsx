import React, { useRef, useState } from 'react';
import { Button, Image, Modal, Progress } from 'antd';
import { UploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * VariantImageSection Component
 * 
 * Manages variant-specific product images (tied to primary attribute values)
 * 
 * Features:
 * - Display primary attribute name (e.g., "Color", "Pattern")
 * - Grid of attribute values with upload slots
 * - Each slot shows:
 *   - Attribute value label (e.g., "Red", "Blue")
 *   - Current image preview (if uploaded)
 *   - Upload/Replace button
 *   - Delete button (if image exists)
 * - File picker per variant value
 * - Progress indicator
 * - Replace confirmation modal
 */
const VariantImageSection = ({
  primaryAttribute,
  variantImages,
  onUpload,
  onDelete,
  uploading,
}) => {
  const [uploadingVariant, setUploadingVariant] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRefs = useRef({});

  /**
   * Handle file selection for specific variant
   */
  const handleFileSelect = (attributeValue, event) => {
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

    const existingImage = variantImages[attributeValue];

    // Confirm if replacing existing image
    if (existingImage) {
      Modal.confirm({
        title: 'Thay thế ảnh biến thể?',
        content: `Ảnh biến thể "${attributeValue}" hiện tại sẽ bị xóa và thay thế bằng ảnh mới.`,
        okText: 'Thay thế',
        cancelText: 'Hủy',
        onOk: () => handleUpload(attributeValue, file),
        onCancel: () => {
          if (fileInputRefs.current[attributeValue]) {
            fileInputRefs.current[attributeValue].value = '';
          }
        },
      });
    } else {
      handleUpload(attributeValue, file);
    }
  };

  /**
   * Handle upload
   */
  const handleUpload = async (attributeValue, file) => {
    try {
      setUploadingVariant(attributeValue);
      setUploadProgress({ ...uploadProgress, [attributeValue]: 0 });

      await onUpload(file, attributeValue, (progress) => {
        setUploadProgress({ ...uploadProgress, [attributeValue]: progress });
      });

      if (fileInputRefs.current[attributeValue]) {
        fileInputRefs.current[attributeValue].value = '';
      }
    } catch (error) {
      console.error(`Variant ${attributeValue} upload error:`, error);
    } finally {
      setUploadingVariant(null);
      setUploadProgress({ ...uploadProgress, [attributeValue]: 0 });
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = (attributeValue) => {
    Modal.confirm({
      title: 'Xóa ảnh biến thể?',
      content: `Bạn có chắc muốn xóa ảnh biến thể "${attributeValue}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => onDelete(attributeValue),
    });
  };

  /**
   * Trigger file picker for specific variant
   */
  const handleButtonClick = (attributeValue) => {
    fileInputRefs.current[attributeValue]?.click();
  };

  if (!primaryAttribute || !primaryAttribute.values || primaryAttribute.values.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-2">Ảnh Biến thể</h2>
      <p className="text-gray-600 text-sm mb-4">
        Ảnh theo thuộc tính chính: <span className="font-semibold">{primaryAttribute.name}</span>
      </p>
      <p className="text-gray-500 text-xs mb-6">
        Mỗi giá trị thuộc tính có thể có một ảnh riêng. Ảnh này sẽ hiển thị khi khách hàng chọn
        biến thể tương ứng.
      </p>

      {/* Variant Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {primaryAttribute.values.map((attributeValue) => {
          const variantImage = variantImages[attributeValue];
          const isUploading = uploadingVariant === attributeValue;
          const progress = uploadProgress[attributeValue] || 0;

          return (
            <div
              key={attributeValue}
              className="border border-gray-300 rounded-lg p-3 flex flex-col items-center"
            >
              {/* Attribute Value Label */}
              <div className="w-full mb-2">
                <p className="text-sm font-semibold text-center truncate" title={attributeValue}>
                  {attributeValue}
                </p>
              </div>

              {/* Image Preview */}
              <div className="relative w-full mb-3">
                {variantImage ? (
                  <div className="relative group">
                    <Image
                      src={variantImage.imageUrl || variantImage.url}
                      alt={`Variant ${attributeValue}`}
                      className="w-full h-24 object-cover rounded-md border border-gray-300"
                      preview={{
                        mask: <div className="text-white text-xs">Xem</div>,
                      }}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md">
                        <Progress
                          type="circle"
                          percent={progress}
                          strokeColor="#1890ff"
                          size={50}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center bg-gray-50">
                    {isUploading ? (
                      <Progress
                        type="circle"
                        percent={progress}
                        strokeColor="#1890ff"
                        size={50}
                      />
                    ) : (
                      <PlusOutlined className="text-2xl text-gray-400" />
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col gap-2">
                <input
                  ref={(ref) => (fileInputRefs.current[attributeValue] = ref)}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => handleFileSelect(attributeValue, e)}
                  className="hidden"
                />

                <Button
                  type={variantImage ? 'default' : 'primary'}
                  icon={<UploadOutlined />}
                  size="small"
                  block
                  onClick={() => handleButtonClick(attributeValue)}
                  disabled={uploading}
                >
                  {variantImage ? 'Thay đổi' : 'Tải lên'}
                </Button>

                {variantImage && (
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                    block
                    onClick={() => handleDelete(attributeValue)}
                    disabled={uploading}
                  >
                    Xóa
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <span className="font-semibold">Lưu ý:</span> Ảnh biến thể sẽ hiển thị trên trang sản
          phẩm khi khách hàng chọn giá trị thuộc tính tương ứng. Nếu không có ảnh biến thể, hệ
          thống sẽ hiển thị ảnh chính hoặc ảnh gallery.
        </p>
      </div>
    </div>
  );
};

VariantImageSection.propTypes = {
  primaryAttribute: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    values: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
  variantImages: PropTypes.objectOf(
    PropTypes.shape({
      id: PropTypes.number,
      attributeValue: PropTypes.string,
      imageUrl: PropTypes.string,
      url: PropTypes.string,
      publicId: PropTypes.string,
    })
  ),
  onUpload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  uploading: PropTypes.bool,
};

VariantImageSection.defaultProps = {
  primaryAttribute: null,
  variantImages: {},
  uploading: false,
};

export default VariantImageSection;
