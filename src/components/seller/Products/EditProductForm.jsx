import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  message,
  Space,
  Upload,
  Typography,
  Spin,
  Alert,
  Tag,
  Table,
  InputNumber,
  Checkbox,
  Switch,
} from 'antd';
import { SaveOutlined, UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { getProductById, updateProduct } from '../../../services/seller/productService';
import ImageUploadService from '../../../services/ImageUploadService';
import api from '../../../services/api';
import PropTypes from 'prop-types';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

/**
 * EditProductForm Component
 * Form for editing existing products with image upload functionality
 */
const EditProductForm = ({ productId, onSuccess }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Product attributes loaded from backend
  const [productAttributes, setProductAttributes] = useState([]);

  // Build attribute mapping dynamically from loaded attributes
  const attributeMap = useMemo(() => {
    const map = {};
    productAttributes.forEach(attr => {
      map[attr.name.toLowerCase()] = attr.id;
    });
    return map;
  }, [productAttributes]);

  const reverseAttributeMap = useMemo(() => {
    const map = {};
    productAttributes.forEach(attr => {
      map[attr.id] = attr.name.toLowerCase();
    });
    return map;
  }, [productAttributes]);

  // Get attribute name by ID or key
  const getAttributeName = (attrKey) => {
    // Try to find by ID first
    const attrById = productAttributes.find(a => a.id === attrKey);
    if (attrById) return attrById.name;
    // Try to find by name key
    const attrByName = productAttributes.find(a => a.name.toLowerCase() === attrKey);
    if (attrByName) return attrByName.name;
    return 'Thuộc tính';
  };

  // Variant editing states
  const [classificationType1, setClassificationType1] = useState('color');
  const [classificationType2, setClassificationType2] = useState('size');
  const [enableClassification2, setEnableClassification2] = useState(false);
  const [classification1Values, setClassification1Values] = useState([]);
  const [classification2Values, setClassification2Values] = useState([]);
  const [variantTable, setVariantTable] = useState([]);
  const [editingVariants, setEditingVariants] = useState(false);

  // Image upload states
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [variantImages, setVariantImages] = useState({});
  const [uploadLoading, setUploadLoading] = useState(false);

  // Parse existing variants from product data (simplified to avoid infinite loops)
  const parseExistingVariants = useCallback((variants, attributeMap) => {
    if (!variants || variants.length === 0) return;

    const class1Values = new Set();
    const class2Values = new Set();
    const parsedVariants = [];
    let detectedType1 = 'color';
    let detectedType2 = 'size';
    let hasType2 = false;

    // Build reverse map from the passed attributeMap
    const reverseMap = {};
    Object.keys(attributeMap).forEach(name => {
      const id = attributeMap[name];
      reverseMap[id] = name;
    });

    // Determine classification types and values from existing variants
    variants.forEach((variant, index) => {
      if (variant.variantValues && variant.variantValues.length > 0) {
        const variant1 = variant.variantValues[0];
        const variant2 = variant.variantValues[1];

        if (variant1) {
          class1Values.add(variant1.value);
          // Determine classification type from attribute ID
          const type1 = reverseMap[variant1.productAttributeId] || reverseMap[variant1.productAttribute?.id];
          if (type1) detectedType1 = type1;
        }

        if (variant2) {
          class2Values.add(variant2.value);
          hasType2 = true;
          // Determine classification type from attribute ID  
          const type2 = reverseMap[variant2.productAttributeId] || reverseMap[variant2.productAttribute?.id];
          if (type2) detectedType2 = type2;
        }

        // Build variant table entry (use detected types, not state)
        const variantEntry = {
          key: index,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock
        };

        if (variant1) variantEntry[detectedType1] = variant1.value;
        if (variant2) variantEntry[detectedType2] = variant2.value;

        parsedVariants.push(variantEntry);
      }
    });

    // Set all data at once to avoid multiple re-renders
    setClassificationType1(detectedType1);
    setClassificationType2(detectedType2);
    setClassification1Values(Array.from(class1Values));
    setClassification2Values(Array.from(class2Values));
    setVariantTable(parsedVariants);
    setEnableClassification2(hasType2);
  }, []); // Empty dependency array - function uses passed parameters only

  const loadProduct = useCallback(async () => {
    if (!productId) return;

    try {
      const productData = await getProductById(productId);
      const product = productData.data || productData;
      setProduct(product);

      // Set form values including shipping dimensions
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        basePrice: product.basePrice,
        categoryId: product.categoryId || (product.category && product.category.id),
        // Shipping dimensions
        weightGrams: product.weightGrams,
        lengthCm: product.lengthCm,
        widthCm: product.widthCm,
        heightCm: product.heightCm,
      });

      // Parse existing variants and determine classifications (pass attributeMap directly)
      if (product.variants && product.variants.length > 0) {
        parseExistingVariants(product.variants, attributeMap);
      }

      // Try to load primary attribute to determine main classification
      try {
        const primaryAttributeResponse = await ImageUploadService.getPrimaryAttribute(productId);
        
        const primaryAttribute = primaryAttributeResponse?.data;
        if (primaryAttribute?.id) {
          // Build reverse map locally instead of using state
          const reverseMap = {};
          Object.keys(attributeMap).forEach(name => {
            const id = attributeMap[name];
            reverseMap[id] = name;
          });
          
          const primaryType = reverseMap[primaryAttribute.id];
          
          if (primaryType) {
            setClassificationType1(primaryType);
          }
          
          // Store primary attribute info for later use
          setProductImages({ primaryAttribute });
        } else {
          // Fallback: try to detect from existing variants
          if (product.variants && product.variants.length > 0) {
            const firstVariant = product.variants[0];
            if (firstVariant.variantValues && firstVariant.variantValues.length > 0) {
              const firstAttribute = firstVariant.variantValues[0];
              // Build reverse map locally
              const reverseMap = {};
              Object.keys(attributeMap).forEach(name => {
                const id = attributeMap[name];
                reverseMap[id] = name;
              });
              const detectedType = reverseMap[firstAttribute.productAttributeId];
              if (detectedType) {
                setClassificationType1(detectedType);
              }
            }
          }
          setProductImages(null);
        }
      } catch {
        // Fallback: detect from variants if available
        try {
          if (product.variants && product.variants.length > 0) {
            const firstVariant = product.variants[0];
            if (firstVariant.variantValues && firstVariant.variantValues.length > 0) {
              const firstAttribute = firstVariant.variantValues[0];
              // Build reverse map locally
              const reverseMap = {};
              Object.keys(attributeMap).forEach(name => {
                const id = attributeMap[name];
                reverseMap[id] = name;
              });
              const detectedType = reverseMap[firstAttribute.productAttributeId];
              if (detectedType) {
                setClassificationType1(detectedType);
              }
            }
          }
        } catch {
          // Silent fallback failure
        }
        setProductImages(null);
      }
      
    } catch {
      message.error('Không thể tải thông tin sản phẩm');
    }
  }, [productId, form, attributeMap, parseExistingVariants]);

  // Variant management functions (with manual table generation)
  const addClassification1Value = (value) => {
    if (value && !classification1Values.includes(value)) {
      const newValues = [...classification1Values, value];
      setClassification1Values(newValues);
      // Manually trigger table generation after state update
      setTimeout(() => {
        if (editingVariants) generateVariantTable();
      }, 0);
    }
  };

  const addClassification2Value = (value) => {
    if (value && !classification2Values.includes(value)) {
      const newValues = [...classification2Values, value];
      setClassification2Values(newValues);
      // Manually trigger table generation after state update
      setTimeout(() => {
        if (editingVariants) generateVariantTable();
      }, 0);
    }
  };

  const removeClassification1Value = (value) => {
    const newValues = classification1Values.filter(v => v !== value);
    setClassification1Values(newValues);
    // Manually trigger table generation after state update
    setTimeout(() => {
      if (editingVariants) generateVariantTable();
    }, 0);
  };

  const removeClassification2Value = (value) => {
    const newValues = classification2Values.filter(v => v !== value);
    setClassification2Values(newValues);
    // Manually trigger table generation after state update
    setTimeout(() => {
      if (editingVariants) generateVariantTable();
    }, 0);
  };

  // Update variant value in table
  const updateVariantValue = (key, field, value) => {
    const newTable = variantTable.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    );
    setVariantTable(newTable);
  };

  // Generate variant table manually (called only when needed to avoid infinite loops)
  const generateVariantTable = () => {
    if (!editingVariants || classification1Values.length === 0) {
      return;
    }

    const currentTable = [...variantTable]; // Create a copy to avoid mutation
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

  // Fetch product attributes from backend
  const fetchProductAttributes = async () => {
    try {
      const response = await api.get('/product-attributes');
      const attrs = response.data || [];
      setProductAttributes(attrs);
    } catch {
      // Use default attributes if API fails
      setProductAttributes([
        { id: 1, name: 'Size' },
        { id: 2, name: 'Color' },
        { id: 3, name: 'Material' }
      ]);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchProductAttributes(),
      loadProduct()
    ]).finally(() => {
      setInitialLoading(false);
    });
  }, [loadProduct]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch {
      message.error('Không thể tải danh mục');
    }
  };

  const handleImageUpload = async () => {
    if (!product?.id) {
      message.error('Không tìm thấy thông tin sản phẩm');
      return;
    }

    // Validate primary attribute for variant images
    if (Object.keys(variantImages).length > 0 && !productImages?.primaryAttribute) {
      message.error('Sản phẩm cần có thuộc tính chính (primary attribute) để tải ảnh phân loại. Vui lòng thiết lập thuộc tính chính trong phần quản lý sản phẩm.');
      return;
    }

    setUploadLoading(true);
    let uploadResults = { main: false, gallery: false, variants: false };

    try {
      // Upload main image
      if (mainImageFile) {
        try {
          await ImageUploadService.uploadProductMain(product.id, mainImageFile);
          uploadResults.main = true;
        } catch (error) {
          message.error(`Không thể tải ảnh đại diện: ${error.message || 'Lỗi server'}`);
        }
      }

      // Upload gallery images
      if (galleryImageFiles.length > 0) {
        try {
          await ImageUploadService.uploadProductGallery(product.id, galleryImageFiles);
          uploadResults.gallery = true;
        } catch (error) {
          message.error(`Không thể tải ảnh thư viện: ${error.message || 'Lỗi server'}`);
        }
      }

      // Upload variant images (only if primary attribute exists)
      if (Object.keys(variantImages).length > 0 && productImages?.primaryAttribute) {
        let variantSuccessCount = 0;
        
        for (const [variantValue, file] of Object.entries(variantImages)) {
          try {
            await ImageUploadService.uploadVariantImage(product.id, file, variantValue);
            variantSuccessCount++;
          } catch (error) {
            message.error(`Không thể tải ảnh phân loại "${variantValue}": ${error.message || 'Lỗi server'}`);
          }
        }
        
        uploadResults.variants = variantSuccessCount > 0;
      }

      // Show results
      const successCount = Object.values(uploadResults).filter(Boolean).length;
      const totalUploads = (mainImageFile ? 1 : 0) + (galleryImageFiles.length > 0 ? 1 : 0) + (Object.keys(variantImages).length > 0 ? 1 : 0);

      if (successCount === totalUploads && totalUploads > 0) {
        message.success('Tải lên tất cả hình ảnh thành công!');
        if (onSuccess) onSuccess();
      } else if (successCount > 0) {
        message.warning(`Tải lên thành công ${successCount}/${totalUploads} loại hình ảnh.`);
      } else if (totalUploads > 0) {
        message.error('Không thể tải lên hình ảnh nào. Vui lòng kiểm tra kết nối và thử lại.');
      } else {
        message.info('Không có hình ảnh nào được chọn.');
      }

    } catch (error) {
      console.error('Upload error:', error);
      message.error('Có lỗi xảy ra khi tải lên hình ảnh');
    } finally {
      setUploadLoading(false);
    }
  };

  // Get variant values for variant image uploads (from classification 1 - primary attribute)
  const getVariantValues = () => {
    return classification1Values || [];
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Prepare product update data including shipping dimensions
      const updateData = {
        name: values.name.trim(),
        description: values.description?.trim() || '',
        categoryId: values.categoryId,
        basePrice: values.basePrice,
        // Shipping dimensions
        weightGrams: values.weightGrams || null,
        lengthCm: values.lengthCm || null,
        widthCm: values.widthCm || null,
        heightCm: values.heightCm || null,
      };

      // If variants were edited, include them and set primary attribute
      if (editingVariants && variantTable.length > 0) {
        // Validate variant data
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

        // Prepare variants data
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

        updateData.variants = variants;
        updateData.primaryAttributeId = attributeMap[classificationType1]; // Set primary attribute
      }
      
      // Call update API with primary attribute support
      await updateProduct(productId, updateData);
      
      // Reload product data to get updated timestamps
      await loadProduct();
      
      message.success('Cập nhật sản phẩm thành công!');
      
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

  const variantValues = getVariantValues();

  return (
    <div className="edit-product-form">
      <Title level={3}>Chỉnh sửa sản phẩm: {product.name}</Title>
      
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Basic Info */}
        <Card title="Thông tin cơ bản" className="mb-4">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
              >
                <Input placeholder="Tên sản phẩm" />
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
                <TextArea rows={3} placeholder="Mô tả chi tiết về sản phẩm..." />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                label="Giá cơ bản (VND)"
                name="basePrice"
                rules={[{ required: true, message: 'Vui lòng nhập giá cơ bản' }]}
              >
                <Input placeholder="299000" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Thông tin vận chuyển (Khối lượng & Kích thước) */}
        <Card title="Thông tin vận chuyển" className="mb-4">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={6}>
              <Form.Item
                label="Cân nặng (gram)"
                name="weightGrams"
                tooltip="Khối lượng sản phẩm tính bằng gram, dùng để tính phí vận chuyển"
              >
                <InputNumber
                  placeholder="500"
                  style={{ width: '100%' }}
                  min={1}
                  max={50000}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Chiều dài (cm)"
                name="lengthCm"
                tooltip="Chiều dài của kiện hàng tính bằng cm"
              >
                <InputNumber
                  placeholder="30"
                  style={{ width: '100%' }}
                  min={1}
                  max={200}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Chiều rộng (cm)"
                name="widthCm"
                tooltip="Chiều rộng của kiện hàng tính bằng cm"
              >
                <InputNumber
                  placeholder="20"
                  style={{ width: '100%' }}
                  min={1}
                  max={200}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Chiều cao (cm)"
                name="heightCm"
                tooltip="Chiều cao của kiện hàng tính bằng cm"
              >
                <InputNumber
                  placeholder="10"
                  style={{ width: '100%' }}
                  min={1}
                  max={200}
                />
              </Form.Item>
            </Col>
          </Row>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 Thông tin vận chuyển giúp tính phí ship chính xác hơn. Nếu không nhập, hệ thống sẽ sử dụng giá trị mặc định.
          </Text>
        </Card>

        <Card title="Thông tin sản phẩm" className="mb-4">
          <Row gutter={[16, 0]}>

            {/* Product Metadata */}
            {product && (
              <>
                <Col xs={24} md={8}>
                  <div className="mb-3">
                    <Text strong className="text-gray-600 block mb-1">Thời gian tạo:</Text>
                    <Text className="text-sm">
                      {product.createdAt 
                        ? new Date(product.createdAt).toLocaleString('vi-VN')
                        : 'Chưa cập nhật'
                      }
                    </Text>
                  </div>
                </Col>
                
                <Col xs={24} md={8}>
                  <div className="mb-3">
                    <Text strong className="text-gray-600 block mb-1">Cập nhật cuối:</Text>
                    <Text className="text-sm">
                      {product.updatedAt 
                        ? new Date(product.updatedAt).toLocaleString('vi-VN')
                        : 'Chưa cập nhật'
                      }
                    </Text>
                  </div>
                </Col>
              </>
            )}
          </Row>

          <Space>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              Lưu thông tin cơ bản
            </Button>
          </Space>
        </Card>

        {/* Variant Management Section */}
        <Card 
          title={
            <div className="flex justify-between items-center">
              <span>Quản lý phân loại sản phẩm</span>
              <Switch 
                checked={editingVariants}
                onChange={(checked) => {
                  setEditingVariants(checked);
                  // Trigger table generation when entering edit mode
                  if (checked && classification1Values.length > 0) {
                    setTimeout(() => generateVariantTable(), 0);
                  }
                }}
                checkedChildren="Đang chỉnh sửa"
                unCheckedChildren="Chỉ xem"
              />
            </div>
          } 
          className="mb-4"
        >
          {editingVariants ? (
            // Editing mode - show editable variant management
            <div>
              <Row gutter={16} className="mb-4">
                <Col span={enableClassification2 ? 12 : 24}>
                  <div>
                    <div className="mb-2">
                      <span>Nhóm phân loại 1 (Chính): </span>
                      <Select
                        value={classificationType1}
                        onChange={setClassificationType1}
                        style={{ width: 120, marginLeft: 8 }}
                        disabled={classification1Values.length > 0} // Disable if already has values
                      >
                        {productAttributes.map(attr => (
                          <Option key={attr.id} value={attr.name.toLowerCase()}>
                            {attr.name}
                          </Option>
                        ))}
                      </Select>
                      <small className="ml-2 text-gray-500">(Sẽ được đặt làm thuộc tính chính)</small>
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
                        placeholder={`Thêm ${getAttributeName(classificationType1)}`}
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
                          {productAttributes.map(attr => (
                            <Option 
                              key={attr.id} 
                              value={attr.name.toLowerCase()}
                              disabled={classificationType1 === attr.name.toLowerCase()}
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
                            className="mb-2"
                          >
                            {value}
                          </Tag>
                        ))}

                        <Input
                          placeholder={`Thêm ${getAttributeName(classificationType2)}`}
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

              {/* Variant Table */}
              {variantTable.length > 0 && (
                <Table
                  columns={[
                    {
                      title: getAttributeName(classificationType1),
                      dataIndex: classificationType1,
                      key: classificationType1,
                      width: 120,
                      render: (text) => <Tag color="blue">{text}</Tag>
                    },
                    ...(enableClassification2 ? [{
                      title: getAttributeName(classificationType2),
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
                  ]}
                  dataSource={variantTable}
                  pagination={false}
                  size="small"
                  scroll={{ x: 600 }}
                  bordered
                />
              )}
            </div>
          ) : (
            // View mode - show current variants info
            <div>
              {variantTable.length > 0 ? (
                <div>
                  <Text>Sản phẩm hiện có <strong>{variantTable.length} phân loại</strong></Text>
                  <div className="mt-2">
                    <Text>Thuộc tính chính: <Tag color="blue">{getAttributeName(classificationType1)}</Tag></Text>
                    {enableClassification2 && (
                      <Text className="ml-4">Thuộc tính phụ: <Tag color="green">{getAttributeName(classificationType2)}</Tag></Text>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Bật chế độ chỉnh sửa để thay đổi phân loại sản phẩm
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Text>Sản phẩm chưa có phân loại</Text>
                  <div className="mt-2 text-sm">Bật chế độ chỉnh sửa để thêm phân loại</div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Image Upload Test Section */}
        <Card title="Upload Hình Ảnh" className="mb-4">{""}
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
                <Text strong>Ảnh cho từng phân loại</Text>
                
                {!productImages?.primaryAttribute && variantValues.length > 0 && (
                  <Alert
                    message="Thuộc tính chính chưa được thiết lập"
                    description="Sản phẩm cần có thuộc tính chính (primary attribute) để có thể tải ảnh phân loại. Vui lòng thiết lập thuộc tính chính trong phần quản lý sản phẩm trước."
                    type="warning"
                    showIcon
                    className="mb-3"
                    size="small"
                  />
                )}
                
                <div style={{ marginBottom: 8 }}>
                  {variantValues.map((value, index) => (
                    <Tag key={index} color="blue">{value}</Tag>
                  ))}
                </div>
                
                {variantValues.map((variantValue, index) => (
                  <div key={index} className="mb-2">
                    <Text className="text-sm">{variantValue}:</Text>
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      disabled={!productImages?.primaryAttribute}
                      beforeUpload={(file) => {
                        if (!productImages?.primaryAttribute) {
                          message.warning('Cần thiết lập thuộc tính chính trước khi tải ảnh phân loại');
                          return false;
                        }
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
            </Col>
          </Row>

          <div className="mb-4">
            <Button 
              type="primary" 
              onClick={handleImageUpload} 
              loading={uploadLoading}
              icon={<UploadOutlined />}
              size="large"
            >
              Tải Lên Hình Ảnh
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
};

EditProductForm.propTypes = {
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSuccess: PropTypes.func,
};

export default EditProductForm;