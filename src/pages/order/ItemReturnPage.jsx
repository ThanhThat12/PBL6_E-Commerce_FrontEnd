import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useOrder } from '../../context/OrderContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import Button from '../../components/common/Button';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';

/**
 * ItemReturnPage Component
 * Form for buyer to request return for a specific order item
 */
const ItemReturnPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchOrders } = useOrder();
  const { orderItemId, productName, variantName, price, maxQuantity, productImage } = location.state || {};

  const [formData, setFormData] = useState({
    reason: '',
    quantity: 1,
    returnMethod: 'SHIP_BACK',
    imageUrls: []
  });
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (!orderItemId || orderItemId === 'undefined' || isNaN(orderItemId)) {
      toast.error('Thông tin sản phẩm không hợp lệ. Vui lòng thử lại.');
      navigate('/orders');
    }
  }, [orderItemId, productName, variantName, price, maxQuantity, navigate, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imageFiles.length > 5) {
      toast.error('Chỉ được tải tối đa 5 hình ảnh');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason.trim()) {
      toast.error('Vui lòng nhập lý do trả hàng');
      return;
    }

    if (formData.quantity < 1 || formData.quantity > maxQuantity) {
      toast.error(`Số lượng phải từ 1 đến ${maxQuantity}`);
      return;
    }

    setLoading(true);

    try {
      // TODO: Upload images to server if needed
      // For now, we'll send empty array
      const requestData = {
        orderItemId: orderItemId,
        reason: formData.reason,
        quantity: parseInt(formData.quantity),
        returnMethod: formData.returnMethod,
        imageUrls: [] // Will be populated after image upload
      };

      console.log('📦 Sending return request:', requestData);
      await api.post('/orders/items/return', requestData);
      
      toast.success('Yêu cầu trả hàng đã được gửi thành công!');
      
      // Refetch orders để cập nhật danh sách
      await fetchOrders();
      
      navigate('/orders?tab=RETURN');
    } catch (error) {
      console.error('Error submitting return request:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Không thể gửi yêu cầu trả hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Quay lại
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Yêu cầu trả hàng</h1>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Product Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin sản phẩm</h2>
              <div className="flex gap-4">
                <img
                  src={productImage || '/placeholder.png'}
                  alt={productName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{productName}</h3>
                  <p className="text-sm text-gray-600 mt-1">{variantName}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    Giá: {formatPrice(price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Return Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do trả hàng <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Vui lòng mô tả lý do trả hàng..."
                  required
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  max={maxQuantity}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Tối đa: {maxQuantity}</p>
              </div>

              {/* Return Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức trả hàng <span className="text-red-500">*</span>
                </label>
                <select
                  name="returnMethod"
                  value={formData.returnMethod}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="SHIP_BACK">Gửi hàng về cho người bán</option>
                  <option value="PICKUP">Người bán đến lấy hàng</option>
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh minh họa (Tối đa 5 ảnh)
                </label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Nhấn để tải ảnh</span> hoặc kéo thả
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={imagePreviews.length >= 5}
                    />
                  </label>
                </div>
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Guide */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Hướng dẫn</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Chụp ảnh sản phẩm rõ ràng để seller dễ dàng xác minh</li>
                  <li>Mô tả chi tiết lý do trả hàng</li>
                  <li>Đảm bảo sản phẩm còn nguyên vẹn, chưa qua sử dụng</li>
                  <li>Seller sẽ xem xét và phản hồi trong vòng 24-48 giờ</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Xác nhận'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ItemReturnPage;
