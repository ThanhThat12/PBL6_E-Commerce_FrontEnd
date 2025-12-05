import React, { useState, useRef, useCallback } from 'react';
import { FiCamera, FiX, FiRefreshCw, FiCheck, FiAlertCircle, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

/**
 * ImageUploader Component
 * Upload images before creating review with progress tracking
 * 
 * @param {Array} images - Array of uploaded images [{url, publicId, status, progress, error, file}]
 * @param {function} onChange - Callback when images change
 * @param {function} onUpload - Async function to upload files, should return uploaded image data
 * @param {number} maxImages - Maximum number of images (default: 5)
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5)
 * @param {boolean} disabled - Disable interaction
 */
const ImageUploader = ({
  images = [],
  onChange,
  onUpload,
  maxImages = 5,
  maxSizeMB = 5,
  disabled = false
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `File "${file.name}" không đúng định dạng (chỉ JPG, PNG, WEBP)` };
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { valid: false, error: `Ảnh "${file.name}" quá lớn (max ${maxSizeMB}MB)` };
    }
    return { valid: true };
  };

  const createPreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = useCallback(async (files) => {
    if (disabled) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Tối đa ${maxImages} ảnh cho mỗi đánh giá`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const validFiles = [];
    
    // Validate all files first
    for (const file of filesToProcess) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    // Create previews and add to state immediately
    const newImages = await Promise.all(
      validFiles.map(async (file) => {
        const preview = await createPreview(file);
        return {
          id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          preview,
          file,
          status: 'uploading',
          progress: 0,
          url: null,
          publicId: null,
          error: null
        };
      })
    );

    // Update state with pending uploads
    const updatedImages = [...images, ...newImages];
    onChange(updatedImages);

    // Upload each file
    for (const img of newImages) {
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          onChange(prev => prev.map(i => 
            i.id === img.id && i.status === 'uploading' && i.progress < 90
              ? { ...i, progress: i.progress + 10 }
              : i
          ));
        }, 200);

        // Call upload function
        const result = await onUpload([img.file]);
        clearInterval(progressInterval);

        if (result && result.length > 0) {
          const uploadedData = result[0];
          onChange(prev => prev.map(i => 
            i.id === img.id 
              ? { 
                  ...i, 
                  status: 'success', 
                  progress: 100,
                  url: uploadedData.url,
                  publicId: uploadedData.publicId
                }
              : i
          ));
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        onChange(prev => prev.map(i => 
          i.id === img.id 
            ? { ...i, status: 'error', error: error.message || 'Tải lên thất bại' }
            : i
        ));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, maxImages, disabled, onChange, onUpload, maxSizeMB]);

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = ''; // Reset input
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRetry = async (imageId) => {
    const img = images.find(i => i.id === imageId);
    if (!img || !img.file) return;

    onChange(prev => prev.map(i => 
      i.id === imageId 
        ? { ...i, status: 'uploading', progress: 0, error: null }
        : i
    ));

    try {
      const result = await onUpload([img.file]);
      if (result && result.length > 0) {
        const uploadedData = result[0];
        onChange(prev => prev.map(i => 
          i.id === imageId 
            ? { 
                ...i, 
                status: 'success', 
                progress: 100,
                url: uploadedData.url,
                publicId: uploadedData.publicId
              }
            : i
        ));
      }
    } catch (error) {
      onChange(prev => prev.map(i => 
        i.id === imageId 
          ? { ...i, status: 'error', error: error.message }
          : i
      ));
    }
  };

  const handleRemove = (imageId) => {
    onChange(images.filter(i => i.id !== imageId));
  };

  const canAddMore = images.length < maxImages && !disabled;

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {/* Existing/Uploading Images */}
        {images.map((img) => (
          <div
            key={img.id}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
          >
            {/* Preview Image */}
            <img
              src={img.url || img.preview}
              alt="Review"
              className={`w-full h-full object-cover transition-all duration-200 ${
                img.status === 'uploading' ? 'opacity-50 blur-sm' : ''
              } ${img.status === 'error' ? 'opacity-30' : ''}`}
            />

            {/* Remove Button - Always visible */}
            <button
              onClick={() => handleRemove(img.id)}
              className="absolute top-1 right-1 p-1.5 bg-black/60 rounded-full hover:bg-red-600 transition-colors z-10"
              title="Xóa ảnh"
            >
              <FiX className="w-3.5 h-3.5 text-white" />
            </button>

            {/* Upload Progress Overlay */}
            {img.status === 'uploading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                <div className="w-12 h-12 relative">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-white/30"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - img.progress / 100)}`}
                      className="text-blue-500 transition-all duration-300"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                    {img.progress}%
                  </span>
                </div>
                <span className="text-white text-xs mt-1">Đang tải lên...</span>
              </div>
            )}

            {/* Success Indicator */}
            {img.status === 'success' && (
              <div className="absolute top-1 left-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <FiCheck className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Error Overlay with Retry */}
            {img.status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/70">
                <FiAlertCircle className="w-6 h-6 text-white mb-1" />
                <span className="text-white text-xs text-center px-2 mb-2">Tải lên thất bại</span>
                <button
                  onClick={() => handleRetry(img.id)}
                  className="px-3 py-1 bg-white text-red-600 rounded text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
                >
                  <FiRefreshCw className="w-3 h-3" />
                  Thử lại
                </button>
              </div>
            )}

            {/* View button on hover (for success state) */}
            {img.status === 'success' && (
              <button
                onClick={() => setLightboxImage(img.url || img.preview)}
                className="absolute bottom-1 left-1 p-1.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                title="Xem ảnh"
              >
                <FiEye className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
        ))}

        {/* Add More Button */}
        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              aspect-square rounded-lg border-2 border-dashed 
              flex flex-col items-center justify-center gap-2
              transition-all duration-200
              ${dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            <FiCamera className={`w-6 h-6 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className={`text-xs text-center ${dragActive ? 'text-blue-600' : 'text-gray-500'}`}>
              {images.length === 0 ? 'Thêm ảnh' : `+${maxImages - images.length}`}
            </span>
          </button>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Tối đa {maxImages} ảnh • JPG, PNG, WEBP • Dung lượng tối đa {maxSizeMB}MB/ảnh
      </p>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <FiX className="w-6 h-6 text-white" />
          </button>
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
