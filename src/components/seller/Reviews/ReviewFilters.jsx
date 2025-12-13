import React from 'react';
import { FiFilter } from 'react-icons/fi';

/**
 * ReviewFilters - Component lọc đánh giá theo trạng thái và số sao
 */
const ReviewFilters = ({ 
  activeTab, 
  setActiveTab, 
  ratingFilter, 
  setRatingFilter,
  repliedCount,
  unrepliedCount,
  getCountByRating
}) => {
  const totalCount = repliedCount + unrepliedCount;

  const tabs = [
    { key: 'all', label: 'Tất cả', count: totalCount },
    { key: 'unreplied', label: 'Chưa phản hồi', count: unrepliedCount },
    { key: 'replied', label: 'Đã phản hồi', count: repliedCount }
  ];

  const ratingFilters = [
    { key: 'all', label: 'Tất cả' },
    { key: '5', label: '5 sao' },
    { key: '3-4', label: '3-4 sao' },
    { key: '1-2', label: '1-2 sao' }
  ];

  return (
    <>
      {/* Tabs for reply status */}
      <div className="bg-white border-b">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3 flex-wrap">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-700">Lọc theo đánh giá:</span>
          <div className="flex gap-2 flex-wrap">
            {ratingFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setRatingFilter(filter.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  ratingFilter === filter.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({getCountByRating(filter.key)})
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(ReviewFilters);
