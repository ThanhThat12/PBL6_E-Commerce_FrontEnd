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
    const fetchInitialData = async () => {
      try {
        // Lấy categories từ API
        const categoriesData = await productService.getCategories();
        setCategories(categoriesData);

        // Lấy shopId hiện tại của seller (nếu có)
        const shop = await shopService.getShopInfo();
        if (shop && shop.id) setShopId(shop.id);
      } catch (err) {
        console.warn('Không lấy được dữ liệu khởi tạo:', err);
        message.error('Có lỗi khi tải dữ liệu');
      }
    };

    fetchInitialData();
  }, []);

  const handleCategoryChange = async (categoryId) => {
    try {
      const category = await productService.getCategoryById(categoryId);
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
    } catch (error) {
      console.error('Error loading category:', error);
      message.error('Có lỗi khi tải thông tin danh mục');
    }
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
      variantValues: selectedCategory.attributes.map(attr => ({
        id: null, // Will be set by backend
        productAttributeId: attr.id,
        name: attr.name,
        value: ''
      }))
    };
    
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (variantId) => {
    setVariants(variants.filter(v => v.id !== variantId));
  };

  const updateVariant = (variantId, attributeId, value) => {
    setVariants(variants.map(variant => 
      variant.id === variantId 
        ? {
            ...variant, 
            variantValues: variant.variantValues.map(vv => 
              vv.productAttributeId === attributeId 
                ? { ...vv, value: value }
                : vv
            )
          }
        : variant
    ));
  };

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      // Validate variants
      if (variants.length === 0) {
        message.warning('Vui lòng thêm ít nhất một biến thể sản phẩm');
        setLoading(false);
        return;
      }

      // Validate each variant
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        if (!variant.price || variant.price <= 0) {
          message.warning(`Biến thể ${i + 1}: Vui lòng nhập giá hợp lệ`);
          setLoading(false);
          return;
        }
        if (!variant.stock || variant.stock < 0) {
          message.warning(`Biến thể ${i + 1}: Vui lòng nhập số lượng tồn kho hợp lệ`);
          setLoading(false);
          return;
        }
        
        // Check required attributes
        const requiredAttrs = selectedCategory.attributes.filter(attr => attr.required);
        for (const attr of requiredAttrs) {
          const variantValue = variant.variantValues.find(vv => vv.productAttributeId === attr.id);
          if (!variantValue || !variantValue.value || variantValue.value.trim() === '') {
            message.warning(`Biến thể ${i + 1}: Vui lòng nhập ${attr.label.toLowerCase()}`);
            setLoading(false);
            return;
          }
        }
      }
      // Upload images - tạm thời dùng URL placeholder
      let imageUrls = [];
      let mainImage = '';
      
      if (imageList.length > 0) {
        // Tạm thời dùng placeholder URLs
        imageUrls = imageList.map((file, index) => 
          `https://example.com/product_image_${Date.now()}_${index}.jpg`
        );
        mainImage = imageUrls[0];
      }

      // Map variants theo đúng API format
      const mappedVariants = variants.map(v => ({
        sku: v.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
        price: v.price || 0,
        stock: v.stock || 0,
        variantValues: v.variantValues
          .filter(vv => vv.value && vv.value.trim() !== '')
          .map(vv => ({
            productAttributeId: vv.productAttributeId,
            value: vv.value
          }))
      }));

      // Prepare product data theo đúng API format
      const productData = {
        name: values.name,
        description: values.description || '',
        basePrice: variants.length > 0 ? variants[0].price : (values.price || 0),
        categoryId: selectedCategory?.id,
        mainImage: mainImage,
        imageUrls: imageUrls,
        variants: mappedVariants
      };

      console.log('🚀 Submitting product data:', productData);

      const result = await productService.createProduct(productData);

      if (result.success) {
        message.success(result.message || 'Thêm sản phẩm thành công!');
        console.log('✅ Product created:', result.data);
        
        // Reset form
        form.resetFields();
        setSelectedCategory(null);
        setImageList([]);
        setVariants([]);
      }
    } catch (error) {
      console.error('❌ Submit product failed:', error);
      message.error(error.message || 'Có lỗi xảy ra khi thêm sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const renderAttributeField = (attribute, variant = null, variantId = null) => {
    const variantValue = variant ? 
      variant.variantValues.find(vv => vv.productAttributeId === attribute.id) : 
      null;
    const value = variantValue ? variantValue.value : undefined;
    
    const onChange = variant 
      ? (val) => updateVariant(variantId, attribute.id, val)
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
                        {/* SKU, Price, Stock */}
                        <Col xs={24} md={8}>
                          <div className="attribute-field">
                            <label className="attribute-label">SKU</label>
                            <Input
                              placeholder="Mã SKU (tự động nếu để trống)"
                              value={variant.sku}
                              onChange={(e) => {
                                const newVariants = variants.map(v => 
                                  v.id === variant.id ? { ...v, sku: e.target.value } : v
                                );
                                setVariants(newVariants);
                              }}
                            />
                          </div>
                        </Col>
                        
                        <Col xs={24} md={8}>
                          <div className="attribute-field">
                            <label className="attribute-label">Giá (VND) <span style={{ color: '#ff4d4f' }}>*</span></label>
                            <InputNumber
                              placeholder="0"
                              style={{ width: '100%' }}
                              min={0}
                              value={variant.price}
                              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={value => value.replace(/\$\s?|(,*)/g, '')}
                              onChange={(value) => {
                                const newVariants = variants.map(v => 
                                  v.id === variant.id ? { ...v, price: value || 0 } : v
                                );
                                setVariants(newVariants);
                              }}
                            />
                          </div>
                        </Col>
                        
                        <Col xs={24} md={8}>
                          <div className="attribute-field">
                            <label className="attribute-label">Tồn kho <span style={{ color: '#ff4d4f' }}>*</span></label>
                            <InputNumber
                              placeholder="0"
                              style={{ width: '100%' }}
                              min={0}
                              value={variant.stock}
                              onChange={(value) => {
                                const newVariants = variants.map(v => 
                                  v.id === variant.id ? { ...v, stock: value || 0 } : v
                                );
                                setVariants(newVariants);
                              }}
                            />
                          </div>
                        </Col>

                        {/* Category Attributes */}
                        {selectedCategory.attributes.map(attribute => (
                          <Col xs={24} md={12} lg={8} key={attribute.id}>
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