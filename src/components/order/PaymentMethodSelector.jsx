import React from 'react';
import { FaMoneyBillWave, FaCreditCard } from 'react-icons/fa';

/**
 * PaymentMethodSelector Component
 * Allow users to select payment method (COD, Online Payment, Bank Transfer)
 */
const PaymentMethodSelector = ({ 
  selectedMethod = 'COD', 
  onMethodChange = () => {} 
}) => {
  const paymentMethods = [
    {
      id: 'COD',
      name: 'Thanh toán khi nhận hàng',
      description: 'Thanh toán tiền mặt khi nhận hàng từ shipper',
      icon: FaMoneyBillWave,
      color: 'bg-green-50 border-green-200',
      activeColor: 'bg-green-100 border-green-500'
    },
    {
      id: 'MOMO',
      name: 'Ví điện tử MoMo',
      description: 'Thanh toán nhanh chóng qua ví MoMo',
      icon: FaCreditCard,
      color: 'bg-purple-50 border-purple-200',
      activeColor: 'bg-purple-100 border-purple-500'
    },
    {
      id: 'BANK',
      name: 'Chuyển khoản ngân hàng',
      description: 'Thanh toán qua chuyển khoản ngân hàng',
      icon: FaCreditCard,
      color: 'bg-blue-50 border-blue-200',
      activeColor: 'bg-blue-100 border-blue-500'
    },
  ];

  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;
        const bgClass = isSelected ? method.activeColor : method.color;

        return (
          <label
            key={method.id}
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${bgClass}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={isSelected}
              onChange={() => onMethodChange(method.id)}
              className="mt-1 mr-4 w-5 h-5 cursor-pointer"
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Icon className={`text-lg ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className="font-semibold text-gray-900">
                  {method.name}
                </span>
              </div>
              <p className="text-sm text-gray-600 ml-8">
                {method.description}
              </p>
            </div>
          </label>
        );
      })}

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <span className="font-semibold">⚠️ Lưu ý:</span> Tất cả giao dịch được bảo mật bởi hệ thống thanh toán an toàn.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
