import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import Button from '../../components/common/Button';
import { ArrowLeftIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import orderService from '../../services/orderService';
import ImageUploadService from '../../services/ImageUploadService';

/**
 * ReturnRequestPage
 * Trang tạo yêu cầu trả hàng/hoàn tiền cho sản phẩm cụ thể
 */
const ReturnRequestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const itemId = searchParams.get('itemId');

  const [order, setOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [returnQuantity, setReturnQuantity] = useState(1); // Số lượng muốn trả
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const reasons = [
    'Sản phẩm bị lỗi/hư hỏng',
    'Sản phẩm không đúng mô tả',
    'Sản phẩm không đúng màu/size',
    'Nhận được sản phẩm khác',
    'Không còn nhu cầu sử dụng',
    'Khác'
  ];

  useEffect(() => {
    if (!orderId || !itemId) {
      toast.error('Thiếu thông tin đơn hàng');
      navigate('/orders');
      return;
    }

    fetchOrderDetail();
  }, [orderId, itemId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderDetail(parseInt(orderId));
      console.log('🔍 ReturnRequestPage - Response:', response);
      
      // Unwrap ResponseDTO
      const orderData = response.data || response;
      console.log('🔍 ReturnRequestPage - Order data:', orderData);
      console.log('🔍 ReturnRequestPage - Items:', orderData.items);
      console.log('🔍 ReturnRequestPage - Looking for itemId:', itemId, 'as number:', parseInt(itemId));
      
      setOrder(orderData);
      
      // Find the specific item
      const item = orderData.items?.find(i => {
        console.log('🔍 Comparing item:', i, 'item.id:', i.id, 'matches:', i.id === parseInt(itemId));
        return i.id === parseInt(itemId);
      });
      
      console.log('🔍 ReturnRequestPage - Found item:', item);
      
      if (!item) {
        console.error('❌ Item not found. Items:', orderData.items, 'Looking for ID:', itemId);
        toast.error('Không tìm thấy sản phẩm');
        navigate(`/orders/${orderId}`);
        return;
      }
      setSelectedItem(item);
      setReturnQuantity(item.quantity); // Set default to full quantity
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Không thể tải thông tin đơn hàng');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validation: Max 5 images
    if (images.length + files.length > 5) {
      toast.error('Tối đa 5 ảnh');
      return;
    }

    // Validation: File type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)');
      return;
    }

    // Validation: File size (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error('Mỗi ảnh tối đa 5MB');
      return;
    }

    setImages([...images, ...files]);

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      toast.error('Vui lòng chọn lý do trả hàng');
      return;
    }

    if (!description.trim()) {
      toast.error('Vui lòng mô tả chi tiết');
      return;
    }

    if (returnQuantity < 1 || returnQuantity > selectedItem.quantity) {
      toast.error(`Số lượng phải từ 1 đến ${selectedItem.quantity}`);
      return;
    }

    if (images.length === 0) {
      toast.error('Vui lòng tải lên ít nhất 1 ảnh bằng chứng');
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Upload images
      console.log('📤 Starting upload process for', images.length, 'images');
      toast.loading(`Đang tải ảnh lên (0/${images.length})...`, { id: 'upload' });
      
      const uploadedUrls = [];
      for (let i = 0; i < images.length; i++) {
        toast.loading(`Đang tải ảnh lên (${i + 1}/${images.length})...`, { id: 'upload' });
        const formData = new FormData();
        formData.append('file', images[i]);
        
        try {
          const response = await ImageUploadService.uploadRefundImage(formData);
          uploadedUrls.push(response.url);
          console.log(`✅ Uploaded image ${i + 1}:`, response.url);
        } catch (error) {
          console.error(`❌ Failed to upload image ${i + 1}:`, error);
          toast.dismiss('upload');
          throw new Error(`Không thể tải ảnh "${images[i].name}" lên. Vui lòng thử lại.`);
        }
      }
      
      toast.dismiss('upload');
      toast.success(`Đã tải lên ${uploadedUrls.length} ảnh thành công!`);

      // Step 2: Create refund request
      console.log('📝 Creating refund request with data:', {
        orderItemId: parseInt(itemId),
        reason,
        description: description.substring(0, 50) + '...',
        quantity: returnQuantity,
        imageUrls: uploadedUrls,
        requestedAmount: selectedItem.price * returnQuantity
      });

      toast.loading('Đang gửi yêu cầu trả hàng...', { id: 'submit' });
      
      const requestData = {
        orderItemId: parseInt(itemId),
        reason,
        description,
        quantity: returnQuantity,
        imageUrls: uploadedUrls,
        requestedAmount: selectedItem.price * returnQuantity
      };

      const response = await orderService.createRefundRequest(requestData);
      toast.dismiss('submit');
      
      console.log('✅ Refund request created successfully:', response);
      toast.success('Đã gửi yêu cầu trả hàng thành công! Vui lòng chờ shop xét duyệt.');
      
      // Wait a bit before navigating
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error in refund request process:', error);
      toast.dismiss('upload');
      toast.dismiss('submit');
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Không thể gửi yêu cầu trả hàng. Vui lòng thử lại.';
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order || !selectedItem) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Quay lại chi tiết đơn hàng</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Yêu cầu trả hàng/hoàn tiền
        </h1>
        <p className="text-gray-600 mb-8">
          Đơn hàng #{orderId}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {/* Product Info */}
              <div className="pb-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm</h2>
                <div className="flex gap-4">
                  <img
                    src={selectedItem.mainImage || selectedItem.productImage || selectedItem.image || '/placeholder.png'}
                    alt={selectedItem.productName}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{selectedItem.productName}</h3>
                    {selectedItem.variantAttributes && (
                      <p className="text-sm text-gray-600 mt-1">{selectedItem.variantAttributes}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Số lượng: {selectedItem.quantity}</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(selectedItem.price * selectedItem.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng muốn trả <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max={selectedItem.quantity}
                    value={returnQuantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= selectedItem.quantity) {
                        setReturnQuantity(value);
                      }
                    }}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <span className="text-sm text-gray-600">
                    (Tối đa: {selectedItem.quantity})
                  </span>
                  <span className="ml-auto font-semibold text-orange-600">
                    {formatPrice(selectedItem.price * returnQuantity)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Số tiền hoàn sẽ được tính theo số lượng trả
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do trả hàng <span className="text-red-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Chọn lý do</option>
                  {reasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Vui lòng mô tả chi tiết vấn đề với sản phẩm..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Càng chi tiết càng giúp shop xử lý nhanh hơn
                </p>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh bằng chứng <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Tải lên ảnh chụp sản phẩm thực tế (tối đa 5 ảnh)
                </p>

                {/* Image previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                {images.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Nhấn để tải ảnh lên</span>
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG (tối đa 5MB mỗi ảnh)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/orders/${orderId}`)}
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>

          {/* Info sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Lưu ý quan trọng
              </h2>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Chỉ chấp nhận trả hàng trong vòng 7 ngày kể từ khi nhận hàng</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Sản phẩm phải còn nguyên tem, mác, chưa qua sử dụng</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Vui lòng chụp ảnh rõ ràng các vấn đề của sản phẩm</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Yêu cầu trả hàng sẽ được xét duyệt trong vòng 48h</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Sau khi được duyệt, bạn cần gửi hàng về shop theo hướng dẫn</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>Tiền sẽ được hoàn lại sau khi shop nhận và kiểm tra hàng</span>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số lượng trả:</span>
                    <span className="font-medium text-gray-900">{returnQuantity} / {selectedItem.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giá mỗi sản phẩm:</span>
                    <span className="font-medium text-gray-900">{formatPrice(selectedItem.price)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Số tiền hoàn dự kiến:</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatPrice(selectedItem.price * returnQuantity)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnRequestPage;
