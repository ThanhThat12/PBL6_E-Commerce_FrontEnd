import React, { useState } from 'react';
import Input from '../components/common/Input';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';

/**
 * Input Component Demo
 * Test all variations of Input component
 */
const InputDemo = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: '',
    noIcon: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'Email không được để trống' }));
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Email không hợp lệ' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Input Component Demo
          </h1>
          <p className="text-gray-600 mb-8">
            Test all variations with icons and validation
          </p>

          <div className="space-y-6">
            {/* Email with Icon */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                1. Email Input with Icon
              </h3>
              <Input
                type="email"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={validateEmail}
                placeholder="example@email.com"
                icon={FiMail}
                error={errors.email}
                required
              />
            </div>

            {/* Password with Icon */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                2. Password Input with Icon (toggle visibility)
              </h3>
              <Input
                type="password"
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                icon={FiLock}
                required
              />
            </div>

            {/* Username with Icon */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                3. Username Input with Icon
              </h3>
              <Input
                type="text"
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                icon={FiUser}
              />
            </div>

            {/* Phone with Icon */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                4. Phone Input with Icon
              </h3>
              <Input
                type="tel"
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0912 345 678"
                icon={FiPhone}
              />
            </div>

            {/* No Icon */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                5. Input Without Icon
              </h3>
              <Input
                type="text"
                label="No Icon Input"
                name="noIcon"
                value={formData.noIcon}
                onChange={handleChange}
                placeholder="This input has no icon"
              />
            </div>

            {/* Disabled State */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                6. Disabled Input
              </h3>
              <Input
                type="text"
                label="Disabled Input"
                value="Cannot edit this"
                placeholder="Disabled placeholder"
                icon={FiMail}
                disabled
              />
            </div>
          </div>

          {/* Current Values Display */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Current Form Values:
            </h3>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>

          {/* Spacing Test */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              ✓ Spacing Check:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Icon positioned at left-4 (16px from left)</li>
              <li>• Input text starts at pl-12 (48px from left) when icon present</li>
              <li>• Placeholder should NOT overlap with icon</li>
              <li>• Password toggle at right-4 (16px from right)</li>
              <li>• Proper spacing for all states: default, focus, error</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputDemo;
