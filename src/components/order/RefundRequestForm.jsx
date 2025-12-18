import React, { useState } from "react";
import orderService from "../../services/orderService";
import ImageUploadService from "../../services/ImageUploadService";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

export default function RefundRequestForm({ orderId, onSuccess }) {
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [images, setImages] = useState([]); // Array of { file, preview, uploading, url }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;
    
    if (images.length + files.length > maxImages) {
      setError(`Chỉ được tải tối đa ${maxImages} ảnh`);
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      url: null
    }));

    setImages([...images, ...newImages]);
    setError("");
  };

  // Remove image
  const handleRemoveImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Upload images to Cloudinary
  const uploadImages = async () => {
    const uploadPromises = images.map(async (img, index) => {
      if (img.url) return img.url; // Already uploaded

      try {
        setImages(prev => {
          const updated = [...prev];
          updated[index].uploading = true;
          return updated;
        });

        const result = await ImageUploadService.uploadRefundImage(img.file);
        
        setImages(prev => {
          const updated = [...prev];
          updated[index].url = result.url;
          updated[index].uploading = false;
          return updated;
        });

        return result.url;
      } catch (err) {
        console.error("Upload error:", err);
        setImages(prev => {
          const updated = [...prev];
          updated[index].uploading = false;
          return updated;
        });
        throw new Error(`Tải ảnh ${index + 1} thất bại`);
      }
    });

    return await Promise.all(uploadPromises);
  };

  const handleRefund = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Upload images first
      let imageUrls = [];
      if (images.length > 0) {
        imageUrls = await uploadImages();
      }

      // Send refund request with image URLs
      await orderService.requestRefund(orderId, { 
        amount: parseInt(amount), 
        description: reason,
        imageUrl: JSON.stringify(imageUrls) // Store as JSON array
      });
      
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Gửi yêu cầu hoàn tiền thất bại");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-green-700 font-medium">✓ Yêu cầu hoàn tiền đã được gửi!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Reason textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lý do hoàn tiền <span className="text-red-500">*</span>
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Mô tả chi tiết lý do bạn muốn hoàn tiền..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Amount input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số tiền hoàn <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Nhập số tiền muốn hoàn..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ảnh bằng chứng (tùy chọn, tối đa 5 ảnh)
        </label>
        
        {/* Upload button */}
        <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <FiUpload className="mr-2" />
          <span className="text-sm">Chọn ảnh</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={loading || images.length >= 5}
          />
        </label>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={img.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  disabled={loading}
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleRefund}
        disabled={loading || !reason || !amount}
        className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Đang gửi...
          </span>
        ) : (
          "Gửi yêu cầu hoàn tiền"
        )}
      </button>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

