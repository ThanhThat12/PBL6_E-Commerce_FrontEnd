import { useState, useEffect } from 'react';
import { getProvinces, getDistricts, getWards } from '../services/userService';

/**
 * Custom Hook: useAddressMaster
 * Quản lý location data (provinces, districts, wards) từ GHN Master Data API
 * 
 * @returns {Object} - {
 *   provinces,         // Array của provinces
 *   districts,         // Array của districts (based on selected province)
 *   wards,            // Array của wards (based on selected district)
 *   loading,          // Loading state khi fetch provinces
 *   loadingDistricts, // Loading state khi fetch districts
 *   loadingWards,     // Loading state khi fetch wards
 *   selectProvince,   // Function: selectProvince(provinceId)
 *   selectDistrict,   // Function: selectDistrict(districtId)
 *   selectedProvinceId,
 *   selectedDistrictId,
 *   error             // Error message nếu có
 * }
 */
export const useAddressMaster = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [error, setError] = useState(null);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(true);
      try {
        const provincesData = await getProvinces();
        console.log('Provinces data received:', provincesData);
        
        // Ensure we have array data
        if (!Array.isArray(provincesData)) {
          console.warn('Provinces data is not an array:', provincesData);
          setProvinces([]);
          setError(null);
          return;
        }
        
        // Filter out test data and duplicates
        const filtered = provincesData.filter(p => {
          const name = p.ProvinceName || p.name || '';
          // Remove test data
          if (name.toLowerCase().includes('test') || 
              name.toLowerCase().includes('ngoc') ||
              name.includes('Alert')) {
            return false;
          }
          // Remove "Hà Nội 02", keep only "Hà Nội"
          if (name === 'Hà Nội 02') {
            return false;
          }
          return true;
        });
        
        // Format provinces data: handle both GHN format and custom format
        const formatted = filtered.map(p => ({
          id: p.ProvinceID || p.id,
          name: p.ProvinceName || p.name
        }));
        
        // Sort alphabetically
        formatted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        
        console.log('Formatted provinces:', formatted);
        
        setProvinces(formatted);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch provinces:', err);
        console.error('Error details:', err.response || err);
        setError('Không thể tải danh sách tỉnh/thành phố');
        setProvinces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (!selectedProvinceId) {
      setDistricts([]);
      return;
    }

    const fetchDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const districtsData = await getDistricts(selectedProvinceId);
        console.log('Districts data received:', districtsData);
        
        // Ensure we have array data
        if (!Array.isArray(districtsData)) {
          console.warn('Districts data is not an array:', districtsData);
          setDistricts([]);
          return;
        }
        
        // Filter out test data and remove duplicates
        const seen = new Set();
        const filtered = districtsData.filter(d => {
          const name = d.DistrictName || d.name || '';
          // Remove test data
          if (name.toLowerCase().includes('test') || name.includes('Alert')) {
            return false;
          }
          // Remove duplicates (keep first occurrence)
          if (seen.has(name)) {
            return false;
          }
          seen.add(name);
          return true;
        });
        
        // Format districts data
        const formatted = filtered.map(d => ({
          id: d.DistrictID || d.id,
          name: d.DistrictName || d.name
        }));
        
        // Sort alphabetically
        formatted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        
        setDistricts(formatted);
        setSelectedDistrictId(null); // Reset selected district
        setWards([]); // Reset wards
        setError(null);
      } catch (err) {
        console.error('Failed to fetch districts:', err);
        console.error('Error details:', err.response || err);
        setError('Không thể tải danh sách quận/huyện');
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, [selectedProvinceId]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!selectedDistrictId) {
      setWards([]);
      return;
    }

    const fetchWards = async () => {
      setLoadingWards(true);
      try {
        const wardsData = await getWards(selectedDistrictId);
        console.log('Wards data received:', wardsData);
        
        // Ensure we have array data
        if (!Array.isArray(wardsData)) {
          console.warn('Wards data is not an array:', wardsData);
          setWards([]);
          return;
        }
        
        // Filter out test data and remove duplicates
        const seen = new Set();
        const filtered = wardsData.filter(w => {
          const name = w.WardName || w.name || '';
          // Remove test data
          if (name.toLowerCase().includes('test') || name.includes('Alert')) {
            return false;
          }
          // Remove duplicates (keep first occurrence)
          if (seen.has(name)) {
            return false;
          }
          seen.add(name);
          return true;
        });
        
        // Format wards data
        const formatted = filtered.map(w => ({
          id: w.WardCode || w.id,
          name: w.WardName || w.name
        }));
        
        // Sort alphabetically
        formatted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        
        setWards(formatted);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch wards:', err);
        console.error('Error details:', err.response || err);
        setError('Không thể tải danh sách phường/xã');
        setWards([]);
      } finally {
        setLoadingWards(false);
      }
    };

    fetchWards();
  }, [selectedDistrictId]);

  /**
   * Select province and trigger fetch districts
   */
  const selectProvince = (provinceId) => {
    if (!provinceId) {
      console.warn('selectProvince: provinceId is null or undefined');
      setSelectedProvinceId(null);
      return;
    }
    const id = Number(provinceId);
    if (isNaN(id)) {
      console.error('selectProvince: provinceId is not a valid number:', provinceId);
      return;
    }
    console.log('selectProvince called with:', id);
    setSelectedProvinceId(id);
  };

  /**
   * Select district and trigger fetch wards
   */
  const selectDistrict = (districtId) => {
    if (!districtId) {
      console.warn('selectDistrict: districtId is null or undefined');
      setSelectedDistrictId(null);
      return;
    }
    const id = Number(districtId);
    if (isNaN(id)) {
      console.error('selectDistrict: districtId is not a valid number:', districtId);
      return;
    }
    console.log('selectDistrict called with:', id);
    setSelectedDistrictId(id);
  };

  return {
    provinces,
    districts,
    wards,
    loading,
    loadingDistricts,
    loadingWards,
    error,
    selectProvince,
    selectDistrict,
    selectedProvinceId,
    selectedDistrictId
  };
};
