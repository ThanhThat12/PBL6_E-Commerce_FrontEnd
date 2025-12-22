import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import EditProductFormRestricted from '../../components/seller/Products/EditProductFormRestricted';

/**
 * EditProduct Page
 * Restricted edit mode - Only allows updating SKU, Stock, and Images
 * Other product fields are immutable after creation
 */
const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/seller/products');
  };

  // Validate productId
  if (!id || isNaN(Number(id))) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">ID sản phẩm không hợp lệ</p>
        <Button onClick={handleBack}>Quay lại danh sách</Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className="mb-4"
        >
          Quay lại danh sách
        </Button>
        <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
        <p className="text-gray-600 mt-2">
          ⚠️ Bạn chỉ có thể cập nhật SKU, Kho hàng và Hình ảnh. Các thông tin khác không thể chỉnh sửa.
        </p>
      </div>

      <EditProductFormRestricted productId={id} onSuccess={handleBack} />
    </div>
  );
};

export default EditProduct;
