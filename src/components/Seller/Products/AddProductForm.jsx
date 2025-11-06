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
  DeleteOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import productService from '../../../services/productService';
import shopService from '../../../services/shopService';
import './AddProductForm.css';

const { Option } = Select;
const { TextArea } = Input;

const AddProductForm = () => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [variants, setVariants] = useState([]);
  const [shopId, setShopId] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);
  const [imageFileList, setImageFileList] = useState([]);

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

  const handleCategoryChange = (categoryId) => {
    // Chỉ reset variants khi đổi category
    setVariants([]);
  };

  const handleImageUpload = ({ fileList }) => {
    setImageList(fileList);
  };

  const addVariant = () => {
    const newVariant = {
      id: Date.now(),
      sku: '',
      price: 0,
      stock: 0,
      color: '',
      size: '',
      material: ''
    };
    
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (variantId) => {
    setVariants(variants.filter(v => v.id !== variantId));
  };

  const updateVariant = (variantId, field, value) => {
    setVariants(variants.map(variant => 
      variant.id === variantId 
        ? { ...variant, [field]: value }
        : variant
    ));
  };

  const validateVariants = (variants) => {
    if (!variants || variants.length === 0) {
      throw new Error('Vui lòng thêm ít nhất 1 biến thể sản phẩm');
    }

    const skuSet = new Set();
    
    for (const variant of variants) {
      // Kiểm tra SKU trùng
      if (skuSet.has(variant.sku)) {
        throw new Error(`SKU "${variant.sku}" bị trùng lặp`);
      }
      skuSet.add(variant.sku);

      // ✅ Chỉ cần có ít nhất 1 thuộc tính bất kỳ
      const hasAnyAttribute = variant.color?.trim() || variant.size?.trim() || variant.material?.trim();
      if (!hasAnyAttribute) {
        throw new Error(`Biến thể "${variant.sku}" phải có ít nhất 1 thuộc tính (Màu sắc, Kích thước hoặc Chất liệu)`);
      }

      // Kiểm tra price và stock
      if (!variant.price || variant.price <= 0) {
        throw new Error(`Giá của biến thể "${variant.sku}" phải lớn hơn 0`);
      }

      if (variant.stock < 0) {
        throw new Error(`Số lượng kho của biến thể "${variant.sku}" không được âm`);
      }
    }
  };

const onFinish = async (values) => {
  setLoading(true);
  
  try {
    console.log('📝 Form values:', values);

    // ✅ Validation variants
    validateVariants(values.variants);

    // ✅ Tạo variants array - linh hoạt với attributes
    const variants = [];
    
    values.variants.forEach((variant, index) => {
      const variantValues = [];
      
      // ✅ Chỉ thêm attribute nếu có giá trị
      if (variant.color?.trim()) {
        variantValues.push({
          productAttributeId: 1, // Color
          value: variant.color.trim()
        });
      }
      
      if (variant.size?.trim()) {
        variantValues.push({
          productAttributeId: 2, // Size
          value: variant.size.trim()
        });
      }
      
      if (variant.material?.trim()) {
        variantValues.push({
          productAttributeId: 3, // Material
          value: variant.material.trim()
        });
      }

      // ✅ Tạo variant với các attributes có sẵn
      if (variantValues.length > 0) {
        variants.push({
          sku: variant.sku,
          price: parseFloat(variant.price),
          stock: parseInt(variant.stock),
          variantValues: variantValues
        });
        
        console.log(`✅ Variant ${index + 1}: ${variantValues.length} attributes`, {
          sku: variant.sku,
          attributes: variantValues.map(v => `${v.productAttributeId}:${v.value}`).join(', ')
        });
      }
    });

    // ✅ Tạo images array (nếu có)
    const images = values.images ? values.images.map(img => ({
      imageUrl: img.imageUrl,
      color: img.color
    })) : [];

    // ✅ Tạo payload
    const productPayload = {
      categoryId: values.categoryId,
      name: values.name.trim(),
      description: values.description?.trim() || '',
      basePrice: parseFloat(values.basePrice),
      mainImage: values.mainImage,
      variants: variants,
      images: images
    };

    console.log('🚀 Final payload:', JSON.stringify(productPayload, null, 2));
    console.log('📊 Variants summary:', variants.map(v => ({
      sku: v.sku,
      attributeCount: v.variantValues.length,
      attributes: v.variantValues.map(attr => 
        `${attr.productAttributeId === 1 ? 'Color' : attr.productAttributeId === 2 ? 'Size' : 'Material'}:${attr.value}`
      ).join(', ')
    })));

    // ✅ Gọi API
    const result = await productService.createProduct(productPayload);
    
    console.log('✅ Product created:', result);
    message.success('Tạo sản phẩm thành công! Sản phẩm đang chờ duyệt.');
    
    // ✅ Reset form
    form.resetFields();
    
    // ✅ Không redirect - để user tiếp tục thêm sản phẩm
    setTimeout(() => {
      message.info({
        content: 'Bạn có thể tiếp tục thêm sản phẩm mới hoặc vào trang quản lý để kiểm tra.',
        duration: 4
      });
    }, 2000);

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
                      name="categoryId" // ✅ Đổi từ "category" thành "categoryId"
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
                      label="Giá cơ bản (VND)"
                      name="basePrice" // ✅ Đổi từ "price" thành "basePrice"
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
            </Col>

            {/* Hình ảnh sản phẩm */}
            <Col span={24}>
              <Card title="Hình ảnh sản phẩm" size="small" style={{ marginBottom: 16 }}>
                {/* ✅ Thêm field mainImage */}
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Hình ảnh chính"
                      name="mainImage"
                      rules={[{ required: true, message: 'Vui lòng nhập URL hình ảnh chính' }]}
                    >
                      <Input 
                        placeholder="https://example.com/shoes-main.jpg"
                        onChange={(e) => {
                          // Preview image
                          const url = e.target.value;
                          if (url) {
                            console.log('Main image URL:', url);
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* ✅ Danh sách hình ảnh phụ */}
                <Form.List name="images">
                  {(fields, { add, remove }) => (
                    <div>
                      <div style={{ marginBottom: 16, fontWeight: 'bold' }}>
                        Hình ảnh phụ theo màu sắc:
                      </div>
                      
                      {fields.map((field, index) => (
                        <Row key={field.key} gutter={16} style={{ marginBottom: 12 }}>
                          <Col span={10}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'imageUrl']}
                              rules={[{ required: true, message: 'Vui lòng nhập URL hình ảnh' }]}
                            >
                              <Input placeholder="https://example.com/image.jpg" />
                            </Form.Item>
                          </Col>
                          
    
                          <Col span={4}>
                            <Button 
                              type="link" 
                              danger 
                              icon={<MinusCircleOutlined />}
                              onClick={() => remove(field.name)}
                            >
                              Xóa
                            </Button>
                          </Col>
                        </Row>
                      ))}

                      <Form.Item>
                        <Button 
                          type="dashed" 
                          onClick={() => add()} 
                          block 
                          icon={<PlusOutlined />}
                        >
                          Thêm hình ảnh
                        </Button>
                      </Form.Item>
                    </div>
                  )}
                </Form.List>
              </Card>
            </Col>

            {/* Biến thể sản phẩm */}
            <Col span={24}>
              <Card 
                title="Biến thể sản phẩm"
                size="small"
                style={{ marginBottom: 16 }}
                
                >
                  {/* ✅ Sửa validation cho variants */}
<Form.List name="variants">
  {(fields, { add, remove }) => (
    <div>
      {fields.map((field, index) => (
        <Card 
          key={field.key}
          size="small"
          title={`Biến thể ${index + 1}`}
          extra={
            fields.length > 0 && (
              <Button 
                type="link" 
                danger 
                icon={<MinusCircleOutlined />}
                onClick={() => remove(field.name)}
              >
                Xóa
              </Button>
            )
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            {/* SKU */}
            <Col span={12}>
              <Form.Item
                {...field}
                name={[field.name, 'sku']}
                label="Mã SKU"
                rules={[
                  { required: true, message: 'Vui lòng nhập SKU' },
                  { min: 3, message: 'SKU phải có ít nhất 3 ký tự' }
                ]}
              >
                <Input placeholder="VD: SHOE-BLACK-42" />
              </Form.Item>
            </Col>

            {/* Price */}
            <Col span={12}>
              <Form.Item
                {...field}
                name={[field.name, 'price']}
                label="Giá bán"
                rules={[
                  { required: true, message: 'Vui lòng nhập giá' },
                  { 
                    validator: (_, value) => {
                      if (value && (isNaN(value) || parseFloat(value) <= 0)) {
                        return Promise.reject('Giá phải là số dương');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="299000"
                  min={0}
                />
              </Form.Item>
            </Col>

            {/* Stock */}
            <Col span={12}>
              <Form.Item
                {...field}
                name={[field.name, 'stock']}
                label="Số lượng kho"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng' },
                  { 
                    validator: (_, value) => {
                      if (value && (isNaN(value) || parseInt(value) < 0)) {
                        return Promise.reject('Số lượng phải là số không âm');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }}
                  placeholder="50"
                  min={0}
                />
              </Form.Item>
            </Col>

            {/* Color */}
            <Col span={8}>
              <Form.Item
                {...field}
                name={[field.name, 'color']}
                label="Màu sắc"
                rules={[
                  { 
                    validator: (_, value, callback) => {
                      // ✅ Lấy values của variant hiện tại
                      const currentVariant = form.getFieldValue(['variants', field.name]);
                      const hasColor = value?.trim();
                      const hasSize = currentVariant?.size?.trim();
                      const hasMaterial = currentVariant?.material?.trim();
                      
                      // ✅ Chỉ cần có ít nhất 1 trong 3
                      if (!hasColor && !hasSize && !hasMaterial) {
                        return Promise.reject('Phải có ít nhất 1 thuộc tính');
                      }
                      
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input placeholder="VD: Đỏ, Xanh (tùy chọn)" />
              </Form.Item>
            </Col>

            {/* Size */}
            <Col span={8}>
              <Form.Item
                {...field}
                name={[field.name, 'size']}
                label="Kích thước"
                rules={[
                  { 
                    validator: (_, value, callback) => {
                      const currentVariant = form.getFieldValue(['variants', field.name]);
                      const hasColor = currentVariant?.color?.trim();
                      const hasSize = value?.trim();
                      const hasMaterial = currentVariant?.material?.trim();
                      
                      if (!hasColor && !hasSize && !hasMaterial) {
                        return Promise.reject('Phải có ít nhất 1 thuộc tính');
                      }
                      
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input placeholder="VD: S, M, L, 42 (tùy chọn)" />
              </Form.Item>
            </Col>

            {/* Material */}
            <Col span={8}>
              <Form.Item
                {...field}
                name={[field.name, 'material']}
                label="Chất liệu"
                rules={[
                  { 
                    validator: (_, value, callback) => {
                      const currentVariant = form.getFieldValue(['variants', field.name]);
                      const hasColor = currentVariant?.color?.trim();
                      const hasSize = currentVariant?.size?.trim();
                      const hasMaterial = value?.trim();
                      
                      if (!hasColor && !hasSize && !hasMaterial) {
                        return Promise.reject('Phải có ít nhất 1 thuộc tính');
                      }
                      
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input placeholder="VD: Cotton, Da (tùy chọn)" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ))}

      <Form.Item>
        <Button 
          type="dashed" 
          onClick={() => add()} 
          block 
          icon={<PlusOutlined />}
        >
          Thêm biến thể
        </Button>
      </Form.Item>
    </div>
  )}
</Form.List>
                </Card>
              </Col>

            {/* Buttons */}
            <Col span={24}>
              <Divider />
              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => {
                    form.resetFields();
                    setImageList([]);
                    setVariants([]);
                  }}>
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