// EXAMPLE: How to use useImageUpload hook and ImageUploader component

// ============================================
// Example 1: Upload Avatar in Profile Page
// ============================================

import React from 'react';
import useImageUpload from '../../hooks/useImageUpload';

const ProfileAvatarUpload = () => {
  const { uploading, uploadedUrls, error, uploadSingleImage } = useImageUpload('avatar');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadSingleImage(file);
      console.log('Avatar uploaded:', url);
      
      // TODO: Update user profile with new avatar URL
      // await updateUserProfile({ avatarUrl: url });
      
      alert('Cập nhật avatar thành công!');
    } catch (error) {
      alert('Upload thất bại: ' + error.message);
    }
  };

  return (
    <div className="avatar-upload">
      <div className="current-avatar">
        {uploadedUrls[0] ? (
          <img src={uploadedUrls[0]} alt="Avatar" />
        ) : (
          <div className="placeholder">No Avatar</div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'none' }}
        id="avatar-input"
      />
      
      <label htmlFor="avatar-input" className="upload-btn">
        {uploading ? 'Đang tải lên...' : 'Chọn ảnh đại diện'}
      </label>

      {error && <p className="error">{error}</p>}
    </div>
  );
};


// ============================================
// Example 2: Upload Review Images
// ============================================

import React, { useState } from 'react';
import ImageUploader from '../../components/common/ImageUploader';
import { createReview } from '../../services/api';

const CreateReviewForm = ({ productId, orderId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImagesUploaded = (urls) => {
    setReviewImages(urls);
    console.log('Uploaded review images:', urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (reviewImages.length === 0) {
      alert('Vui lòng upload ít nhất 1 ảnh');
      return;
    }

    setSubmitting(true);
    try {
      // Create review with uploaded image URLs
      await createReview(productId, {
        orderId,
        rating,
        comment,
        images: reviewImages
      });

      alert('Đánh giá thành công!');
      if (onSuccess) onSuccess();
      
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h2>Đánh giá sản phẩm</h2>

      {/* Rating */}
      <div className="form-group">
        <label>Đánh giá của bạn:</label>
        <select 
          value={rating} 
          onChange={(e) => setRating(Number(e.target.value))}
          required
        >
          <option value={5}>⭐⭐⭐⭐⭐ Tuyệt vời</option>
          <option value={4}>⭐⭐⭐⭐ Hài lòng</option>
          <option value={3}>⭐⭐⭐ Bình thường</option>
          <option value={2}>⭐⭐ Không hài lòng</option>
          <option value={1}>⭐ Rất tệ</option>
        </select>
      </div>

      {/* Comment */}
      <div className="form-group">
        <label>Nhận xét:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
          maxLength={1000}
          rows={5}
          required
        />
        <small>{comment.length}/1000 ký tự</small>
      </div>

      {/* Image Uploader */}
      <div className="form-group">
        <label>Hình ảnh sản phẩm:</label>
        <ImageUploader
          maxImages={5}
          onUploadSuccess={handleImagesUploaded}
          onUploadError={(error) => alert(error.message)}
          uploadType="review"
        />
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="btn-submit"
        disabled={submitting || reviewImages.length === 0}
      >
        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>
    </form>
  );
};


// ============================================
// Example 3: Upload Product Images (Seller)
// ============================================

import React, { useState } from 'react';
import useImageUpload from '../../hooks/useImageUpload';

const ProductImageUpload = ({ productId, onImagesUploaded }) => {
  const { 
    uploading, 
    uploadedUrls, 
    uploadSingleImage, 
    deleteUploadedImage 
  } = useImageUpload('product');

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    // Upload each file
    for (const file of files) {
      try {
        await uploadSingleImage(file, productId);
      } catch (error) {
        console.error('Upload failed:', file.name, error);
      }
    }

    if (onImagesUploaded) {
      onImagesUploaded(uploadedUrls);
    }
  };

  const handleDeleteImage = async (url) => {
    if (window.confirm('Xóa ảnh này?')) {
      await deleteUploadedImage(url);
    }
  };

  return (
    <div className="product-images-upload">
      <h3>Hình ảnh sản phẩm</h3>
      
      {/* Upload Button */}
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        style={{ display: 'none' }}
        id="product-images-input"
      />
      
      <label htmlFor="product-images-input" className="upload-btn">
        {uploading ? 'Đang tải lên...' : 'Thêm ảnh'}
      </label>

      {/* Uploaded Images Grid */}
      <div className="images-grid">
        {uploadedUrls.map((url, index) => (
          <div key={index} className="image-item">
            <img src={url} alt={`Product ${index + 1}`} />
            <button 
              className="delete-btn"
              onClick={() => handleDeleteImage(url)}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      <p className="hint">
        {uploadedUrls.length} ảnh đã tải lên
      </p>
    </div>
  );
};


// ============================================
// Example 4: Simple Avatar Upload Button
// ============================================

import React from 'react';
import { uploadAvatar } from '../../services/cloudinaryService';

const SimpleAvatarUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      
      if (onUploadSuccess) {
        onUploadSuccess(url);
      }
      
      alert('Upload thành công!');
    } catch (error) {
      alert('Upload thất bại: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        id="avatar-upload"
        style={{ display: 'none' }}
      />
      <label htmlFor="avatar-upload" className="btn">
        {uploading ? '⏳ Đang tải...' : '📷 Chọn avatar'}
      </label>
    </div>
  );
};


// ============================================
// Export all examples
// ============================================

export {
  ProfileAvatarUpload,
  CreateReviewForm,
  ProductImageUpload,
  SimpleAvatarUpload,
};
