import axiosInstance from '../utils/axiosConfig';

const productService = {
  // Danh sách các hạng mục và thuộc tính của chúng (tạm thời giữ mock để form hoạt động)
  getCategories() {
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

  getCategoryById(id) {
    const categories = this.getCategories();
    return categories.find(cat => cat.id === id);
  },

  getCategoryBySlug(slug) {
    const categories = this.getCategories();
    return categories.find(cat => cat.slug === slug);
  },

  // Tạo sản phẩm mới gọi backend
  async createProduct(productData) {
    try {
      console.log('📦 productService.createProduct payload:', productData);
      const response = await axiosInstance.post('/products', productData);
      console.log('✅ product create response:', response.data);
      if (response.data.status === 200 || response.data.status === 201) {
        return response.data.data || { success: true };
      }
      throw new Error(response.data.message || 'Không thể tạo sản phẩm');
    } catch (error) {
      console.error('❌ productService.createProduct error:', error);
      throw error;
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