import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  message,
  Space,
  Upload,
  Typography,
  Spin,
  Table,
  InputNumber,
  Switch,
  Alert,
  Tag,
} from 'antd';
import { SaveOutlined, PlusOutlined } from '@ant-design/icons';
import { getProductById, updateProduct } from '../../../services/seller/productService';
import ImageUploadService from '../../../services/ImageUploadService';
import PropTypes from 'prop-types';

const { TextArea } = Input;
const { Title, Text } = Typography;

/**
 * EditProductFormRestricted Component
 * RESTRICTED UPDATE ONLY:
 * ✅ Can update: Variant SKU, Variant Stock, Product Images
 * ❌ Cannot update: Name, Description, Price, Category, Condition, Shipping Dimensions
 */
const EditProductFormRestricted = ({ productId, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Variant editing states
  const [editingVariants, setEditingVariants] = useState(false);
  const [variantTable, setVariantTable] = useState([]);
  const [productImages, setProductImages] = useState(null);

  // Image upload states - separate by type like AddProductForm
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [variantImages, setVariantImages] = useState({}); // { variantValue: File }

  const loadProduct = useCallback(async () => {
    if (!productId) return;

    try {
      const productData = await getProductById(productId);
      const product = productData.data || productData;
      setProduct(product);

      // Parse existing variants for display
      if (product.variants && product.variants.length > 0) {
        const parsedVariants = product.variants.map((variant, index) => ({
          key: index,
          variantId: variant.id,
          variantValues: variant.variantValues,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
        }));
        setVariantTable(parsedVariants);
      }

      // Try to get primary attribute for variant images
      try {
        const primaryAttributeResponse = await ImageUploadService.getPrimaryAttribute(productId);
        const primaryAttribute = primaryAttributeResponse?.data;
        if (primaryAttribute?.id) {
          setProductImages({ primaryAttribute });
        }
      } catch {
        // No primary attribute set yet
        setProductImages(null);
      }
    } catch (error) {
      message.error('Không thể tải thông tin sản phẩm');
      console.error(error);
    } finally {
      setInitialLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Update variant value in table
  const updateVariantValue = (key, field, value) => {
    const newTable = variantTable.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    );
    setVariantTable(newTable);
  };

  // Get variant values from primary attribute for variant image upload
  const getVariantValues = () => {
    if (!productImages?.primaryAttribute || variantTable.length === 0) {
      return [];
    }

    const primaryAttrId = productImages.primaryAttribute.id;
    const valuesSet = new Set();

    variantTable.forEach(variant => {
      if (variant.variantValues && variant.variantValues.length > 0) {
        variant.variantValues.forEach(vv => {
          if (vv.productAttributeId === primaryAttrId || vv.productAttribute?.id === primaryAttrId) {
            valuesSet.add(vv.value);
          }
        });
      }
    });

    return Array.from(valuesSet);
  };

  // Handle image uploads - separate by type (main, gallery, variant)
  const uploadImages = async () => {
    if (!productId) {
      message.error('Không tìm thấy ID sản phẩm');
      return { success: false };
    }

    let uploadResults = { main: false, gallery: false, variants: false };
    let hasAnyUpload = false;

    try {
      // 1. Upload main image (replaces existing main image)
      if (mainImageFile) {
        hasAnyUpload = true;
        try {
          await ImageUploadService.uploadProductMain(
            productId,
            mainImageFile,
            () => {} // Silent progress
          );
          uploadResults.main = true;
          message.success('Đã cập nhật ảnh đại diện chính');
        } catch (error) {
          message.error('Không thể tải ảnh đại diện');
          console.error(error);
        }
      }

      // 2. Upload gallery images (replaces ALL gallery images)
      if (galleryImageFiles.length > 0) {
        hasAnyUpload = true;
        try {
          await ImageUploadService.uploadProductGallery(
            productId,
            galleryImageFiles,
            () => {} // Silent progress
          );
          uploadResults.gallery = true;
          message.success(`Đã cập nhật ${galleryImageFiles.length} ảnh thư viện`);
        } catch (error) {
          message.error('Không thể tải ảnh thư viện');
          console.error(error);
        }
      }

      // 3. Upload variant images (replaces corresponding variant images)
      if (Object.keys(variantImages).length > 0) {
        hasAnyUpload = true;
        
        if (!productImages?.primaryAttribute) {
          message.warning('Không thể tải ảnh phân loại - chưa có thuộc tính chính');
        } else {
          let variantSuccessCount = 0;
          const totalVariants = Object.keys(variantImages).length;

          for (const [variantValue, file] of Object.entries(variantImages)) {
            try {
              await ImageUploadService.uploadVariantImage(
                productId,
                file,
                variantValue,
                () => {} // Silent progress
              );
              variantSuccessCount++;
            } catch (error) {
              message.error(`Không thể tải ảnh phân loại "${variantValue}"`);
              console.error(error);
            }
          }

          uploadResults.variants = variantSuccessCount > 0;
          if (variantSuccessCount === totalVariants) {
            message.success(`Đã cập nhật ${variantSuccessCount} ảnh phân loại`);
          } else if (variantSuccessCount > 0) {
            message.warning(`Chỉ tải được ${variantSuccessCount}/${totalVariants} ảnh phân loại`);
          }
        }
      }

      // Check if no images selected
      if (!hasAnyUpload) {
        message.info('Không có ảnh nào được chọn để cập nhật');
        return { success: false };
      }

      // Check overall success
      const successCount = Object.values(uploadResults).filter(Boolean).length;
      const totalUploads = (mainImageFile ? 1 : 0) + (galleryImageFiles.length > 0 ? 1 : 0) + (Object.keys(variantImages).length > 0 ? 1 : 0);

      if (successCount === totalUploads) {
        return { success: true };
      } else if (successCount > 0) {
        return { success: true, partial: true };
      } else {
        message.error('Không thể tải lên bất kỳ ảnh nào');
        return { success: false };
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi tải ảnh');
      console.error(error);
      return { success: false };
    }
  };

  // Form submission - RESTRICTED UPDATE
  const onFinish = async () => {
    setLoading(true);
    try {
      // Step 1: Upload images first if any selected
      const hasImages = mainImageFile || galleryImageFiles.length > 0 || Object.keys(variantImages).length > 0;
      if (hasImages) {
        const uploadResult = await uploadImages();
        if (!uploadResult.success && !uploadResult.partial) {
          throw new Error('Không thể tải ảnh lên. Vui lòng thử lại.');
        }
      }

      // Step 2: Update SKU and Stock via backend API
      if (variantTable.length > 0) {
        const updateData = {
          variants: [],
        };

        // Validate and prepare variant updates (SKU and Stock only)
        for (const variant of variantTable) {
          if (!variant.sku || variant.sku.trim() === '') {
            throw new Error('Vui lòng nhập SKU cho tất cả biến thể');
          }
          if (variant.stock < 0) {
            throw new Error('Số lượng kho không được âm');
          }

          updateData.variants.push({
            sku: variant.sku.trim(),
            stock: variant.stock,
          });
        }

        // Call update API with RESTRICTED data (SKU and Stock only)
        await updateProduct(productId, updateData);
      }

      message.success('🎉 Cập nhật sản phẩm thành công!');

      // Clear uploaded files
      setMainImageFile(null);
      setGalleryImageFiles([]);
      setVariantImages({});

      // Reload product data
      await loadProduct();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      message.error(error.message || 'Không thể cập nhật sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text type="danger">Không tìm thấy sản phẩm</Text>
        </div>
      </Card>
    );
  }

  return (
    <div className="edit-product-form">
      <Title level={3}>Chỉnh sửa sản phẩm: {product.name}</Title>

      {/* Information: Immutable Fields */}
      <Alert
        message="⚠️ Chế độ cập nhật hạn chế"
        description="Bạn chỉ có thể cập nhật SKU, Kho hàng của biến thể và Hình ảnh sản phẩm. Các thông tin khác đã được khóa và không thể chỉnh sửa."
        type="warning"
        showIcon
        closable
        className="mb-4"
      />

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Immutable Product Info - Read Only */}
        <Card title="📌 Thông tin sản phẩm (Không chỉnh sửa)" className="mb-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="p-3 bg-gray-50 rounded">
                <Text type="secondary" className="text-xs">Tên sản phẩm</Text>
                <Text strong className="mt-1">
                  {product.name}
                </Text>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="p-3 bg-gray-50 rounded">
                <Text type="secondary" className="text-xs">Giá cơ bản</Text>
                <Text strong className="mt-1">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(product.basePrice)}
                </Text>
              </div>
            </Col>

            <Col xs={24}>
              <div className="p-3 bg-gray-50 rounded">
                <Text type="secondary" className="text-xs">Mô tả sản phẩm</Text>
                <TextArea value={product.description} disabled className="mt-1" rows={3} />
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className="p-3 bg-gray-50 rounded">
                <Text type="secondary" className="text-xs">Danh mục</Text>
                <Text strong className="mt-1">
                  {product.category?.name || 'N/A'}
                </Text>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className="p-3 bg-gray-50 rounded">
                <Text type="secondary" className="text-xs">Tính chất sản phẩm</Text>
                <Text strong className="mt-1">
                  {product.productCondition || 'N/A'}
                </Text>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className="p-3 bg-gray-50 rounded">
                <Text type="secondary" className="text-xs">Trạng thái</Text>
                <Tag color={product.isActive ? 'green' : 'red'} className="mt-1">
                  {product.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Editable: Variant SKU & Stock */}
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>✏️ Quản lý SKU & Kho hàng biến thể</span>
              <Switch
                checked={editingVariants}
                onChange={setEditingVariants}
                checkedChildren="Sửa"
                unCheckedChildren="Xem"
              />
            </div>
          }
          className="mb-4"
        >
          {editingVariants ? (
            // Editing mode
            <div>
              {variantTable.length > 0 ? (
                <Table
                  columns={[
                    {
                      title: 'Phân loại',
                      dataIndex: 'variantValues',
                      key: 'variantValues',
                      width: 150,
                      render: (values) => (
                        <div>
                          {values && values.map((v, i) => (
                            <Tag key={i} color="blue" className="mb-1">
                              {v.value}
                            </Tag>
                          ))}
                        </div>
                      ),
                    },
                    {
                      title: 'SKU',
                      dataIndex: 'sku',
                      key: 'sku',
                      width: 180,
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) =>
                            updateVariantValue(record.key, 'sku', e.target.value)
                          }
                          placeholder="Nhập SKU"
                        />
                      ),
                    },
                    {
                      title: 'Giá',
                      dataIndex: 'price',
                      key: 'price',
                      width: 120,
                      render: (price) => (
                        <Text>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(price)}
                        </Text>
                      ),
                    },
                    {
                      title: 'Kho hàng',
                      dataIndex: 'stock',
                      key: 'stock',
                      width: 120,
                      render: (stock, record) => (
                        <InputNumber
                          value={stock}
                          onChange={(value) =>
                            updateVariantValue(record.key, 'stock', value)
                          }
                          min={0}
                          style={{ width: '100%' }}
                        />
                      ),
                    },
                  ]}
                  dataSource={variantTable}
                  pagination={false}
                  size="small"
                  scroll={{ x: 600 }}
                  bordered
                  rowKey="key"
                />
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Text>Sản phẩm không có biến thể</Text>
                </div>
              )}
            </div>
          ) : (
            // View mode
            <div>
              {variantTable.length > 0 ? (
                <div>
                  <Text>Sản phẩm có <strong>{variantTable.length}</strong> biến thể</Text>
                  <div className="mt-3">
                    {variantTable.map((v, i) => (
                      <div key={i} className="p-2 bg-gray-50 rounded mb-2">
                        <div className="flex justify-between">
                          <Text>
                            {v.variantValues &&
                              v.variantValues
                                .map((val) => val.value)
                                .join(' - ')}
                          </Text>
                          <Text type="secondary">
                            SKU: <Text code>{v.sku}</Text> | Kho: {v.stock}
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Text>Sản phẩm không có biến thể</Text>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Editable: Product Images - Same structure as AddProductForm */}
        <Card title="🖼️ Cập nhật hình ảnh sản phẩm" className="mb-4">
          <Alert
            message="📝 Hướng dẫn"
            description="Các ảnh bạn tải lên sẽ GHI ĐÈ lên ảnh cũ theo từng loại: Ảnh đại diện → thay thế ảnh đại diện cũ, Ảnh thư viện → thay thế tất cả ảnh thư viện cũ, Ảnh phân loại → thay thế ảnh phân loại tương ứng."
            type="info"
            showIcon
            className="mb-4"
          />

          <Row gutter={16}>
            {/* Main Image */}
            <Col xs={24} md={8}>
              <div className="mb-4">
                <Text strong className="block mb-2">Ảnh đại diện chính</Text>
                <Text type="secondary" className="text-xs block mb-2">
                  Sẽ ghi đè lên ảnh đại diện hiện tại
                </Text>
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={(file) => {
                    setMainImageFile(file);
                    return false;
                  }}
                  onRemove={() => setMainImageFile(null)}
                  fileList={mainImageFile ? [{
                    uid: '-1',
                    name: mainImageFile.name,
                    status: 'done',
                    url: URL.createObjectURL(mainImageFile),
                  }] : []}
                >
                  {mainImageFile ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>
              </div>
            </Col>

            {/* Gallery Images - MAX 5 */}
            <Col xs={24} md={8}>
              <div className="mb-4">
                <Text strong className="block mb-2">
                  Thư viện ảnh <Tag color="blue">Tối đa 5 ảnh</Tag>
                </Text>
                <Text type="secondary" className="text-xs block mb-2">
                  Sẽ ghi đè lên TẤT CẢ ảnh thư viện hiện tại
                </Text>
                <Upload
                  listType="picture-card"
                  multiple
                  maxCount={5}
                  beforeUpload={(file) => {
                    if (galleryImageFiles.length >= 5) {
                      message.warning('Chỉ được chọn tối đa 5 ảnh thư viện');
                      return false;
                    }
                    setGalleryImageFiles(prev => [...prev, file]);
                    return false;
                  }}
                  onRemove={(file) => {
                    const fileIndex = parseInt(file.uid);
                    setGalleryImageFiles(prev => prev.filter((_, index) => index !== fileIndex));
                  }}
                  fileList={galleryImageFiles.map((file, index) => ({
                    uid: index.toString(),
                    name: file.name,
                    status: 'done',
                    url: URL.createObjectURL(file),
                    originFileObj: file
                  }))}
                >
                  {galleryImageFiles.length >= 5 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải lên</div>
                    </div>
                  )}
                </Upload>
              </div>
            </Col>

            {/* Variant Images */}
            <Col xs={24} md={8}>
              <div className="mb-4">
                <Text strong className="block mb-2">Ảnh cho từng phân loại</Text>
                <Text type="secondary" className="text-xs block mb-2">
                  Sẽ ghi đè lên ảnh phân loại tương ứng
                </Text>

                {!productImages?.primaryAttribute && variantTable.length > 0 && (
                  <Alert
                    message="Chưa có thuộc tính chính"
                    description="Cần thiết lập thuộc tính chính để tải ảnh phân loại"
                    type="warning"
                    showIcon
                    size="small"
                    className="mb-3"
                  />
                )}

                {productImages?.primaryAttribute && getVariantValues().length > 0 && (
                  <div>
                    {getVariantValues().map((variantValue, index) => (
                      <div key={index} className="mb-3">
                        <Text className="text-sm block mb-1">
                          <Tag color="blue">{variantValue}</Tag>
                        </Text>
                        <Upload
                          listType="picture-card"
                          maxCount={1}
                          beforeUpload={(file) => {
                            setVariantImages(prev => ({
                              ...prev,
                              [variantValue]: file
                            }));
                            return false;
                          }}
                          onRemove={() => {
                            setVariantImages(prev => {
                              const newImages = { ...prev };
                              delete newImages[variantValue];
                              return newImages;
                            });
                          }}
                          fileList={variantImages[variantValue] ? [{
                            uid: '-1',
                            name: variantImages[variantValue].name,
                            status: 'done',
                            url: URL.createObjectURL(variantImages[variantValue]),
                          }] : []}
                        >
                          {variantImages[variantValue] ? null : (
                            <div>
                              <PlusOutlined />
                              <div style={{ marginTop: 8 }}>Ảnh</div>
                            </div>
                          )}
                        </Upload>
                      </div>
                    ))}
                  </div>
                )}

                {(!productImages?.primaryAttribute || getVariantValues().length === 0) && (
                  <div className="text-center py-4 bg-gray-50 rounded">
                    <Text type="secondary">Không có phân loại</Text>
                  </div>
                )}
              </div>
            </Col>
          </Row>

        </Card>

        {/* Submit Button */}
        <Card className="mb-4">
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
            >
              Lưu cập nhật
            </Button>
            <Button onClick={() => window.history.back()}>Hủy</Button>
          </Space>
        </Card>
      </Form>
    </div>
  );
};

EditProductFormRestricted.propTypes = {
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSuccess: PropTypes.func,
};

export default EditProductFormRestricted;
