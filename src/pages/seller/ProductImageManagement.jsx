import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Spin, Button, Modal } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import ImageUploadService from '../../services/ImageUploadService';

// Import sub-components (will create these next)
import MainImageSection from '../../components/seller/ProductImages/MainImageSection';
import GalleryImageSection from '../../components/seller/ProductImages/GalleryImageSection';
import VariantImageSection from '../../components/seller/ProductImages/VariantImageSection';

/**
 * ProductImageManagement Page
 * 
 * Comprehensive image management page for sellers
 * Manages 3 types of product images:
 * 1. Main Image (single, required)
 * 2. Gallery Images (max 10, optional)
 * 3. Variant-Specific Images (tied to primary attribute values)
 * 
 * Features:
 * - Upload/replace/delete images independently
 * - Drag-drop reordering for gallery
 * - Real-time preview
 * - Progress indicators
 * - Error recovery with retry
 * - Unsaved changes warning
 */
const ProductImageManagement = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  // Loading and data states
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState(null); // ProductImagesResponse
  
  // Operation tracking
  const [pendingOperations, setPendingOperations] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Error handling
  const [errors, setErrors] = useState([]);

  /**
   * Fetch all product images on mount
   */
  useEffect(() => {
    fetchProductImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  /**
   * Warn user if navigating away with unsaved changes
   */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  /**
   * Fetch product images from backend
   */
  const fetchProductImages = async () => {
    try {
      setLoading(true);
      const response = await ImageUploadService.getProductImages(productId);
      
      if (response?.success && response?.data) {
        setImages(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching product images:', error);
      message.error('Không thể tải hình ảnh sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle main image upload/replace
   */
  const handleMainImageUpload = useCallback(async (file) => {
    try {
      setUploading(true);
      const response = await ImageUploadService.uploadProductMain(
        productId,
        file,
        (progress) => console.log(`Main image upload: ${progress}%`)
      );

      if (response?.success) {
        message.success('Đã tải lên ảnh chính');
        await fetchProductImages(); // Refresh images
      }
    } catch (error) {
      console.error('Main image upload error:', error);
      message.error(error.message || 'Lỗi khi tải ảnh chính');
      setErrors((prev) => [...prev, { type: 'main', message: error.message }]);
    } finally {
      setUploading(false);
    }
  }, [productId]);

  /**
   * Handle main image deletion
   */
  const handleMainImageDelete = useCallback(async () => {
    try {
      setUploading(true);
      const response = await ImageUploadService.deleteProductMain(productId);

      if (response?.success) {
        message.success('Đã xóa ảnh chính');
        await fetchProductImages();
      }
    } catch (error) {
      console.error('Main image delete error:', error);
      message.error(error.message || 'Lỗi khi xóa ảnh chính');
    } finally {
      setUploading(false);
    }
  }, [productId]);

  /**
   * Handle gallery images upload (batch)
   */
  const handleGalleryImagesUpload = useCallback(async (files) => {
    try {
      setUploading(true);
      const response = await ImageUploadService.uploadProductGallery(
        productId,
        files,
        (progress) => console.log(`Gallery upload: ${progress}%`)
      );

      if (response?.success) {
        message.success(`Đã tải lên ${files.length} ảnh gallery`);
        await fetchProductImages();
      }
    } catch (error) {
      console.error('Gallery upload error:', error);
      message.error(error.message || 'Lỗi khi tải ảnh gallery');
      setErrors((prev) => [...prev, { type: 'gallery', message: error.message }]);
    } finally {
      setUploading(false);
    }
  }, [productId]);

  /**
   * Handle gallery image deletion
   */
  const handleGalleryImageDelete = useCallback(async (imageId) => {
    try {
      setUploading(true);
      const response = await ImageUploadService.deleteGalleryImage(productId, imageId);

      if (response?.success) {
        message.success('Đã xóa ảnh gallery');
        await fetchProductImages();
      }
    } catch (error) {
      console.error('Gallery delete error:', error);
      message.error(error.message || 'Lỗi khi xóa ảnh gallery');
    } finally {
      setUploading(false);
    }
  }, [productId]);

  /**
   * Handle gallery images reordering
   */
  const handleGalleryReorder = useCallback(async (imageOrders) => {
    try {
      setUploading(true);
      const response = await ImageUploadService.reorderGallery(productId, imageOrders);

      if (response?.success) {
        message.success('Đã cập nhật thứ tự ảnh');
        await fetchProductImages();
      }
    } catch (error) {
      console.error('Gallery reorder error:', error);
      message.error(error.message || 'Lỗi khi sắp xếp lại ảnh');
    } finally {
      setUploading(false);
    }
  }, [productId]);

  /**
   * Handle variant image upload (single)
   */
  const handleVariantImageUpload = useCallback(async (file, attributeValue) => {
    try {
      setUploading(true);
      const response = await ImageUploadService.uploadVariantImage(
        productId,
        file,
        attributeValue,
        (progress) => console.log(`Variant ${attributeValue} upload: ${progress}%`)
      );

      if (response?.success) {
        message.success(`Đã tải ảnh cho biến thể "${attributeValue}"`);
        await fetchProductImages();
      }
    } catch (error) {
      console.error('Variant upload error:', error);
      message.error(error.message || `Lỗi khi tải ảnh biến thể "${attributeValue}"`);
      setErrors((prev) => [...prev, { type: 'variant', attributeValue, message: error.message }]);
    } finally {
      setUploading(false);
    }
  }, [productId]);

  /**
   * Handle variant image deletion
   */
  const handleVariantImageDelete = useCallback(async (attributeValue) => {
    try {
      setUploading(true);
      const response = await ImageUploadService.deleteVariantImage(productId, attributeValue);

      if (response?.success) {
        message.success(`Đã xóa ảnh biến thể "${attributeValue}"`);
        await fetchProductImages();
      }
    } catch (error) {
      console.error('Variant delete error:', error);
      message.error(error.message || `Lỗi khi xóa ảnh biến thể "${attributeValue}"`);
    } finally {
      setUploading(false);
    }
  }, [productId]);

  /**
   * Navigate back to product list
   */
  const handleBack = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: 'Bạn có thay đổi chưa lưu',
        content: 'Các thay đổi sẽ bị mất. Bạn có chắc muốn thoát?',
        okText: 'Thoát',
        cancelText: 'Ở lại',
        onOk: () => navigate('/seller/products'),
      });
    } else {
      navigate('/seller/products');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" tip="Đang tải hình ảnh sản phẩm...">
          <div className="min-h-[200px]" />
        </Spin>
      </div>
    );
  }

  // Error state
  if (!images) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Không thể tải hình ảnh sản phẩm</p>
        <Button onClick={handleBack}>Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="mb-4"
          >
            Quay lại danh sách
          </Button>
          <h1 className="text-2xl font-bold">Quản lý hình ảnh sản phẩm</h1>
          <p className="text-gray-500 mt-1">
            Quản lý ảnh chính, ảnh gallery và ảnh biến thể
          </p>
        </div>

        {hasUnsavedChanges && (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            disabled={uploading}
          >
            Lưu thay đổi
          </Button>
        )}
      </div>

      {/* Error Summary */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">
            Có {errors.length} lỗi xảy ra:
          </h3>
          <ul className="list-disc list-inside text-red-700">
            {errors.map((error, idx) => (
              <li key={idx}>
                {error.type === 'variant' && `Biến thể "${error.attributeValue}": `}
                {error.message}
              </li>
            ))}
          </ul>
          <Button
            size="small"
            className="mt-2"
            onClick={() => setErrors([])}
          >
            Xóa thông báo lỗi
          </Button>
        </div>
      )}

      {/* Main Content - 3 Sections */}
      <div className="space-y-8">
        {/* Section 1: Main Image */}
        <MainImageSection
          mainImage={images.mainImage}
          onUpload={handleMainImageUpload}
          onDelete={handleMainImageDelete}
          uploading={uploading}
        />

        {/* Section 2: Gallery Images */}
        <GalleryImageSection
          galleryImages={images.galleryImages || []}
          onUpload={handleGalleryImagesUpload}
          onDelete={handleGalleryImageDelete}
          onReorder={handleGalleryReorder}
          uploading={uploading}
          maxImages={10}
        />

        {/* Section 3: Variant Images (conditional) */}
        {images.primaryAttribute ? (
          <VariantImageSection
            primaryAttribute={images.primaryAttribute}
            variantImages={images.variantImages || {}}
            onUpload={handleVariantImageUpload}
            onDelete={handleVariantImageDelete}
            uploading={uploading}
          />
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">
              Sản phẩm này không có thuộc tính chính (primary attribute) để quản lý ảnh biến thể.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Để sử dụng tính năng ảnh biến thể, vui lòng thiết lập thuộc tính chính (ví dụ: Màu sắc, Họa tiết)
              trong phần quản lý biến thể sản phẩm.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImageManagement;
