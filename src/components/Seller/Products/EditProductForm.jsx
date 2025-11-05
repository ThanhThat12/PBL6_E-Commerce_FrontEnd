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
  Switch,
  Modal
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

const EditProductForm = ({ product, visible, onCancel, onSuccess }) => {
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
        // Fetch categories - now async
        const categoriesData = await productService.getCategories();
        setCategories(categoriesData);

        // Lấy shopId hiện tại của seller (nếu có)
        const shop = await shopService.getShopInfo();
        if (shop && shop.id) setShopId(shop.id);
      } catch (err) {
        console.warn('Không lấy được dữ liệu khởi tạo:', err);
      }
    };

    fetchInitialData();
  }, []);

  // Load dữ liệu sản phẩm khi modal mở
  useEffect(() => {
    if (visible && product) {
      loadProductData();
    }
  }, [visible, product]);

  const loadProductData = () => {
    // Tìm category từ danh sách categories
    const category = categories.find(cat => cat.id === product.category?.id);
    setSelectedCategory(category);

    // Set form values
    form.setFieldsValue({
      name: product.name,
      description: product.description,
      category: product.category?.id,
      price: product.basePrice,
      stock: product.stock,
      status: product.isActive
    });

    // Load images
    const images = [];
    if (product.mainImage) {
      images.push({
        uid: 'main',
        name: 'main-image',
        status: 'done',
        url: product.mainImage,
      });
    }
    if (product.images && product.images.length > 0) {
      product.images.forEach((img, index) => {
        images.push({
          uid: `img-${index}`,
          name: `image-${index}`,
          status: 'done',
          url: img.imageUrl,
        });
      });
    }
    setImageList(images);

    // Load variants
    if (product.variants && product.variants.length > 0) {
      const loadedVariants = product.variants.map(variant => ({
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        attributes: variant.variantValues ? variant.variantValues.reduce((acc, value) => {
          acc[value.productAttribute.name] = value.value;
          return acc;
        }, {}) : {}
      }));
      setVariants(loadedVariants);
    }
  };

  const handleCategoryChange = async (categoryId) => {
    try {
      const category = await productService.getCategoryById(categoryId);
      setSelectedCategory(category);
      
      // Reset variants khi đổi category
      setVariants([]);
    } catch (error) {
      console.error('Error fetching category:', error);
      message.error('Không thể lấy thông tin category');
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

  const updateVariant = (variantId, field, value) => {
    setVariants(variants.map(variant => {
      if (variant.id === variantId) {
        if (field === 'sku' || field === 'price' || field === 'stock') {
          return { ...variant, [field]: value };
        } else {
          // Đây là attribute
          return { 
            ...variant, 
            attributes: { ...variant.attributes, [field]: value } 
          };
        }
      }
      return variant;
    }));
  };

  const onFinish = async (values) => {
    if (!product) return;
    
    setLoading(true);
    
    try {
      // Upload new images (nếu có)
      let imageUrls = [];
      const newImages = imageList.filter(img => !img.url || img.originFileObj);
      const existingImages = imageList.filter(img => img.url && !img.originFileObj);
      
      // Giữ lại URL của ảnh cũ
      imageUrls = existingImages.map(img => img.url);
      
      // Upload ảnh mới
      if (newImages.length > 0) {
        const uploadResult = await productService.uploadImages(newImages);
        if (uploadResult.success) {
          imageUrls = [...imageUrls, ...uploadResult.urls];
        }
      }

      // Map variants to backend format
      const mappedVariants = variants.map(v => ({
        ...(v.id && typeof v.id === 'number' && v.id > 1000000 ? {} : { id: v.id }), // Chỉ giữ id nếu không phải generated ID
        sku: v.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2,4)}`,
        price: v.price || 0,
        stock: v.stock || 0,
        variantValues: Object.keys(v.attributes).map(attrName => ({
          productAttributeId: null, // backend sẽ map by attribute name
          value: v.attributes[attrName],
          productAttribute: { name: attrName }
        }))
      }));

      // Prepare product payload matching ProductCreateDTO (reused for update)
      const productData = {
        categoryId: selectedCategory?.id || product.category?.id,
        shopId: shopId,
        name: values.name,
        description: values.description || '',
        basePrice: values.price || 0,
        isActive: values.status !== undefined ? values.status : true,
        mainImage: imageUrls[0] || '',
        variants: mappedVariants,
        imageUrls: imageUrls,
      };

      console.log('🔄 Updating product with data:', productData);

      const result = await shopService.updateProduct(product.id, productData);

      if (result.success) {
        message.success(result.message || 'Cập nhật sản phẩm thành công!');
        onSuccess && onSuccess(result.data);
        onCancel(); // Đóng modal
      }
    } catch (error) {
      console.error('❌ Error updating product:', error);
      message.error(error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm');
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
    <Modal
      title={`Chỉnh sửa sản phẩm: ${product?.name}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      className="edit-product-modal"
      destroyOnClose={true}
    >
      <div className="edit-product-form">
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
                        {/* SKU, Price, Stock fields */}
                        <Col xs={24} md={8}>
                          <div className="attribute-field">
                            <label className="attribute-label">SKU</label>
                            <Input
                              placeholder="SKU"
                              value={variant.sku}
                              onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                            />
                          </div>
                        </Col>
                        <Col xs={24} md={8}>
                          <div className="attribute-field">
                            <label className="attribute-label">Giá</label>
                            <InputNumber
                              placeholder="Giá"
                              value={variant.price}
                              onChange={(value) => updateVariant(variant.id, 'price', value)}
                              style={{ width: '100%' }}
                              min={0}
                            />
                          </div>
                        </Col>
                        <Col xs={24} md={8}>
                          <div className="attribute-field">
                            <label className="attribute-label">Tồn kho</label>
                            <InputNumber
                              placeholder="Tồn kho"
                              value={variant.stock}
                              onChange={(value) => updateVariant(variant.id, 'stock', value)}
                              style={{ width: '100%' }}
                              min={0}
                            />
                          </div>
                        </Col>
                        
                        {/* Category attributes */}
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
                  <Button onClick={onCancel}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Cập nhật sản phẩm
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </Modal>
  );
};

export default EditProductForm;