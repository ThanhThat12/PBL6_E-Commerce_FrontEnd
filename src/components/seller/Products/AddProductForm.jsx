import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  Card,
  Row,
  Col,
  message,
  Space,
  Table,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { createProduct } from '../../../services/seller/productService';
import api from '../../../services/api';

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

/**
 * AddProductForm Component
 * Form để tạo sản phẩm mới với variant system
 */
const AddProductForm = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // States cho phân loại
  const [classificationType1, setClassificationType1] = useState('color');
  const [classificationType2, setClassificationType2] = useState('size');
  const [classification1Values, setClassification1Values] = useState([]);
  const [classification2Values, setClassification2Values] = useState([]);
  const [variantTable, setVariantTable] = useState([]);
  
  // Images
  const [mainImageFile, setMainImageFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

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

  // Tạo bảng variants tự động
  const generateVariantTable = () => {
    if (classification1Values.length === 0 || classification2Values.length === 0) {
      setVariantTable([]);
      return;
    }

    const newVariantTable = [];
    let index = 0;

    classification1Values.forEach(value1 => {
      classification2Values.forEach(value2 => {
        const sku = `${value1}-${value2}`.toUpperCase().replace(/\s+/g, '-');
        
        newVariantTable.push({
          key: index++,
          [classificationType1]: value1,
          [classificationType2]: value2,
          sku: sku,
          price: 0,
          stock: 0
        });
      });
    });

    setVariantTable(newVariantTable);
  };

  useEffect(() => {
    generateVariantTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classification1Values, classification2Values, classificationType1, classificationType2]);

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

  // Columns cho bảng variants
  const variantColumns = [
    {
      title: classificationType1 === 'color' ? 'Màu sắc' : 
             classificationType1 === 'size' ? 'Kích cỡ' : 'Chất liệu',
      dataIndex: classificationType1,
      key: classificationType1,
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: classificationType2 === 'color' ? 'Màu sắc' : 
             classificationType2 === 'size' ? 'Kích cỡ' : 'Chất liệu',
      dataIndex: classificationType2,
      key: classificationType2,
      width: 120,
      render: (text) => <Tag color="green">{text}</Tag>
    },
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

  // Upload handlers
  const handleMainImageUpload = (info) => {
    const { fileList } = info;
    if (fileList.length > 0) {
      setMainImageFile(fileList[fileList.length - 1]);
    } else {
      setMainImageFile(null);
    }
  };

  const handleImageUpload = ({ fileList }) => {
    setImageFiles(fileList);
  };

  // Submit form
  const onFinish = async (values) => {
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

      // Tạo FormData
      const formData = new FormData();
      
      // Add product info
      formData.append('name', values.name.trim());
      formData.append('description', values.description?.trim() || '');
      formData.append('categoryId', values.categoryId);
      formData.append('basePrice', values.basePrice);

      // Add main image
      if (mainImageFile?.originFileObj) {
        formData.append('mainImage', mainImageFile.originFileObj);
      }

      // Add variant images
      imageFiles.forEach((file, index) => {
        if (file.originFileObj) {
          formData.append('variantImages', file.originFileObj);
        }
      });

      // Add variants as JSON
      const variants = variantTable.map(variant => {
        const variantValues = [];

        // Attribute type mapping
        const attributeMap = { color: 1, size: 2, material: 3 };

        if (variant[classificationType1]) {
          variantValues.push({
            productAttributeId: attributeMap[classificationType1],
            value: variant[classificationType1]
          });
        }

        if (variant[classificationType2]) {
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

      formData.append('variants', JSON.stringify(variants));

      // Gọi API
      await createProduct(formData);
      
      message.success('Tạo sản phẩm thành công!');
      
      // Reset form
      form.resetFields();
      setClassification1Values([]);
      setClassification2Values([]);
      setVariantTable([]);
      setImageFiles([]);
      setMainImageFile(null);

    } catch (error) {
      console.error('Create product error:', error);
      message.error(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-form">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Thông tin cơ bản */}
        <Card title="Thông tin cơ bản" size="small" className="mb-4">
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

            <Col xs={24} md={16}>
              <Form.Item label="Hình ảnh chính" required>
                <Upload
                  listType="picture-card"
                  fileList={mainImageFile ? [mainImageFile] : []}
                  onChange={handleMainImageUpload}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                >
                  {!mainImageFile && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload ảnh chính</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Phân loại hàng hóa */}
        <Card title="Phân loại hàng hóa" size="small" className="mb-4">
          <Row gutter={16}>
            <Col span={12}>
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

        {/* Hình ảnh sản phẩm */}
        <Card title="Hình ảnh sản phẩm" size="small" className="mb-4">
          <Dragger
            multiple
            listType="picture"
            fileList={imageFiles}
            onChange={handleImageUpload}
            beforeUpload={() => false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click hoặc kéo thả file vào đây</p>
            <p className="ant-upload-hint">Hỗ trợ JPG, PNG (tối đa 9 ảnh)</p>
          </Dragger>
        </Card>

        {/* Buttons */}
        <div className="text-right">
          <Space>
            <Button onClick={() => {
              form.resetFields();
              setClassification1Values([]);
              setClassification2Values([]);
              setVariantTable([]);
              setImageFiles([]);
              setMainImageFile(null);
            }}>
              Đặt lại
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu sản phẩm
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default AddProductForm;
