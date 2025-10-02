// Fake data service cho Coupon - sẽ thay bằng API thật sau
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let fakeCoupons = [
  {
    id: 1,
    code: 'SUMMER2024',
    description: 'Giảm giá mùa hè cho tất cả sản phẩm thể thao',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxDiscountAmount: 50,
    minOrderValue: 100,
    applicableCategories: ['Sport Equipment', 'Fitness Equipment'],
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    maxUses: 1000,
    maxUsesPerUser: 2,
    usedCount: 245,
    usersCount: 180,
    totalRevenue: 15680.50,
    totalDiscount: 2450.00,
    isActive: true,
  },
  {
    id: 2,
    code: 'NEWUSER50',
    description: 'Giảm 50$ cho khách hàng mới',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50,
    maxDiscountAmount: null,
    minOrderValue: 200,
    applicableCategories: [],
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    maxUses: null,
    maxUsesPerUser: 1,
    usedCount: 89,
    usersCount: 89,
    totalRevenue: 24500.00,
    totalDiscount: 4450.00,
    isActive: true,
  },
  {
    id: 3,
    code: 'FLASH30',
    description: 'Flash sale - Giảm 30% trong 24h',
    discountType: 'PERCENTAGE',
    discountValue: 30,
    maxDiscountAmount: 100,
    minOrderValue: 50,
    applicableCategories: ['Clothing', 'Accessories'],
    startDate: '2024-09-15',
    endDate: '2024-09-16',
    maxUses: 500,
    maxUsesPerUser: 1,
    usedCount: 500,
    usersCount: 456,
    totalRevenue: 38900.00,
    totalDiscount: 8670.00,
    isActive: false,
  },
  {
    id: 4,
    code: 'FREESHIP',
    description: 'Miễn phí vận chuyển cho đơn trên $30',
    discountType: 'FIXED_AMOUNT',
    discountValue: 10,
    maxDiscountAmount: null,
    minOrderValue: 30,
    applicableCategories: [],
    startDate: '2024-09-01',
    endDate: '2024-10-31',
    maxUses: 2000,
    maxUsesPerUser: 5,
    usedCount: 1245,
    usersCount: 567,
    totalRevenue: 45600.00,
    totalDiscount: 12450.00,
    isActive: true,
  },
  {
    id: 5,
    code: 'SHOES15',
    description: 'Giảm 15% cho tất cả giày dép',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    maxDiscountAmount: 30,
    minOrderValue: 80,
    applicableCategories: ['Shoes'],
    startDate: '2024-10-01',
    endDate: '2024-10-15',
    maxUses: 300,
    maxUsesPerUser: 1,
    usedCount: 67,
    usersCount: 67,
    totalRevenue: 8950.00,
    totalDiscount: 1120.00,
    isActive: true,
  },
  {
    id: 6,
    code: 'WELCOME10',
    description: 'Chào mừng khách hàng mới - Giảm 10%',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxDiscountAmount: 20,
    minOrderValue: 0,
    applicableCategories: [],
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    maxUses: null,
    maxUsesPerUser: 1,
    usedCount: 523,
    usersCount: 523,
    totalRevenue: 67800.00,
    totalDiscount: 6780.00,
    isActive: true,
  },
];

const couponService = {
  async getCoupons() {
    await delay(500);
    return [...fakeCoupons];
  },

  async getCouponById(id) {
    await delay(300);
    const coupon = fakeCoupons.find(c => c.id === id);
    if (!coupon) throw new Error('Coupon not found');
    return { ...coupon };
  },

  async createCoupon(couponData) {
    await delay(500);
    const newCoupon = {
      ...couponData,
      id: Math.max(...fakeCoupons.map(c => c.id), 0) + 1,
      usedCount: 0,
      usersCount: 0,
      totalRevenue: 0,
      totalDiscount: 0,
    };
    fakeCoupons.push(newCoupon);
    return newCoupon;
  },

  async updateCoupon(id, couponData) {
    await delay(500);
    const index = fakeCoupons.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Coupon not found');
    
    fakeCoupons[index] = {
      ...fakeCoupons[index],
      ...couponData,
    };
    return fakeCoupons[index];
  },

  async deleteCoupon(id) {
    await delay(300);
    const index = fakeCoupons.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Coupon not found');
    
    fakeCoupons.splice(index, 1);
    return { success: true };
  },

  async validateCoupon(code, orderValue, categories) {
    await delay(300);
    const coupon = fakeCoupons.find(c => c.code === code);
    
    if (!coupon) {
      return { valid: false, message: 'Mã coupon không tồn tại' };
    }

    if (!coupon.isActive) {
      return { valid: false, message: 'Mã coupon đã bị vô hiệu hóa' };
    }

    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (now < startDate) {
      return { valid: false, message: 'Mã coupon chưa có hiệu lực' };
    }

    if (now > endDate) {
      return { valid: false, message: 'Mã coupon đã hết hạn' };
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, message: 'Mã coupon đã hết lượt sử dụng' };
    }

    if (orderValue < coupon.minOrderValue) {
      return { 
        valid: false, 
        message: `Đơn hàng tối thiểu $${coupon.minOrderValue}` 
      };
    }

    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      const hasValidCategory = categories.some(cat => 
        coupon.applicableCategories.includes(cat)
      );
      if (!hasValidCategory) {
        return { 
          valid: false, 
          message: 'Mã coupon không áp dụng cho sản phẩm này' 
        };
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (orderValue * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return {
      valid: true,
      coupon,
      discountAmount,
      message: 'Mã coupon hợp lệ'
    };
  },
};

export const { 
  getCoupons, 
  getCouponById, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon,
  validateCoupon 
} = couponService;

export default couponService;
