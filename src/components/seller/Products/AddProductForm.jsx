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
} from 'antd';
import { UploadOutlined, PlusOutlined, CheckOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { createProduct } from '../../../services/seller/productService';
import ImageUploadService from '../../../services/ImageUploadService';
import api from '../../../services/api';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { Title, Text } = Typography;

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
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [createdProduct, setCreatedProduct] = useState(null);

  // Attribute mapping for primary attribute setting (corrected to match database)
  const attributeMap = { size: 1, color: 2, material: 3 };

  // States cho phân loại
  const [classificationType1, setClassificationType1] = useState('color');
  const [classificationType2, setClassificationType2] = useState('size');
  const [enableClassification2, setEnableClassification2] = useState(false);
  const [classification1Values, setClassification1Values] = useState([]);
  const [classification2Values, setClassification2Values] = useState([]);
  const [variantTable, setVariantTable] = useState([]);

  // Images - now handled after product creation
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [variantImages, setVariantImages] = useState({}); // { variantValue: File }

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      message.error('Không thể tải danh mục');
    }
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
        item[classificationType1] === v1 &&
        (!enableClassification2 || item[classificationType2] === v2)
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
            [classificationType1]: value1,
            [classificationType2]: value2,
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
          [classificationType1]: value1,
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
    if (value && !classification1Values.includes(value)) {
      setClassification1Values([...classification1Values, value]);
    }
  };

  const addClassification2Value = (value) => {
    if (value && !classification2Values.includes(value)) {
      setClassification2Values([...classification2Values, value]);
    }
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
      title: classificationType1 === 'color' ? 'Màu sắc' :
        classificationType1 === 'size' ? 'Kích cỡ' : 'Chất liệu',
      dataIndex: classificationType1,
      key: classificationType1,
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    ...(enableClassification2 ? [{
      title: classificationType2 === 'color' ? 'Màu sắc' :
        classificationType2 === 'size' ? 'Kích cỡ' : 'Chất liệu',
      dataIndex: classificationType2,
      key: classificationType2,
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

        if (variant[classificationType1]) {
          variantValues.push({
            productAttributeId: attributeMap[classificationType1],
            value: variant[classificationType1]
          });
        }

        if (enableClassification2 && variant[classificationType2]) {
          variantValues.push({
            productAttributeId: attributeMap[classificationType2],
            value: variant[classificationType2]
          });
        }

        return {
          sku: variant.sku,
          price: parseFloat(variant.price),
          stock: parseInt(variant.stock),
          variantValues: variantValues
        };
      });

      // Create product with JSON (basic info + primary attribute)
      const productData = {
        name: values.name.trim(),
        description: values.description?.trim() || '',
        categoryId: values.categoryId,
        basePrice: values.basePrice,
        primaryAttributeId: attributeMap[classificationType1], // Set primary attribute based on classification type 1
        variants: variants
      };

      console.log('📦 Creating product with data (includes primary attribute):', productData);
      const response = await createProduct(productData);
      console.log('✅ Product created:', response);
      
      // Debug response structure and timestamps
      const productResult = response.data || response;
      console.log('🔍 Created product details:', {
        id: productResult.id,
        name: productResult.name,
        shopId: productResult.shopId,
        productCondition: productResult.productCondition,
        rating: productResult.rating,
        reviewCount: productResult.reviewCount,
        soldCount: productResult.soldCount,
        createdAt: productResult.createdAt,
        updatedAt: productResult.updatedAt,
        timestamps: {
          createdAt_formatted: productResult.createdAt ? new Date(productResult.createdAt).toLocaleString('vi-VN') : 'null',
          updatedAt_formatted: productResult.updatedAt ? new Date(productResult.updatedAt).toLocaleString('vi-VN') : 'null'
        }
      });

      // Store created product
      setCreatedProduct(productResult);
      message.success(`Tạo sản phẩm thành công! (ID: ${productResult.id})`);
      
      // Move to next step
      nextStep();

    } catch (error) {
      console.error('Create product error:', error);
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
          // Debug token from all possible sources  
          const correctToken = localStorage.getItem('access_token'); // Correct key!
          const wrongToken1 = localStorage.getItem('accessToken');
          const wrongToken2 = localStorage.getItem('token');
          
          console.log('🔑 Token debug (FIXED):', {
            correct_access_token: !!correctToken,
            wrong_accessToken: !!wrongToken1,
            wrong_token: !!wrongToken2,
            correctPreview: correctToken ? `${correctToken.substring(0, 20)}...` : 'none'
          });
          
          console.log('📸 Uploading main image:', {
            productId: createdProduct.id,
            fileName: mainImageFile.name,
            fileSize: mainImageFile.size,
            fileType: mainImageFile.type,
            endpoint: `http://localhost:8081/api/products/${createdProduct.id}/images/main`
          });
          
          await ImageUploadService.uploadProductMain(
            createdProduct.id, 
            mainImageFile,
            (progress) => console.log(`Main image upload: ${progress}%`)
          );
          uploadResults.main = true;
          console.log('✅ Main image uploaded successfully');
        } catch (error) {
          console.error('❌ Main image upload failed:', error);
          message.error(`Không thể tải ảnh đại diện: ${error.message || 'Lỗi server'}`);
        }
      }

      // Upload gallery images
      if (galleryImageFiles.length > 0) {
        try {
          console.log('🖼️ Uploading gallery images:', {
            productId: createdProduct.id,
            fileCount: galleryImageFiles.length,
            totalSize: galleryImageFiles.reduce((sum, f) => sum + f.size, 0)
          });
          
          await ImageUploadService.uploadProductGallery(
            createdProduct.id, 
            galleryImageFiles,
            (progress) => console.log(`Gallery upload: ${progress}%`)
          );
          uploadResults.gallery = true;
          console.log('✅ Gallery images uploaded successfully');
        } catch (error) {
          console.error('❌ Gallery images upload failed:', error);
          message.error(`Không thể tải ảnh thư viện: ${error.message || 'Lỗi server'}`);
        }
      }

      // Upload variant images
      if (Object.keys(variantImages).length > 0) {
        let variantSuccessCount = 0;
        const totalVariants = Object.keys(variantImages).length;
        
        for (const [variantValue, file] of Object.entries(variantImages)) {
          try {
            console.log(`🎨 Uploading variant image for "${variantValue}":`, {
              productId: createdProduct.id,
              fileName: file.name,
              fileSize: file.size,
              attributeValue: variantValue
            });
            
            await ImageUploadService.uploadVariantImage(
              createdProduct.id, 
              file, 
              variantValue, 
              (progress) => console.log(`Uploading ${variantValue}: ${progress}%`)
            );
            variantSuccessCount++;
            console.log(`✅ Variant image "${variantValue}" uploaded successfully`);
          } catch (error) {
            console.error(`❌ Variant image "${variantValue}" upload failed:`, error);
            message.error(`Không thể tải ảnh phân loại "${variantValue}": ${error.message || 'Lỗi server'}`);
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

      console.log('📊 Upload results summary:', {
        uploadResults,
        successCount,
        totalUploads,
        mainImage: mainImageFile ? 'Selected' : 'None',
        galleryCount: galleryImageFiles.length,
        variantCount: Object.keys(variantImages).length
      });

      if (successCount === totalUploads && totalUploads > 0) {
        message.success('🎉 Tải lên tất cả hình ảnh thành công!');
        nextStep(); // Go to final step
      } else if (successCount > 0) {
        message.warning(`⚠️ Tải lên thành công ${successCount}/${totalUploads} loại hình ảnh. Một số ảnh gặp lỗi.`);
        nextStep();
      } else if (totalUploads > 0) {
        message.error('❌ Không thể tải lên hình ảnh nào. Vui lòng kiểm tra kết nối và thử lại.');
        // Don't advance to next step on total failure
      } else {
        message.info('ℹ️ Không có hình ảnh nào được chọn. Bạn có thể thêm sau.');
        nextStep();
      }

    } catch (error) {
      console.error('Image upload error:', error);
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
  const renderStep0 = () => (
    <Form form={form} layout="vertical" onFinish={onFinishStep1}>
      {/* Thông tin cơ bản */}
      <Card title="Thông tin cơ bản sản phẩm" size="small" className="mb-4">
        <Row gutter={[16, 0]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Tên sản phẩm"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            >
              <Input placeholder="Ví dụ: Giày thể thao Nam" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Danh mục"
              name="categoryId"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
            >
              <Select placeholder="Chọn danh mục">
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
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* Phân loại hàng hóa */}
      <Card title="Phân loại hàng hóa" size="small" className="mb-4">
        <Row gutter={16}>
          <Col span={enableClassification2 ? 12 : 24}>
            <div>
              <div className="mb-2">
                <span>Nhóm phân loại 1: </span>
                <Select
                  value={classificationType1}
                  onChange={setClassificationType1}
                  style={{ width: 120, marginLeft: 8 }}
                >
                  <Option value="color">Màu sắc</Option>
                  <Option value="size">Kích cỡ</Option>
                  <Option value="material">Chất liệu</Option>
                </Select>
              </div>

              <div>
                {classification1Values.map((value, index) => (
                  <Tag
                    key={index}
                    closable
                    onClose={() => removeClassification1Value(value)}
                    className="mb-2"
                  >
                    {value}
                  </Tag>
                ))}

                <Input
                  placeholder={`Thêm ${classificationType1 === 'color' ? 'màu sắc' :
                    classificationType1 === 'size' ? 'kích cỡ' : 'chất liệu'}`}
                  style={{ width: 200, marginTop: 8 }}
                  onPressEnter={(e) => {
                    addClassification1Value(e.target.value);
                    e.target.value = '';
                  }}
                />
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
              Thêm nhóm phân loại 2 (tùy chọn)
            </Checkbox>
          </Col>

          {enableClassification2 && (
            <Col span={12}>
              <div>
                <div className="mb-2">
                  <span>Nhóm phân loại 2: </span>
                  <Select
                    value={classificationType2}
                    onChange={setClassificationType2}
                    style={{ width: 120, marginLeft: 8 }}
                  >
                    <Option value="color" disabled={classificationType1 === 'color'}>Màu sắc</Option>
                    <Option value="size" disabled={classificationType1 === 'size'}>Kích cỡ</Option>
                    <Option value="material" disabled={classificationType1 === 'material'}>Chất liệu</Option>
                  </Select>
                </div>

                <div>
                  {classification2Values.map((value, index) => (
                    <Tag
                      key={index}
                      closable
                      onClose={() => removeClassification2Value(value)}
                      className="mb-2"
                    >
                      {value}
                    </Tag>
                  ))}

                  <Input
                    placeholder={`Thêm ${classificationType2 === 'color' ? 'màu sắc' :
                      classificationType2 === 'size' ? 'kích cỡ' : 'chất liệu'}`}
                    style={{ width: 200, marginTop: 8 }}
                    onPressEnter={(e) => {
                      addClassification2Value(e.target.value);
                      e.target.value = '';
                    }}
                  />
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
            size="small"
            scroll={{ x: 600 }}
            bordered
          />
        </Card>
      )}

      {/* Buttons */}
      <div className="text-right">
        <Space>
          <Button onClick={resetForm}>
            Đặt lại
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tiếp theo: Thêm hình ảnh
          </Button>
        </Space>
      </div>
    </Form>
  );

  // Step 1 component - Image Upload
  const renderStep1 = () => (
    <div>
      <Card title="Tải lên hình ảnh sản phẩm" size="small" className="mb-4">
        <Row gutter={16}>
          {/* Main Image */}
          <Col xs={24} md={8}>
            <div className="mb-4">
              <Text strong>Ảnh đại diện chính</Text>
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

          {/* Gallery Images */}
          <Col xs={24} md={8}>
            <div className="mb-4">
              <Text strong>Thư viện ảnh (tối đa 5)</Text>
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
              <Text strong>Ảnh cho từng phân loại {classificationType1 === 'color' ? 'màu sắc' : classificationType1 === 'size' ? 'kích cỡ' : 'chất liệu'}</Text>
              {classification1Values.map((variantValue, index) => {
                return (
                  <div key={index} className="mb-2">
                    <Text className="text-sm">{variantValue}:</Text>
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
                );
              })}
            </div>
          </Col>
        </Row>

        <div className="text-sm text-gray-500 mb-4">
          <p>💡 <strong>Lưu ý:</strong> Hình ảnh sẽ được tải lên server sau khi bạn nhấn "Tải lên hình ảnh".</p>
        </div>
      </Card>

      {/* Buttons */}
      <div className="text-right">
        <Space>
          <Button onClick={prevStep} icon={<ArrowLeftOutlined />}>
            Quay lại
          </Button>
          <Button onClick={() => nextStep()}>
            Bỏ qua hình ảnh
          </Button>
          <Button 
            type="primary" 
            onClick={uploadImages} 
            loading={loading}
            icon={<UploadOutlined />}
          >
            Tải lên hình ảnh
          </Button>
          <Button 
            onClick={async () => {
              // Quick test endpoint
              try {
                const token = localStorage.getItem('access_token'); // Use correct storage key
                const response = await fetch(`http://localhost:8081/api/products/${createdProduct?.id}`, {
                  headers: { 'Authorization': token ? `Bearer ${token}` : '' }
                });
                const data = await response.json();
                console.log('🧪 Test API response:', { status: response.status, data });
                message.info(`API Test: ${response.status} - ${data?.message || 'OK'}`);
              } catch (err) {
                console.error('🧪 Test API failed:', err);
                message.error('API connection failed');
              }
            }}
          >
            Test API
          </Button>
          <Button 
            onClick={() => {
              // Force set a test token for debugging
              const testToken = prompt('Enter test token (optional):');
              if (testToken) {
                localStorage.setItem('access_token', testToken); // Use correct key
                message.success('Test token set!');
              } else {
                // Show current token info
                const currentToken = localStorage.getItem('access_token'); // Use correct key
                message.info(currentToken ? `Token exists: ${currentToken.substring(0, 30)}...` : 'No token found - please login first');
              }
            }}
          >
            Debug Token
          </Button>
        </Space>
        
        {/* Debug info */}
        <div className="mt-4 text-xs text-gray-500">
          <p>🔧 <strong>Debug:</strong> Product ID: {createdProduct?.id}</p>
          <p>📸 Images: {mainImageFile ? '1 main' : '0 main'} + {galleryImageFiles.length} gallery + {Object.keys(variantImages).length} variant</p>
          <p>🌐 Backend: http://localhost:8081/api/products/{createdProduct?.id}/images/*</p>
        </div>
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