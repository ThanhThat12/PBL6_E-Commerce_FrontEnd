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
  Switch
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import productService from '../../../services/productService';
import shopService from '../../../services/shopService';
import './AddProductForm.css';

const { Option } = Select;
const { TextArea } = Input;

const AddProductForm = () => {
  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [variants, setVariants] = useState([]);
  const [shopId, setShopId] = useState(null);

  useEffect(() => {
    const categoriesData = productService.getCategories();
    setCategories(categoriesData);

    // Lấy shopId hiện tại của seller (nếu có)
    (async () => {
      try {
        const shop = await shopService.getShopInfo();
        if (shop && shop.id) setShopId(shop.id);
      } catch (err) {
        console.warn('Không lấy được shop info:', err);
      }
    })();
  }, []);

  const handleCategoryChange = (categoryId) => {
    const category = productService.getCategoryById(categoryId);
    setSelectedCategory(category);
    
    // Reset form khi đổi category
    const basicFields = ['name', 'description', 'price', 'stock', 'category'];
    const formValues = form.getFieldsValue();
    const resetValues = {};
    
    // Giữ lại các field cơ bản
    basicFields.forEach(field => {
      if (formValues[field] !== undefined) {
        resetValues[field] = formValues[field];
      }
    });
    
    form.resetFields();
    form.setFieldsValue(resetValues);
    setVariants([]);
  };

  const handleImageUpload = ({ fileList }) => {
    setImageList(fileList);
  };

  const addVariant = () => {
    if (!selectedCategory) {
      message.warning('Vui lòng chọn hạng mục trước');
      return;
    }
    
    const newVariant = {
      id: Date.now(),
      sku: '',
      price: 0,
      stock: 0,
      attributes: {}
    };
    
    selectedCategory.attributes.forEach(attr => {
      newVariant.attributes[attr.name] = '';
    });
    
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (variantId) => {
    setVariants(variants.filter(v => v.id !== variantId));
  };

  const updateVariant = (variantId, attributeName, value) => {
    setVariants(variants.map(variant => 
      variant.id === variantId 
        ? { ...variant, attributes: { ...variant.attributes, [attributeName]: value } }
        : variant
    ));
  };

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // Upload images
      let imageUrls = [];
      if (imageList.length > 0) {
        const uploadResult = await productService.uploadImages(imageList);
        if (uploadResult.success) {
          imageUrls = uploadResult.urls;
        }
      }

      // Map variants to backend format ProductVariantDTO
      const mappedVariants = variants.map(v => ({
        sku: v.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
        price: v.price || 0,
        stock: v.stock || 0,
        variantValues: Object.keys(v.attributes).map(attrName => ({
          productAttributeId: null, // backend can match by attribute name or we can enhance later
          value: v.attributes[attrName],
          productAttribute: { name: attrName }
        }))
      }));

      // Prepare product payload matching ProductCreateDTO
      const productData = {
        categoryId: selectedCategory?.id,
        shopId: shopId,
        name: values.name,
        description: values.description || '',
        basePrice: values.price || 0,
        isActive: values.status !== undefined ? values.status : true,
        mainImage: imageUrls[0] || '',
        variants: mappedVariants,
        imageUrls: imageUrls,
      };

      const result = await productService.createProduct(productData);

      // Backend returns created ProductDTO or similar
      if (result) {
        message.success('Thêm sản phẩm thành công!');
        form.resetFields();
        setSelectedCategory(null);
        setImageList([]);
        setVariants([]);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const renderAttributeField = (attribute, variant = null, variantId = null) => {
    const value = variant ? variant.attributes[attribute.name] : undefined;
    
    const onChange = variant 
      ? (val) => updateVariant(variantId, attribute.name, val)
      : undefined;

    switch (attribute.type) {
      case 'select':
        return (
          <Select
            placeholder={`Chọn ${attribute.label.toLowerCase()}`}
            value={value}
            onChange={onChange}
            style={{ width: '100%' }}
          >
            {attribute.options?.map(option => (
              <Option key={option} value={option}>{option}</Option>
            ))}
          </Select>
        );
      
      case 'number':
        if (attribute.options) {
          // Number select (like shoe sizes)
          return (
            <Select
              placeholder={`Chọn ${attribute.label.toLowerCase()}`}
              value={value}
              onChange={onChange}
              style={{ width: '100%' }}
            >
              {attribute.options.map(option => (
                <Option key={option} value={option}>{option}</Option>
              ))}
            </Select>
          );
        } else {
          return (
            <InputNumber
              placeholder={attribute.placeholder || attribute.label}
              value={value}
              onChange={onChange}
              style={{ width: '100%' }}
              min={0}
            />
          );
        }
      
      case 'text':
      default:
        return (
          <Input
            placeholder={attribute.placeholder || attribute.label}
            value={value}
            onChange={variant ? (e) => onChange(e.target.value) : undefined}
          />
        );
    }
  };

  return (
    <div className="add-product-form">
      <Card title="Thêm sản phẩm mới" className="form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: true
          }}
        >
          <Row gutter={[24, 0]}>
            {/* Thông tin cơ bản */}
            <Col span={24}>
              <Card title="Thông tin cơ bản" size="small" style={{ marginBottom: 16 }}>
                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Tên sản phẩm"
                      name="name"
                      rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                    >
                      <Input placeholder="Nhập tên sản phẩm" />
                    </Form.Item>
                  </Col>
                  
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Hạng mục"
                      name="category"
                      rules={[{ required: true, message: 'Vui lòng chọn hạng mục' }]}
                    >
                      <Select
                        placeholder="Chọn hạng mục sản phẩm"
                        onChange={handleCategoryChange}
                      >
                        {categories.map(category => (
                          <Option key={category.id} value={category.id}>
                            {category.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      label="Mô tả sản phẩm"
                      name="description"
                    >
                      <TextArea
                        rows={4}
                        placeholder="Mô tả chi tiết về sản phẩm..."
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Giá (VND)"
                      name="price"
                      rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm' }]}
                    >
                      <InputNumber
                        placeholder="0"
                        style={{ width: '100%' }}
                        min={0}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Số lượng tồn kho"
                      name="stock"
                      rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
                    >
                      <InputNumber
                        placeholder="0"
                        style={{ width: '100%' }}
                        min={0}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item label="Trạng thái" name="status" valuePropName="checked">
                      <Switch checkedChildren="Hoạt động" unCheckedChildren="Ẩn" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Hình ảnh sản phẩm */}
            <Col span={24}>
              <Card title="Hình ảnh sản phẩm" size="small" style={{ marginBottom: 16 }}>
                <Form.Item
                  label="Tải lên hình ảnh"
                  extra="Chọn tối đa 5 hình ảnh. Định dạng: JPG, PNG"
                >
                  <Upload
                    listType="picture-card"
                    fileList={imageList}
                    onChange={handleImageUpload}
                    beforeUpload={() => false} // Prevent auto upload
                    multiple
                  >
                    {imageList.length >= 5 ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Tải lên</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Card>
            </Col>

            {/* Thuộc tính theo hạng mục */}
            {selectedCategory && (
              <Col span={24}>
                <Card 
                  title={`Thuộc tính ${selectedCategory.name}`}
                  size="small"
                  style={{ marginBottom: 16 }}
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={addVariant}
                      size="small"
                    >
                      Thêm biến thể
                    </Button>
                  }
                >
                  {variants.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                      Chưa có biến thể nào. Nhấn "Thêm biến thể" để tạo biến thể đầu tiên.
                    </div>
                  )}
                  
                  {variants.map((variant, index) => (
                    <Card
                      key={variant.id}
                      size="small"
                      title={`Biến thể ${index + 1}`}
                      extra={
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeVariant(variant.id)}
                          size="small"
                        >
                          Xóa
                        </Button>
                      }
                      style={{ marginBottom: 16 }}
                    >
                      <Row gutter={[16, 16]}>
                        {selectedCategory.attributes.map(attribute => (
                          <Col xs={24} md={12} lg={8} key={attribute.name}>
                            <div className="attribute-field">
                              <label className="attribute-label">
                                {attribute.label}
                                {attribute.required && <span style={{ color: '#ff4d4f' }}>*</span>}
                              </label>
                              {renderAttributeField(attribute, variant, variant.id)}
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  ))}
                </Card>
              </Col>
            )}

            {/* Buttons */}
            <Col span={24}>
              <Divider />
              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => form.resetFields()}>
                    Đặt lại
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Thêm sản phẩm
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AddProductForm;