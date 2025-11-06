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
  Divider,
  Table,
  Tag,
  Checkbox
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  InboxOutlined
} from '@ant-design/icons';
import productService from '../../../services/productService';
import shopService from '../../../services/shopService';
import './AddProductForm.css';

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const AddProductForm = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ States cho phân loại
  const [classificationType1, setClassificationType1] = useState('color'); // color, size, material
  const [classificationType2, setClassificationType2] = useState('size'); // color, size, material
  const [classification1Values, setClassification1Values] = useState([]); // ["Đỏ", "Xanh", "Đen"]
  const [classification2Values, setClassification2Values] = useState([]); // ["S", "M", "L"]
  const [variantTable, setVariantTable] = useState([]); // Bảng variants tự động tạo
  const [imageFiles, setImageFiles] = useState([]); // Danh sách file ảnh

  // ✅ Thêm state cho main image
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  // ✅ Khi thay đổi phân loại → tạo lại bảng variants
  useEffect(() => {
    generateVariantTable();
  }, [classification1Values, classification2Values, classificationType1, classificationType2]);

  const fetchInitialData = async () => {
    try {
      const categoriesData = await productService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.warn('Không lấy được dữ liệu khởi tạo:', err);
      message.error('Có lỗi khi tải dữ liệu');
    }
  };

  // ✅ Tạo bảng variants tự động
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
    console.log('🔄 Generated variant table:', newVariantTable);
  };

  // ✅ Cập nhật giá trị trong bảng variants
  const updateVariantValue = (key, field, value) => {
    const newTable = variantTable.map(item => 
      item.key === key ? { ...item, [field]: value } : item
    );
    setVariantTable(newTable);
  };

  // ✅ Thêm giá trị phân loại 1
  const addClassification1Value = (value) => {
    if (value && !classification1Values.includes(value)) {
      setClassification1Values([...classification1Values, value]);
    }
  };

  // ✅ Thêm giá trị phân loại 2
  const addClassification2Value = (value) => {
    if (value && !classification2Values.includes(value)) {
      setClassification2Values([...classification2Values, value]);
    }
  };

  // ✅ Xóa giá trị phân loại
  const removeClassification1Value = (value) => {
    setClassification1Values(classification1Values.filter(v => v !== value));
  };

  const removeClassification2Value = (value) => {
    setClassification2Values(classification2Values.filter(v => v !== value));
  };

  // ✅ Cột cho bảng variants
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

  // ✅ Xử lý upload ảnh chính
  const handleMainImageUpload = (info) => {
    const { file, fileList } = info;
    
    if (fileList.length > 0) {
      const latestFile = fileList[fileList.length - 1];
      setMainImageFile(latestFile);
      
      // Tạo preview URL
      if (latestFile.originFileObj) {
        const reader = new FileReader();
        reader.onload = (e) => {
          
        };
        reader.readAsDataURL(latestFile.originFileObj);
      }
    } else {
      setMainImageFile(null);
      
    }
  };

  // ✅ Xử lý upload ảnh
  const handleImageUpload = ({ fileList }) => {
    setImageFiles(fileList);
  };

  // ✅ Submit form
  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      console.log('📝 Form values:', values);
      console.log('🎨 Variant table:', variantTable);

      // ✅ Validation
      if (variantTable.length === 0) {
        throw new Error('Vui lòng thêm ít nhất 1 phân loại để tạo biến thể');
      }

      // Kiểm tra variants có đầy đủ thông tin không
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

      // ✅ Tạo variants theo format API
      const variants = variantTable.map(variant => {
        const variantValues = [];

        // Thêm attribute type 1
        if (classificationType1 === 'color') {
          variantValues.push({
            productAttributeId: 1,
            value: variant.color
          });
        } else if (classificationType1 === 'size') {
          variantValues.push({
            productAttributeId: 2,
            value: variant.size
          });
        } else if (classificationType1 === 'material') {
          variantValues.push({
            productAttributeId: 3,
            value: variant.material
          });
        }

        // Thêm attribute type 2
        if (classificationType2 === 'color') {
          variantValues.push({
            productAttributeId: 1,
            value: variant.color
          });
        } else if (classificationType2 === 'size') {
          variantValues.push({
            productAttributeId: 2,
            value: variant.size
          });
        } else if (classificationType2 === 'material') {
          variantValues.push({
            productAttributeId: 3,
            value: variant.material
          });
        }

        return {
          sku: variant.sku,
          price: parseFloat(variant.price),
          stock: parseInt(variant.stock),
          variantValues: variantValues
        };
      });

      // ✅ Tạo images array (giả sử upload ảnh trả về URL)
      const images = imageFiles.map((file, index) => ({
        imageUrl: file.response?.url || `https://example.com/image-${index}.jpg`,
        color: classification1Values[index % classification1Values.length] || null
      }));

      // ✅ Tạo payload
      const productPayload = {
        categoryId: values.categoryId,
        name: values.name.trim(),
        description: values.description?.trim() || '',
        basePrice: parseFloat(values.basePrice),
        mainImage: values.mainImage || images[0]?.imageUrl || 'https://example.com/main.jpg',
        variants: variants,
        images: images
      };

      console.log('🚀 Final payload:', JSON.stringify(productPayload, null, 2));

      // ✅ Gọi API
      const result = await productService.createProduct(productPayload);
      
      console.log('✅ Product created:', result);
      message.success('Tạo sản phẩm thành công! Sản phẩm đang chờ duyệt.');
      
      // ✅ Reset form
      form.resetFields();
      setClassification1Values([]);
      setClassification2Values([]);
      setVariantTable([]);
      setImageFiles([]);

    } catch (error) {
      console.error('❌ Create product error:', error);
      message.error(error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-form">
      <Card title="Thêm sản phẩm mới" className="form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          {/* ✅ Thông tin cơ bản */}
          <Card title="Thông tin cơ bản" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Tên sản phẩm"
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                >
                  <Input placeholder="Giày thể thao Nam Biti's Hunter" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  label="Danh mục"
                  name="categoryId"
                  rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                >
                  <Select placeholder="Giày Dép Nam">
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
                  <TextArea
                    rows={4}
                    placeholder="Mô tả chi tiết về sản phẩm..."
                  />
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
                  <div className="main-image-upload">
                    <Upload
                      listType="picture-card"
                      fileList={mainImageFile ? [mainImageFile] : []}
                      onChange={handleMainImageUpload}
                      beforeUpload={() => false} // Ngăn auto upload
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
                  
                    {/* Fallback input URL */}
                    <Input
                      placeholder="Hoặc nhập URL ảnh: https://example.com/image.jpg"
                      style={{ marginTop: 8 }}
                      onChange={(e) => {
                        if (e.target.value) {
                          setMainImagePreview(e.target.value);
                          // Set form field
                          form.setFieldsValue({ mainImageUrl: e.target.value });
                        }
                      }}
                    />
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ✅ Phân loại hàng hóa */}
          <Card title="Phân loại hàng hóa" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              {/* Phân loại 1 */}
              <Col span={12}>
                <div className="classification-group">
                  <div className="classification-header">
                    <span>Nhóm phân loại 1:</span>
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

                  <div className="classification-values">
                    {classification1Values.map((value, index) => (
                      <Tag
                        key={index}
                        closable
                        onClose={() => removeClassification1Value(value)}
                        style={{ marginBottom: 8 }}
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

              {/* Phân loại 2 */}
              <Col span={12}>
                <div className="classification-group">
                  <div className="classification-header">
                    <span>Nhóm phân loại 2:</span>
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

                  <div className="classification-values">
                    {classification2Values.map((value, index) => (
                      <Tag
                        key={index}
                        closable
                        onClose={() => removeClassification2Value(value)}
                        style={{ marginBottom: 8 }}
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

          {/* ✅ Bảng thông tin bán hàng */}
          {variantTable.length > 0 && (
            <Card title="Thông tin bán hàng" size="small" style={{ marginBottom: 16 }}>
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

          {/* ✅ Quản lý truyền thông */}
          <Card title="Quản lý truyền thông" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={24}>
                <div style={{ marginBottom: 16 }}>
                  <span>Hình ảnh sản phẩm (tối đa 9 ảnh):</span>
                </div>
                
                <Dragger
                  multiple
                  listType="picture"
                  fileList={imageFiles}
                  onChange={handleImageUpload}
                  beforeUpload={() => false} // Ngăn auto upload
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click hoặc kéo thả file vào đây để upload</p>
                  <p className="ant-upload-hint">Hỗ trợ JPG, PNG. Kích thước tối đa 2MB mỗi ảnh.</p>
                </Dragger>
              </Col>
            </Row>
          </Card>

          {/* ✅ Buttons */}
          <Divider />
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                form.resetFields();
                setClassification1Values([]);
                setClassification2Values([]);
                setVariantTable([]);
                setImageFiles([]);
              }}>
                Đặt lại
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu & Hiển thị
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AddProductForm;