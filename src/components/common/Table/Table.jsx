import React from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  ArrowsUpDownIcon 
} from '@heroicons/react/24/outline';

/**
 * Table Component - Base table component với styling
 * 
 * @param {array} columns - Cấu hình cột [{ key, label, width, align, render }]
 * @param {array} data - Dữ liệu hiển thị
 * @param {boolean} striped - Hiển thị striped rows
 * @param {boolean} hoverable - Hiển thị hover effect
 * @param {boolean} bordered - Hiển thị border
 * @param {string} size - Kích thước: 'sm', 'md', 'lg'
 * @param {function} onRowClick - Callback khi click vào row
 * @param {string} className - Custom classes
 */
const Table = ({ 
  columns = [],
  data = [],
  striped = false,
  hoverable = true,
  bordered = true,
  size = 'md',
  onRowClick,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const paddingClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className={`
          overflow-hidden 
          ${bordered ? 'border border-border rounded-lg' : ''}
          shadow-soft
        `}>
          <table className="min-w-full divide-y divide-border">
            {/* Table Header */}
            <thead className="bg-background-tertiary">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.key || index}
                    scope="col"
                    style={{ width: column.width }}
                    className={`
                      ${paddingClasses[size]}
                      ${sizeClasses[size]}
                      font-semibold
                      text-text-primary
                      uppercase
                      tracking-wider
                      ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                    `}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white divide-y divide-border">
              {data.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-text-tertiary"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`
                      ${striped && rowIndex % 2 === 1 ? 'bg-background-secondary' : ''}
                      ${hoverable ? 'hover:bg-primary-50 transition-colors' : ''}
                      ${onRowClick ? 'cursor-pointer' : ''}
                    `}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={column.key || colIndex}
                        className={`
                          ${paddingClasses[size]}
                          ${sizeClasses[size]}
                          text-text-secondary
                          ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                        `}
                      >
                        {column.render 
                          ? column.render(row[column.key], row, rowIndex)
                          : row[column.key]
                        }
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
