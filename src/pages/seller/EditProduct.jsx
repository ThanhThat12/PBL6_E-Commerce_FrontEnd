import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import EditProductForm from '../../components/seller/Products/EditProductForm';

/**
 * EditProduct Page
 * Page wrapper for editing existing products - simplified to avoid double loading
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
      </div>

      <EditProductForm productId={id} onSuccess={handleBack} />
    </div>
  );
};

export default EditProduct;
