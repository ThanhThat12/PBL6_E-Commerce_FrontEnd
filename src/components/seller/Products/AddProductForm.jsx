import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Row,
  Col,
  message,
  Space,
  Table,
  Tag,
  Checkbox,
  Steps,
  Upload,
  Typography,
  Spin,
  Divider,
} from 'antd';
import { UploadOutlined, PlusOutlined, CheckOutlined, ArrowLeftOutlined, ShopOutlined, InboxOutlined } from '@ant-design/icons';
import { createProduct } from '../../../services/seller/productService';
import ImageUploadService from '../../../services/ImageUploadService';
import api from '../../../services/api';
import productAttributeService from '../../../services/productAttributeService';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { Title, Text } = Typography;
const { Dragger } = Upload;

/**
 * AddProductForm Component
 * Multi-step form for creating products following new architecture:
 * Step 0: Basic product info + variants (create product)
 * Step 1: Upload images (separate API calls)
 * Step 2: Confirmation
 */
const AddProductForm = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [productAttributes, setProductAttributes] = useState([]);
  const [attributesLoading, setAttributesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [createdProduct, setCreatedProduct] = useState(null);

  // States cho phân loại - dynamic based on backend attributes
  const [classificationType1, setClassificationType1] = useState(null);
  const [classificationType2, setClassificationType2] = useState(null);
  const [enableClassification2, setEnableClassification2] = useState(false);
  const [classification1Values, setClassification1Values] = useState([]);
  const [classification2Values, setClassification2Values] = useState([]);
  const [classification1Input, setClassification1Input] = useState('');
  const [classification2Input, setClassification2Input] = useState('');
  const [variantTable, setVariantTable] = useState([]);

  // Images - now handled after product creation
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [variantImages, setVariantImages] = useState({}); // { variantValue: File }

  useEffect(() => {
    fetchCategories();
    fetchProductAttributes();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (_err) {
      message.error('Không thể tải danh mục');
    }
  };

  const fetchProductAttributes = async () => {
    setAttributesLoading(true);
    try {
      // Use centralized service for product attributes
      const attrs = await productAttributeService.getAll();
      const list = Array.isArray(attrs) ? attrs : (attrs?.data || []);
      setProductAttributes(list);
      // Do NOT set default classification types here.
      // The user must explicitly choose the classification groups before creating variants.
    } catch (_err) {
      message.error('Không thể tải thuộc tính sản phẩm');
    } finally {
      setAttributesLoading(false);
    }
  };

  // Get attribute name by ID
  const getAttributeName = (attrId) => {
    if (!attrId) return 'Chưa chọn';
    const attr = productAttributes.find(a => a.id === attrId);
    return attr?.name || 'Thuộc tính';
  };

  // Ref to store current variant table for merging without dependency loop
  const variantTableRef = useRef([]);
  useEffect(() => {
    variantTableRef.current = variantTable;
  }, [variantTable]);

  // Tạo bảng variants tự động
  const generateVariantTable = () => {
    if (classification1Values.length === 0) {
      setVariantTable([]);
      return;
    }

    const currentTable = variantTableRef.current;
    const newVariantTable = [];
    let index = 0;

    // Helper to find existing data
    const findExisting = (v1, v2) => {
      return currentTable.find(item =>
        item.classification1 === v1 &&
        (!enableClassification2 || item.classification2 === v2)
      );
    };

    if (enableClassification2 && classification2Values.length > 0) {
      // Two classification groups
      classification1Values.forEach(value1 => {
        classification2Values.forEach(value2 => {
          const existing = findExisting(value1, value2);
          const sku = existing ? existing.sku : `${value1}-${value2}`.toUpperCase().replace(/\s+/g, '-');

          newVariantTable.push({
            key: index++,
            classification1: value1,
            classification2: value2,
            sku: sku,
            price: existing ? existing.price : 0,
            stock: existing ? existing.stock : 0
          });
        });
      });
    } else {
      // Single classification group
      classification1Values.forEach(value1 => {
        const existing = findExisting(value1, null);
        const sku = existing ? existing.sku : `${value1}`.toUpperCase().replace(/\s+/g, '-');

        newVariantTable.push({
          key: index++,
          classification1: value1,
          sku: sku,
          price: existing ? existing.price : 0,
          stock: existing ? existing.stock : 0
        });
      });
    }

    setVariantTable(newVariantTable);
  };

  useEffect(() => {
    generateVariantTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classification1Values, classification2Values, classificationType1, classificationType2, enableClassification2]);

  // Cập nhật giá trị trong bảng variants
  const updateVariantValue = (key, field, value) => {
    const newTable = variantTable.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    );
    setVariantTable(newTable);
  };

  // Thêm/xóa giá trị phân loại
  const addClassification1Value = (value) => {
    const v = (value || '').trim();
    if (!classificationType1) {
      message.warning('Vui lòng chọn nhóm phân loại chính trước');
      return;
    }
    if (v && !classification1Values.includes(v)) {
      setClassification1Values([...classification1Values, v]);
    }
    setClassification1Input('');
  };

  const addClassification2Value = (value) => {
    const v = (value || '').trim();
    if (!classificationType2) {
      message.warning('Vui lòng chọn nhóm phân loại 2 trước');
      return;
    }
    if (v && !classification2Values.includes(v)) {
      setClassification2Values([...classification2Values, v]);
    }
    setClassification2Input('');
  };

  const removeClassification1Value = (value) => {
    setClassification1Values(classification1Values.filter(v => v !== value));
  };

  const removeClassification2Value = (value) => {
    setClassification2Values(classification2Values.filter(v => v !== value));
  };

  // Columns cho bảng variants (Step 0 - Basic info only)
  const variantColumns = [
    {
      title: getAttributeName(classificationType1),
      dataIndex: 'classification1',
      key: 'classification1',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    ...(enableClassification2 ? [{
      title: getAttributeName(classificationType2),
      dataIndex: 'classification2',
      key: 'classification2',
      width: 120,
      render: (text) => <Tag color="green">{text}</Tag>
    }] : []),
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 150,
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => updateVariantValue(record.key, 'sku', e.target.value)}
          placeholder="SKU"
        />
      )
    },
    {
      title: 'Giá (VND)',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price, record) => (
        <InputNumber
          value={price}
          onChange={(value) => updateVariantValue(record.key, 'price', value)}
          placeholder="Giá"
          min={0}
          style={{ width: '100%' }}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\$\s?|(,*)/g, '')}
        />
      )
    },
    {
      title: 'Kho hàng',
      dataIndex: 'stock',
      key: 'stock',
      width: 120,
      render: (stock, record) => (
        <InputNumber
          value={stock}
          onChange={(value) => updateVariantValue(record.key, 'stock', value)}
          placeholder="SL"
          min={0}
          style={{ width: '100%' }}
        />
      )
    }
  ];

  // Step navigation handlers
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Step 0: Create product basic info
  const onFinishStep1 = async (values) => {
    setLoading(true);

    try {
      // Ensure user selected classification groups
      if (!classificationType1) {
        throw new Error('Vui lòng chọn nhóm phân loại chính trước khi tạo sản phẩm');
      }
      // Classification type 2 is optional - only validate if enabled AND has values
      if (enableClassification2 && classification2Values.length > 0 && !classificationType2) {
        throw new Error('Vui lòng chọn nhóm phân loại 2 hoặc tắt tính năng phân loại 2');
      }
      // Validation
      if (variantTable.length === 0) {
        throw new Error('Vui lòng thêm ít nhất 1 phân loại để tạo biến thể');
      }

      for (const variant of variantTable) {
        if (!variant.sku || variant.sku.trim() === '') {
          throw new Error('Vui lòng nhập SKU cho tất cả biến thể');
        }
        if (!variant.price || variant.price <= 0) {
          throw new Error('Vui lòng nhập giá hợp lệ cho tất cả biến thể');
        }
        if (variant.stock < 0) {
          throw new Error('Số lượng kho không được âm');
        }
      }

      // Prepare variants as JSON
      const variants = variantTable.map(variant => {
        const variantValues = [];

        if (variant.classification1) {
          variantValues.push({
            productAttributeId: classificationType1,
            value: variant.classification1
          });
        }

        if (enableClassification2 && variant.classification2) {
          variantValues.push({
            productAttributeId: classificationType2,
            value: variant.classification2
          });
        }

        return {
          sku: variant.sku,
          price: parseFloat(variant.price),
          stock: parseInt(variant.stock),
          variantValues: variantValues
        };
      });

      // Create product with JSON (basic info + primary attribute + shipping dimensions)
      const productData = {
        name: values.name.trim(),
        description: values.description?.trim() || '',
        categoryId: values.categoryId,
        basePrice: values.basePrice,
        primaryAttributeId: classificationType1, // Set primary attribute based on classification type 1
        // Shipping dimensions (optional)
        weightGrams: values.weightGrams || null,
        lengthCm: values.lengthCm || null,
        widthCm: values.widthCm || null,
        heightCm: values.heightCm || null,
        variants: variants
      };

      const response = await createProduct(productData);
      
      // Store created product
      const productResult = response.data || response;
      setCreatedProduct(productResult);
      message.success(`Tạo sản phẩm thành công! (ID: ${productResult.id})`);
      
      // Move to next step
      nextStep();

    } catch (error) {
      message.error(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Upload images
  const uploadImages = async () => {
    if (!createdProduct?.id) {
      message.error('Không tìm thấy thông tin sản phẩm');
      return;
    }

    setLoading(true);
    let uploadResults = { main: false, gallery: false, variants: false };

    try {
      // Upload main image
      if (mainImageFile) {
        try {
          await ImageUploadService.uploadProductMain(
            createdProduct.id, 
            mainImageFile,
            () => {} // Silent progress
          );
          uploadResults.main = true;
        } catch (_error) {
          message.error('Không thể tải ảnh đại diện');
        }
      }

      // Upload gallery images
      if (galleryImageFiles.length > 0) {
        try {
          await ImageUploadService.uploadProductGallery(
            createdProduct.id, 
            galleryImageFiles,
            () => {} // Silent progress
          );
          uploadResults.gallery = true;
        } catch (_error) {
          message.error('Không thể tải ảnh thư viện');
        }
      }

      // Upload variant images
      if (Object.keys(variantImages).length > 0) {
        let variantSuccessCount = 0;
        const totalVariants = Object.keys(variantImages).length;
        
        for (const [variantValue, file] of Object.entries(variantImages)) {
          try {
            await ImageUploadService.uploadVariantImage(
              createdProduct.id, 
              file, 
              variantValue, 
              () => {} // Silent progress
            );
            variantSuccessCount++;
          } catch (_error) {
            message.error(`Không thể tải ảnh phân loại "${variantValue}"`);
          }
        }
        
        uploadResults.variants = variantSuccessCount > 0;
        if (variantSuccessCount < totalVariants) {
          message.warning(`Chỉ tải được ${variantSuccessCount}/${totalVariants} ảnh phân loại`);
        }
      }

      // Check results
      const successCount = Object.values(uploadResults).filter(Boolean).length;
      const totalUploads = (mainImageFile ? 1 : 0) + (galleryImageFiles.length > 0 ? 1 : 0) + (Object.keys(variantImages).length > 0 ? 1 : 0);

      if (successCount === totalUploads && totalUploads > 0) {
        message.success('🎉 Tải lên tất cả hình ảnh thành công!');
        nextStep(); // Go to final step
      } else if (successCount > 0) {
        message.warning(`⚠️ Tải lên thành công ${successCount}/${totalUploads} loại hình ảnh.`);
        nextStep();
      } else if (totalUploads > 0) {
        message.error('❌ Không thể tải lên hình ảnh nào. Vui lòng thử lại.');
      } else {
        message.info('ℹ️ Không có hình ảnh nào được chọn.');
        nextStep();
      }

    } catch (_error) {
      message.error('Có lỗi xảy ra khi tải lên hình ảnh');
    } finally {
      setLoading(false);
    }
  };

  // Reset all form data
  const resetForm = () => {
    form.resetFields();
    setClassification1Values([]);
    setClassification2Values([]);
    setVariantTable([]);
    setMainImageFile(null);
    setGalleryImageFiles([]);
    setVariantImages({});
    setCreatedProduct(null);
    setCurrentStep(0);
  };

  // Step 0 component - Basic Info & Variants
  const renderStep0 = () => {
    if (attributesLoading) {
      return (
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">Đang tải thuộc tính sản phẩm...</div>
        </div>
      );
    }

    return (
      <Form form={form} layout="vertical" onFinish={onFinishStep1}>
        {/* Thông tin cơ bản */}
        <Card title={<><ShopOutlined className="mr-2" />Thông tin cơ bản sản phẩm</>} size="small" className="mb-4">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input placeholder="Ví dụ: Giày thể thao Nam" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Danh mục"
                name="categoryId"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select placeholder="Chọn danh mục" size="large">
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Mô tả sản phẩm" name="description">
                <TextArea rows={4} placeholder="Mô tả chi tiết về sản phẩm..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Giá cơ bản (VND)"
                name="basePrice"
                rules={[{ required: true, message: 'Vui lòng nhập giá cơ bản' }]}
              >
                <InputNumber
                  placeholder="299000"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin vận chuyển */}
        <Card title={<><InboxOutlined className="mr-2" />Thông tin vận chuyển</>} size="small" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item
                label="Cân nặng (gram)"
                name="weightGrams"
                tooltip="Khối lượng sản phẩm tính bằng gram"
              >
                <InputNumber
                  placeholder="500"
                  style={{ width: '100%' }}
                  min={1}
                  max={50000}
                  addonAfter="g"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Chiều dài (cm)"
                name="lengthCm"
                tooltip="Chiều dài của kiện hàng"
              >
                <InputNumber
                  placeholder="30"
                  style={{ width: '100%' }}
                  min={1}
                  max={200}
                  addonAfter="cm"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Chiều rộng (cm)"
                name="widthCm"
                tooltip="Chiều rộng của kiện hàng"
              >
                <InputNumber
                  placeholder="20"
                  style={{ width: '100%' }}
                  min={1}
                  max={200}
                  addonAfter="cm"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Chiều cao (cm)"
                name="heightCm"
                tooltip="Chiều cao của kiện hàng"
              >
                <InputNumber
                  placeholder="10"
                  style={{ width: '100%' }}
                  min={1}
                  max={200}
                  addonAfter="cm"
                />
              </Form.Item>
            </Col>
          </Row>
          <Text type="secondary" className="text-xs">
            💡 Thông tin vận chuyển giúp tính phí ship chính xác hơn. Nếu không nhập, hệ thống sẽ sử dụng giá trị mặc định.
          </Text>
        </Card>

        {/* Phân loại hàng hóa */}
        <Card title="Phân loại hàng hóa" size="small" className="mb-4">
          <Row gutter={16}>
            <Col span={enableClassification2 ? 12 : 24}>
              <div className="p-4 bg-blue-50 rounded-lg mb-4">
                <div className="mb-3">
                  <Text strong>Nhóm phân loại 1 (Chính): </Text>
                  <Select
                    value={classificationType1}
                    onChange={setClassificationType1}
                    style={{ width: 150, marginLeft: 8 }}
                    size="large"
                  >
                    {productAttributes.map(attr => (
                      <Option 
                        key={attr.id} 
                        value={attr.id}
                        disabled={attr.id === classificationType2}
                      >
                        {attr.name}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  {classification1Values.map((value, index) => (
                    <Tag
                      key={index}
                      closable
                      onClose={() => removeClassification1Value(value)}
                      className="mb-2 py-1 px-3"
                      color="blue"
                    >
                      {value}
                    </Tag>
                  ))}

                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <Input
                        value={classification1Input}
                        onChange={(e) => setClassification1Input(e.target.value)}
                        placeholder={classificationType1 ? `Thêm ${getAttributeName(classificationType1)}` : 'Chọn nhóm phân loại trước'}
                        style={{ width: 200 }}
                        size="large"
                        onPressEnter={() => addClassification1Value(classification1Input)}
                        disabled={!classificationType1}
                      />
                      <Button
                        size="large"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => addClassification1Value(classification1Input)}
                        disabled={!classificationType1 || !classification1Input.trim()}
                      />
                    </div>
                </div>
              </div>
            </Col>

            <Col span={24} className="mb-3">
              <Checkbox
                checked={enableClassification2}
                onChange={(e) => {
                  setEnableClassification2(e.target.checked);
                  if (!e.target.checked) {
                    setClassification2Values([]);
                  }
                }}
              >
                <Text strong>Thêm nhóm phân loại 2 (tùy chọn)</Text>
              </Checkbox>
            </Col>

            {enableClassification2 && (
              <Col span={12}>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="mb-3">
                    <Text strong>Nhóm phân loại 2: </Text>
                    <Select
                      value={classificationType2}
                      onChange={setClassificationType2}
                      style={{ width: 150, marginLeft: 8 }}
                      size="large"
                    >
                      {productAttributes.map(attr => (
                        <Option 
                          key={attr.id} 
                          value={attr.id}
                          disabled={attr.id === classificationType1}
                        >
                          {attr.name}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    {classification2Values.map((value, index) => (
                      <Tag
                        key={index}
                        closable
                        onClose={() => removeClassification2Value(value)}
                        className="mb-2 py-1 px-3"
                        color="green"
                      >
                        {value}
                      </Tag>
                    ))}

                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <Input
                        value={classification2Input}
                        onChange={(e) => setClassification2Input(e.target.value)}
                        placeholder={classificationType2 ? `Thêm ${getAttributeName(classificationType2)}` : 'Chọn nhóm phân loại 2 trước'}
                        style={{ width: 200 }}
                        size="large"
                        onPressEnter={() => addClassification2Value(classification2Input)}
                        disabled={!classificationType2}
                      />
                      <Button
                        size="large"
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => addClassification2Value(classification2Input)}
                        disabled={!classificationType2 || !classification2Input.trim()}
                      />
                    </div>
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Card>

        {/* Bảng variants */}
        {variantTable.length > 0 && (
          <Card title="Thông tin bán hàng" size="small" className="mb-4">
            <Table
              columns={variantColumns}
              dataSource={variantTable}
              pagination={false}
              size="middle"
              scroll={{ x: 600 }}
              bordered
            />
          </Card>
        )}

        {/* Buttons */}
        <div className="text-right">
          <Space size="middle">
            <Button onClick={resetForm} size="large">
              Đặt lại
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              Tiếp theo: Thêm hình ảnh
            </Button>
          </Space>
        </div>
      </Form>
    );
  };

  // Step 1 component - Image Upload
  const renderStep1 = () => (
    <div>
      <Card title="Tải lên hình ảnh sản phẩm" size="small" className="mb-4">
        <Row gutter={24}>
          {/* Main Image */}
          <Col xs={24} md={8}>
            <div className="mb-4">
              <Text strong className="text-base mb-3 block">📷 Ảnh đại diện chính</Text>
              <Dragger
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
                listType="picture"
                accept="image/*"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click hoặc kéo thả ảnh vào đây</p>
                <p className="ant-upload-hint">Ảnh chính hiển thị khi xem sản phẩm</p>
              </Dragger>
            </div>
          </Col>

          {/* Gallery Images */}
          <Col xs={24} md={8}>
            <div className="mb-4">
              <Text strong className="text-base mb-3 block">🖼️ Thư viện ảnh (tối đa 5)</Text>
              <Upload
                listType="picture-card"
                multiple
                maxCount={5}
                beforeUpload={(file) => {
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
                accept="image/*"
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
              <Text strong className="text-base mb-3 block">
                🎨 Ảnh cho từng phân loại {getAttributeName(classificationType1)}
              </Text>
              
              {classification1Values.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Text type="secondary">Chưa có phân loại nào</Text>
                </div>
              ) : (
                classification1Values.map((variantValue, index) => (
                  <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <Text className="text-sm font-medium block mb-2">{variantValue}:</Text>
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
                      accept="image/*"
                    >
                      {variantImages[variantValue] ? null : (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Ảnh</div>
                        </div>
                      )}
                    </Upload>
                  </div>
                ))
              )}
            </div>
          </Col>
        </Row>

        <Divider />

        <div className="p-4 bg-blue-50 rounded-lg mb-4">
          <Text className="text-blue-800">
            💡 <strong>Lưu ý:</strong> Hình ảnh sẽ được tải lên server sau khi bạn nhấn "Tải lên hình ảnh".
            Bạn có thể bỏ qua bước này và thêm ảnh sau.
          </Text>
        </div>
      </Card>

      {/* Buttons */}
      <div className="text-right">
        <Space size="middle">
          <Button onClick={prevStep} icon={<ArrowLeftOutlined />} size="large">
            Quay lại
          </Button>
          <Button onClick={() => nextStep()} size="large">
            Bỏ qua hình ảnh
          </Button>
          <Button 
            type="primary" 
            onClick={uploadImages} 
            loading={loading}
            icon={<UploadOutlined />}
            size="large"
          >
            Tải lên hình ảnh
          </Button>
        </Space>
      </div>
    </div>
  );

  // Step 2 component - Confirmation
  const renderStep2 = () => (
    <div>
      <Card title="Tạo sản phẩm hoàn tất" size="small" className="mb-4">
        <div className="text-center py-8">
          <CheckOutlined className="text-green-500 text-6xl mb-4" />
          <Title level={3} className="text-green-600 mb-2">
            Tạo sản phẩm thành công!
          </Title>
          <Text className="text-gray-600 mb-4 block">
            Sản phẩm "{createdProduct?.name}" đã được tạo thành công với ID: {createdProduct?.id}
          </Text>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
            <Text strong>Thông tin sản phẩm:</Text>
            <div className="mt-2">
              <p><Text strong>Tên:</Text> {createdProduct?.name}</p>
              <p><Text strong>Giá cơ bản:</Text> {createdProduct?.basePrice?.toLocaleString()} VND</p>
              <p><Text strong>Số biến thể:</Text> {variantTable.length}</p>
              <p><Text strong>Hình ảnh:</Text> 
                {mainImageFile ? ' Ảnh đại diện' : ''}
                {galleryImageFiles.length > 0 ? ` + ${galleryImageFiles.length} ảnh thư viện` : ''}
                {Object.keys(variantImages).length > 0 ? ` + ${Object.keys(variantImages).length} ảnh phân loại` : ''}
                {!mainImageFile && galleryImageFiles.length === 0 && Object.keys(variantImages).length === 0 ? ' Chưa có' : ''}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Space>
            <Button type="primary" onClick={resetForm}>
              Tạo sản phẩm mới
            </Button>
            <Button onClick={() => window.location.href = '/seller/products'}>
              Xem danh sách sản phẩm
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="add-product-form">
      {/* Progress Steps */}
      <div className="mb-6">
        <Steps current={currentStep} size="small">
          <Step title="Thông tin cơ bản" description="Tạo sản phẩm và phân loại" />
          <Step title="Hình ảnh" description="Tải lên ảnh sản phẩm" />
          <Step title="Hoàn tất" description="Xem kết quả" />
        </Steps>
      </div>

      {/* Step Content */}
      {currentStep === 0 && renderStep0()}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
    </div>
  );
};

export default AddProductForm;