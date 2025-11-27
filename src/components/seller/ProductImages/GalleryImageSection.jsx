import React, { useRef, useState } from 'react';
import { Button, Image, Modal, Progress, message } from 'antd';
import { UploadOutlined, DeleteOutlined, PlusOutlined, DragOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

/**
 * GalleryImageSection Component
 * 
 * Manages product gallery images (max 10 images, optional)
 * 
 * Features:
 * - Grid view of gallery images
 * - Drag-and-drop to reorder (react-beautiful-dnd)
 * - Add gallery images button (max 10 total)
 * - Multi-file picker
 * - Delete icon per image with confirmation
 * - Progress indicator for batch uploads
 * - Current count display (e.g., "5/10 images")
 * - Thumbnail preview with zoom
 */
const GalleryImageSection = ({
  galleryImages,
  onUpload,
  onDelete,
  onReorder,
  uploading,
  maxImages,
}) => {
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localImages, setLocalImages] = useState(galleryImages);

  // Sync local state with props
  React.useEffect(() => {
    setLocalImages(galleryImages);
  }, [galleryImages]);

  /**
   * Handle file selection (multi-file)
   */
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check max images limit
    const remainingSlots = maxImages - localImages.length;
    if (files.length > remainingSlots) {
      Modal.error({
        title: 'Vượt quá giới hạn',
        content: `Chỉ có thể thêm tối đa ${remainingSlots} ảnh. Hiện tại: ${localImages.length}/${maxImages}`,
      });
      return;
    }

    // Validate files
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter((file) => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      Modal.error({
        title: 'Định dạng file không hợp lệ',
        content: `${invalidFiles.length} file không đúng định dạng. Chỉ chấp nhận JPG, PNG, WEBP.`,
      });
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      Modal.error({
        title: 'File quá lớn',
        content: `${oversizedFiles.length} file vượt quá 5MB. Vui lòng chọn file nhỏ hơn.`,
      });
      return;
    }

    handleUpload(files);
  };

  /**
   * Handle upload
   */
  const handleUpload = async (files) => {
    try {
      setUploadProgress(0);
      await onUpload(files, (progress) => setUploadProgress(progress));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Gallery upload error:', error);
    }
  };

  /**
   * Handle delete
   */
  const handleDelete = (image, index) => {
    Modal.confirm({
      title: 'Xóa ảnh gallery?',
      content: `Bạn có chắc muốn xóa ảnh #${index + 1}?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => onDelete(image.id),
    });
  };

  /**
   * Handle drag end (reorder)
   */
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    // Reorder local state optimistically
    const reordered = Array.from(localImages);
    const [removed] = reordered.splice(sourceIndex, 1);
    reordered.splice(destIndex, 0, removed);
    setLocalImages(reordered);

    // Prepare imageOrders for backend
    const imageOrders = reordered.map((img, idx) => ({
      imageId: img.id,
      displayOrder: idx,
    }));

    // Call backend
    onReorder(imageOrders).catch(() => {
      // Revert on error
      setLocalImages(galleryImages);
      message.error('Lỗi khi sắp xếp lại ảnh');
    });
  };

  /**
   * Trigger file picker
   */
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = localImages.length < maxImages;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Ảnh Gallery</h2>
          <p className="text-gray-600 text-sm">
            Ảnh bổ sung để hiển thị chi tiết sản phẩm (tối đa {maxImages} ảnh)
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">
            {localImages.length}/{maxImages} ảnh
          </p>
        </div>
      </div>

      {/* Upload Button */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleButtonClick}
          disabled={uploading || !canAddMore}
          size="large"
        >
          {canAddMore ? 'Thêm ảnh Gallery' : 'Đã đủ số lượng ảnh'}
        </Button>

        {uploading && (
          <div className="mt-3 max-w-md">
            <Progress percent={uploadProgress} status="active" />
            <p className="text-sm text-gray-500 mt-1">Đang tải lên...</p>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {localImages.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="gallery" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              >
                {localImages.map((image, index) => (
                  <Draggable
                    key={image.id || `gallery-${index}`}
                    draggableId={String(image.id || `gallery-${index}`)}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative group ${
                          snapshot.isDragging ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-2 left-2 bg-white rounded-full p-1 shadow-md cursor-move z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <DragOutlined className="text-gray-600" />
                        </div>

                        {/* Image */}
                        <Image
                          src={image.url || image.imageUrl}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          preview={{
                            mask: <div className="text-white text-xs">Xem</div>,
                          }}
                        />

                        {/* Delete Button */}
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(image, index)}
                          disabled={uploading}
                        />

                        {/* Index Badge */}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
          <PlusOutlined className="text-4xl text-gray-400 mb-3" />
          <p className="text-gray-600 mb-2">Chưa có ảnh gallery</p>
          <p className="text-gray-500 text-sm">
            Thêm ảnh để hiển thị chi tiết sản phẩm của bạn
          </p>
        </div>
      )}

      {localImages.length > 0 && (
        <p className="text-xs text-gray-500 mt-4">
          💡 Kéo thả các ảnh để sắp xếp lại thứ tự hiển thị
        </p>
      )}
    </div>
  );
};

GalleryImageSection.propTypes = {
  galleryImages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      url: PropTypes.string,
      imageUrl: PropTypes.string,
      displayOrder: PropTypes.number,
    })
  ),
  onUpload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onReorder: PropTypes.func.isRequired,
  uploading: PropTypes.bool,
  maxImages: PropTypes.number,
};

GalleryImageSection.defaultProps = {
  galleryImages: [],
  uploading: false,
  maxImages: 10,
};

export default GalleryImageSection;
