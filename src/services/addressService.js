/**
 * Address Service
 * Service to fetch provinces, districts, and wards
 */

// You can also use this public API: https://provinces.open-api.vn/api/
const BASE_URL = 'https://provinces.open-api.vn/api';

const addressService = {
  /**
   * Get all provinces/cities
   */
  getProvinces: async () => {
    try {
      const response = await fetch(`${BASE_URL}/p/`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching provinces:', error);
      throw error;
    }
  },

  /**
   * Get districts by province code
   * @param {string} provinceCode - Province code
   */
  getDistricts: async (provinceCode) => {
    try {
      const response = await fetch(`${BASE_URL}/p/${provinceCode}?depth=2`);
      const data = await response.json();
      return data.districts || [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  },

  /**
   * Get wards by district code
   * @param {string} districtCode - District code
   */
  getWards: async (districtCode) => {
    try {
      const response = await fetch(`${BASE_URL}/d/${districtCode}?depth=2`);
      const data = await response.json();
      return data.wards || [];
    } catch (error) {
      console.error('Error fetching wards:', error);
      throw error;
    }
  },

  /**
   * Get full address details
   * @param {string} provinceCode
   * @param {string} districtCode
   * @param {string} wardCode
   */
  getFullAddress: async (provinceCode, districtCode, wardCode) => {
    try {
      const [provinces, districtData, wardData] = await Promise.all([
        addressService.getProvinces(),
        fetch(`${BASE_URL}/d/${districtCode}?depth=2`).then(r => r.json()),
        fetch(`${BASE_URL}/w/${wardCode}?depth=2`).then(r => r.json())
      ]);

      const province = provinces.find(p => p.code === parseInt(provinceCode));
      const district = districtData;
      const ward = wardData;

      return {
        province: province?.name || '',
        district: district?.name || '',
        ward: ward?.name || ''
      };
    } catch (error) {
      console.error('Error getting full address:', error);
      throw error;
    }
  },

  /**
   * Calculate shipping fee based on address
   * @param {Object} params - { toDistrictId, toWardCode, weight, insuranceValue }
   * @returns {Promise<Object>} - Shipping fee details
   */
  calculateShippingFee: async ({ toDistrictId, toWardCode, weight = 500, insuranceValue = 0 }) => {
    try {
      // TODO: Replace with actual shipping API (GHN, GHTK, etc.)
      // For now, return mock data based on district
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock shipping fee calculation
      // HCM & Ha Noi: Free
      // Other major cities: 20k
      // Other provinces: 30k
      
      const districtId = parseInt(toDistrictId);
      
      // Mock data - HCM districts (district 1-12, Thu Duc, etc.)
      const hcmDistricts = [1, 3, 4, 5, 6, 7, 8, 10, 11, 12, 'Q1', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q10', 'Q11', 'Q12'];
      
      let fee = 30000; // Default
      
      if (hcmDistricts.includes(districtId) || (districtId >= 760 && districtId <= 780)) {
        fee = 0; // Free for HCM
      } else if (districtId >= 1 && districtId <= 30) {
        fee = 0; // Free for Hanoi center
      } else if (districtId >= 31 && districtId <= 100) {
        fee = 20000; // Major cities
      }

      return {
        total: fee,
        service_type_name: 'Giao hàng tiêu chuẩn',
        expected_delivery_time: '3-5 ngày',
        insurance_fee: 0,
        weight: weight
      };
    } catch (error) {
      console.error('Error calculating shipping fee:', error);
      throw error;
    }
  }
};

export default addressService;
