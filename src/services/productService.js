import axiosInstance from '../utils/axiosConfig';

const productService = {
  // Lấy categories từ API thực tế
  async getCategories() {
    try {
      console.log('📦 Fetching categories from API');
      const response = await axiosInstance.get('/categories');
      
      if (response.data.status === 200 && Array.isArray(response.data.data)) {
        // Map categories từ API với attributes mock (tạm thời)
        return response.data.data.map(category => ({
          id: category.id,
          name: category.name,
          slug: category.name.toLowerCase().replace(/\s+/g, '-'),
          attributes: this.getMockAttributesForCategory(category.name)
        }));
      }
      
      console.warn('Unexpected categories API response:', response.data);
      return this.getMockCategories();
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return this.getMockCategories();
    }
  },

  // Mock attributes theo category name (tạm thời cho đến khi có API attributes)
  getMockAttributesForCategory(categoryName) {
    const attributeMap = {
      'Gym Accessories': [
        { id: 1, name: 'color', type: 'select', label: 'Màu sắc', required: true, options: ['Black', 'Red', 'Blue', 'White'] },
        { id: 2, name: 'size', type: 'select', label: 'Kích cỡ', required: true, options: ['Small', 'Medium', 'Large', 'XL'] },
        { id: 3, name: 'material', type: 'text', label: 'Chất liệu', required: false }
      ],
      'Running Gear': [
        { id: 1, name: 'color', type: 'select', label: 'Màu sắc', required: true, options: ['Black', 'White', 'Red', 'Blue', 'Green'] },
        { id: 2, name: 'size', type: 'select', label: 'Kích cỡ', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
        { id: 4, name: 'brand', type: 'text', label: 'Thương hiệu', required: true }
      ],
      'Tennis Equipment': [
        { id: 1, name: 'color', type: 'select', label: 'Màu sắc', required: true, options: ['Black', 'White', 'Red', 'Blue'] },
        { id: 5, name: 'weight', type: 'text', label: 'Trọng lượng', required: false },
        { id: 6, name: 'grip_size', type: 'select', label: 'Kích cỡ grip', required: true, options: ['4 1/8', '4 1/4', '4 3/8', '4 1/2'] }
      ]
    };
    
    return attributeMap[categoryName] || [
      { id: 1, name: 'color', type: 'select', label: 'Màu sắc', required: true, options: ['Black', 'White', 'Red', 'Blue'] },
      { id: 2, name: 'size', type: 'select', label: 'Kích cỡ', required: true, options: ['S', 'M', 'L', 'XL'] }
    ];
  },

  // Fallback mock categories
  getMockCategories() {
    return [
      {
        id: 1,
        name: 'Shoes',
        slug: 'shoes',
        attributes: [
          { name: 'size', type: 'number', label: 'Kích cỡ (số)', required: true, options: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45] },
          { name: 'color', type: 'select', label: 'Màu sắc', required: true, options: ['Đen', 'Trắng', 'Đỏ', 'Xanh', 'Vàng', 'Nâu', 'Xám'] },
          { name: 'material', type: 'text', label: 'Chất liệu', required: false },
          { name: 'brand', type: 'text', label: 'Thương hiệu', required: true },
          { name: 'style', type: 'select', label: 'Kiểu dáng', required: false, options: ['Thể thao', 'Công sở', 'Casual', 'Sneaker', 'Boot'] }
        ]
      },
      {
        id: 2,
        name: 'Bags',
        slug: 'bags',
        attributes: [
          { name: 'size', type: 'select', label: 'Kích cỡ', required: true, options: ['XS', 'S', 'M', 'L', 'XL'] },
          { name: 'color', type: 'select', label: 'Màu sắc', required: true, options: ['Đen', 'Trắng', 'Đỏ', 'Xanh', 'Vàng', 'Nâu', 'Xám', 'Hồng'] },
          { name: 'material', type: 'select', label: 'Chất liệu', required: true, options: ['Da thật', 'Da tổng hợp', 'Vải', 'Canvas', 'Nylon'] },
          { name: 'brand', type: 'text', label: 'Thương hiệu', required: true },
          { name: 'type', type: 'select', label: 'Loại túi', required: true, options: ['Túi xách', 'Balo', 'Túi đeo chéo', 'Clutch', 'Túi laptop'] },
          { name: 'capacity', type: 'text', label: 'Dung tích', required: false, placeholder: 'Ví dụ: 20L, 15 inch laptop' }
        ]
      },
      {
        id: 3,
        name: 'Clothing',
        slug: 'clothing',
        attributes: [
          { name: 'size', type: 'select', label: 'Kích cỡ', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
          { name: 'color', type: 'select', label: 'Màu sắc', required: true, options: ['Đen', 'Trắng', 'Đỏ', 'Xanh', 'Vàng', 'Nâu', 'Xám', 'Hồng', 'Tím'] },
          { name: 'material', type: 'text', label: 'Chất liệu', required: true, placeholder: 'Cotton, Polyester, Linen...' },
          { name: 'brand', type: 'text', label: 'Thương hiệu', required: true },
          { name: 'style', type: 'select', label: 'Kiểu dáng', required: true, options: ['Áo thun', 'Áo sơ mi', 'Quần jean', 'Quần short', 'Váy', 'Đầm'] },
          { name: 'season', type: 'select', label: 'Mùa', required: false, options: ['Xuân/Hè', 'Thu/Đông', 'Cả năm'] }
        ]
      },
      {
        id: 4,
        name: 'Sport Equipment',
        slug: 'sport-equipment',
        attributes: [
          { name: 'sport_type', type: 'select', label: 'Môn thể thao', required: true, options: ['Bóng đá', 'Tennis', 'Cầu lông', 'Bóng rổ', 'Bơi lội', 'Chạy bộ', 'Gym', 'Yoga'] },
          { name: 'equipment_type', type: 'select', label: 'Loại dụng cụ', required: true, options: ['Vợt', 'Bóng', 'Giày chuyên dụng', 'Quần áo thể thao', 'Phụ kiện bảo hộ', 'Máy tập'] },
          { name: 'brand', type: 'text', label: 'Thương hiệu', required: true },
          { name: 'material', type: 'text', label: 'Chất liệu', required: false, placeholder: 'Carbon, Nhôm, Nhựa...' },
          { name: 'weight', type: 'text', label: 'Trọng lượng', required: false, placeholder: 'Ví dụ: 300g, 1.2kg' },
          { name: 'size_dimension', type: 'text', label: 'Kích thước', required: false, placeholder: 'Dài x Rộng x Cao hoặc đường kính' },
          { name: 'skill_level', type: 'select', label: 'Trình độ', required: false, options: ['Người mới bắt đầu', 'Trung cấp', 'Chuyên nghiệp', 'Tất cả trình độ'] }
        ]
      },
      {
        id: 5,
        name: 'Fitness',
        slug: 'fitness',
        attributes: [
          { name: 'equipment_type', type: 'select', label: 'Loại thiết bị', required: true, options: ['Tạ', 'Máy tập', 'Dụng cụ cardio', 'Phụ kiện yoga', 'Băng tập', 'Dây kháng lực'] },
          { name: 'weight_capacity', type: 'text', label: 'Trọng lượng/Sức chịu tải', required: false, placeholder: 'Ví dụ: 5kg, 100kg, 50-200lbs' },
          { name: 'material', type: 'select', label: 'Chất liệu', required: true, options: ['Thép', 'Cao su', 'Nhựa', 'Vải', 'Silicon', 'PVC', 'TPE'] },
          { name: 'brand', type: 'text', label: 'Thương hiệu', required: true },
          { name: 'target_muscle', type: 'select', label: 'Nhóm cơ mục tiêu', required: false, options: ['Toàn thân', 'Cơ tay', 'Cơ ngực', 'Cơ lưng', 'Cơ bụng', 'Cơ chân', 'Cardio'] },
          { name: 'difficulty_level', type: 'select', label: 'Mức độ khó', required: false, options: ['Dễ', 'Trung bình', 'Khó', 'Chuyên nghiệp'] },
          { name: 'dimensions', type: 'text', label: 'Kích thước', required: false, placeholder: 'Dài x Rộng x Cao' },
          { name: 'adjustable', type: 'select', label: 'Có thể điều chỉnh', required: false, options: ['Có', 'Không'] }
        ]
      },
      {
        id: 6,
        name: 'Accessories',
        slug: 'accessories',
        attributes: [
          { name: 'accessory_type', type: 'select', label: 'Loại phụ kiện', required: true, options: ['Đồng hồ', 'Kính mắt', 'Trang sức', 'Mũ/Nón', 'Thắt lưng', 'Ví', 'Khăn', 'Găng tay'] },
          { name: 'material', type: 'select', label: 'Chất liệu', required: true, options: ['Kim loại', 'Da', 'Vải', 'Nhựa', 'Thủy tinh', 'Gốm sứ', 'Gỗ', 'Silicon'] },
          { name: 'color', type: 'select', label: 'Màu sắc', required: true, options: ['Đen', 'Trắng', 'Đỏ', 'Xanh', 'Vàng', 'Nâu', 'Xám', 'Hồng', 'Tím', 'Bạc', 'Vàng gold'] },
          { name: 'brand', type: 'text', label: 'Thương hiệu', required: true },
          { name: 'size', type: 'text', label: 'Kích cỡ/Kích thước', required: false, placeholder: 'Ví dụ: 42mm, L, 120cm' },
          { name: 'gender', type: 'select', label: 'Giới tính', required: false, options: ['Nam', 'Nữ', 'Unisex'] },
          { name: 'style', type: 'select', label: 'Phong cách', required: false, options: ['Cổ điển', 'Hiện đại', 'Thể thao', 'Công sở', 'Dạo phố', 'Dự tiệc'] },
          { name: 'waterproof', type: 'select', label: 'Chống nước', required: false, options: ['Có', 'Không', 'Chống thấm nhẹ'] }
        ]
      }
    ];
  },

  async getCategoryById(id) {
    const categories = await this.getCategories();
    return categories.find(cat => cat.id === id);
  },

  async getCategoryBySlug(slug) {
    const categories = await this.getCategories();
    return categories.find(cat => cat.slug === slug);
  },

  // Tạo sản phẩm mới gọi API thực tế
  async createProduct(productData) {
    try {
      console.log('📦 Creating product with payload:', JSON.stringify(productData, null, 2));
      
      const response = await axiosInstance.post('/products', productData);
      console.log('✅ Product created successfully:', response.data);
      
      if (response.data.status === 201 || response.data.status === 200) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      }
      
      throw new Error(response.data.message || 'Không thể tạo sản phẩm');
    } catch (error) {
      console.error('❌ Product creation failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo sản phẩm');
    }
  },

  // Upload hình ảnh - nếu backend có endpoint upload, sẽ dùng; hiện fallback mock
  async uploadImages(files) {
    // If backend provides '/upload' or similar, implement here. For now keep mock behavior
    try {
      console.log('📤 productService.uploadImages (mock) files:', files);
      // Return array of object URLs using local file name as fallback
      const urls = files.map((file, idx) => {
        // If file has url property (already uploaded), use it
        if (file.url) return file.url;
        if (file.response && file.response.url) return file.response.url;
        // else create a data placeholder (frontend will still send these to backend)
        return URL.createObjectURL(file.originFileObj || file);
      });

      return { success: true, urls };
    } catch (err) {
      console.error('❌ uploadImages error:', err);
      return { success: false, urls: [] };
    }
  }
};

export default productService;
