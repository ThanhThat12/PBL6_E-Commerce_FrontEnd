import React from 'react';
import PropTypes from 'prop-types';

/**
 * LocationDropdown
 * Reusable component với 3 dropdown: Tỉnh/Thành phố, Quận/Huyện, Phường/Xã
 * 
 * Props:
 * - selectedProvince: {id, name} - currently selected province
 * - selectedDistrict: {id, name} - currently selected district
 * - selectedWard: {id, name} - currently selected ward
 * - provinces: Array<{id, name}> - list of all provinces
 * - districts: Array<{id, name}> - list of all districts
 * - wards: Array<{id, name}> - list of all wards
 * - onProvinceChange: (province) => void - callback when province selected
 * - onDistrictChange: (district) => void - callback when district selected
 * - onWardChange: (ward) => void - callback when ward selected
 * - loadingDistricts: boolean - show loading state for districts
 * - loadingWards: boolean - show loading state for wards
 * - error: string - error message to display
 * - disabled: boolean - disable all dropdowns
 */
const LocationDropdown = ({
  selectedProvince,
  selectedDistrict,
  selectedWard,
  provinces,
  districts,
  wards,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  loadingDistricts,
  loadingWards,
  error,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      {/* Province Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tỉnh/Thành phố <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedProvince?.id || ''}
          onChange={(e) => {
            const value = e.target.value;
            // ProvinceID can be string or number, so compare as string
            const selected = provinces.find(p => String(p.id) === String(value));
            onProvinceChange(selected);
          }}
          disabled={disabled}
          className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">-- Chọn tỉnh/thành phố --</option>
          {provinces.map(province => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      </div>

      {/* District Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quận/Huyện <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedDistrict?.id || ''}
          onChange={(e) => {
            const value = e.target.value;
            // DistrictID can be string or number, so compare as string
            const selected = districts.find(d => String(d.id) === String(value));
            onDistrictChange(selected);
          }}
          disabled={!selectedProvince?.id || loadingDistricts || disabled}
          className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {loadingDistricts ? '-- Đang tải... --' : '-- Chọn quận/huyện --'}
          </option>
          {districts.map(district => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ward Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phường/Xã <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedWard?.id || ''}
          onChange={(e) => {
            const value = e.target.value;
            // WardCode can be string or number, so compare as string
            const selected = wards.find(w => String(w.id) === String(value));
            onWardChange(selected);
          }}
          disabled={!selectedDistrict?.id || loadingWards || disabled}
          className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {loadingWards ? '-- Đang tải... --' : '-- Chọn phường/xã --'}
          </option>
          {wards.map(ward => (
            <option key={ward.id} value={ward.id}>
              {ward.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

LocationDropdown.propTypes = {
  selectedProvince: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  selectedDistrict: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  selectedWard: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  provinces: PropTypes.array.isRequired,
  districts: PropTypes.array.isRequired,
  wards: PropTypes.array.isRequired,
  onProvinceChange: PropTypes.func.isRequired,
  onDistrictChange: PropTypes.func.isRequired,
  onWardChange: PropTypes.func.isRequired,
  loadingDistricts: PropTypes.bool,
  loadingWards: PropTypes.bool,
  error: PropTypes.string,
  disabled: PropTypes.bool
};

export default LocationDropdown;
