/**
 * Address Service
 * Service to fetch provinces, districts, and wards from Vietnam
 * 
 * Primary API: https://provinces.open-api.vn/api/
 * Fallback API: https://vapi.vnappmob.com/api/province
 */

// Primary API endpoints
const PRIMARY_API = 'https://provinces.open-api.vn/api';

// Fallback API endpoint
const FALLBACK_API = 'https://vapi.vnappmob.com/api/province';

// Timeout configuration (5 seconds)
const FETCH_TIMEOUT = 5000;

/**
 * Fetch with timeout
 * @param {string} url
 * @param {number} timeout
 * @returns {Promise}
 */
const fetchWithTimeout = (url, timeout = FETCH_TIMEOUT) => {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

const addressService = {
  /**
   * Get all provinces/cities with fallback
   * @returns {Promise<Array>}
   */
  getProvinces: async () => {
    try {
      console.log('📍 Fetching provinces from primary API...');
      const response = await fetchWithTimeout(`${PRIMARY_API}/p/`);
      const data = await response.json();
      console.log('✅ Provinces loaded from primary API');
      return data;
    } catch (primaryError) {
      console.warn('⚠️ Primary API failed, trying fallback:', primaryError.message);
      
      try {
        console.log('📍 Fetching provinces from fallback API...');
        const response = await fetchWithTimeout(`${FALLBACK_API}`);
        const data = await response.json();
        console.log('✅ Provinces loaded from fallback API');
        
        // Transform fallback API response to match primary API format
        return data.data || [];
      } catch (fallbackError) {
        console.error('❌ Both APIs failed:', fallbackError.message);
        throw new Error('Unable to fetch provinces from both APIs');
      }
    }
  },

  /**
   * Get districts by province code with fallback
   * @param {string} provinceCode - Province code
   * @returns {Promise<Array>}
   */
  getDistricts: async (provinceCode) => {
    if (!provinceCode) {
      console.warn('⚠️ Province code is required');
      return [];
    }

    try {
      console.log(`📍 Fetching districts for province ${provinceCode} from primary API...`);
      const response = await fetchWithTimeout(`${PRIMARY_API}/p/${provinceCode}?depth=2`);
      const data = await response.json();
      console.log(`✅ Districts loaded from primary API`);
      return data.districts || [];
    } catch (primaryError) {
      console.warn('⚠️ Primary API failed, trying fallback:', primaryError.message);
      
      try {
        console.log(`📍 Fetching districts for province ${provinceCode} from fallback API...`);
        const response = await fetchWithTimeout(`${FALLBACK_API}?id=${provinceCode}`);
        const data = await response.json();
        console.log(`✅ Districts loaded from fallback API`);
        
        // Transform fallback API response
        return data.data?.districts || data.data || [];
      } catch (fallbackError) {
        console.error('❌ Both APIs failed:', fallbackError.message);
        return [];
      }
    }
  },

  /**
   * Get wards by district code with fallback
   * @param {string} districtCode - District code
   * @returns {Promise<Array>}
   */
  getWards: async (districtCode) => {
    if (!districtCode) {
      console.warn('⚠️ District code is required');
      return [];
    }

    try {
      console.log(`📍 Fetching wards for district ${districtCode} from primary API...`);
      const response = await fetchWithTimeout(`${PRIMARY_API}/d/${districtCode}?depth=2`);
      const data = await response.json();
      console.log(`✅ Wards loaded from primary API`);
      return data.wards || [];
    } catch (primaryError) {
      console.warn('⚠️ Primary API failed, trying fallback:', primaryError.message);
      
      try {
        console.log(`📍 Fetching wards for district ${districtCode} from fallback API...`);
        const response = await fetchWithTimeout(`${FALLBACK_API}?id=${districtCode}`);
        const data = await response.json();
        console.log(`✅ Wards loaded from fallback API`);
        
        // Transform fallback API response
        return data.data?.wards || data.data || [];
      } catch (fallbackError) {
        console.error('❌ Both APIs failed:', fallbackError.message);
        return [];
      }
    }
  },

  /**
   * Get full address details with fallback
   * @param {string} provinceCode
   * @param {string} districtCode
   * @param {string} wardCode
   * @returns {Promise<Object>}
   */
  getFullAddress: async (provinceCode, districtCode, wardCode) => {
    try {
      console.log('📍 Fetching full address details...');
      const [provinces, districtData, wardData] = await Promise.all([
        addressService.getProvinces(),
        addressService.getDistricts(districtCode),
        addressService.getWards(wardCode)
      ]);

      const province = provinces.find(p => p.code === parseInt(provinceCode));
      const district = districtData.find(d => d.code === parseInt(districtCode));
      const ward = wardData.find(w => w.code === parseInt(wardCode));

      const result = {
        province: province?.name || '',
        district: district?.name || '',
        ward: ward?.name || ''
      };

      console.log('✅ Full address loaded:', result);
      return result;
    } catch (error) {
      console.error('❌ Error getting full address:', error.message);
      return {
        province: '',
        district: '',
        ward: ''
      };
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

      console.log(`💰 Calculated shipping fee: ${fee}₫`);

      return {
        total: fee,
        service_type_name: 'Giao hàng tiêu chuẩn',
        expected_delivery_time: '3-5 ngày',
        insurance_fee: 0,
        weight: weight
      };
    } catch (error) {
      console.error('❌ Error calculating shipping fee:', error);
      throw error;
    }
  }
};

export default addressService;
