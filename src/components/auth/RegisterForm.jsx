import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import Step1Contact from './RegisterSteps/Step1Contact';
import Step2OTP from './RegisterSteps/Step2OTP';
import Step3Complete from './RegisterSteps/Step3Complete';

/**
 * RegisterForm Component
 * Multi-step registration wizard
 * Step 1: Check Contact → Step 2: Verify OTP → Step 3: Complete Registration
 */
const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    contact: '',
    contactType: null,
    otp: '',
  });

  const steps = [
    { number: 1, title: 'Xác thực liên hệ', description: 'Email/SĐT' },
    { number: 2, title: 'Nhập mã OTP', description: 'Xác thực' },
    { number: 3, title: 'Hoàn tất', description: 'Thông tin' },
  ];

  /**
   * Move to next step with data
   */
  const handleNext = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
    setCurrentStep(currentStep + 1);
  };

  /**
   * Go back to previous step
   */
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div
              className="h-full bg-primary-500 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`flex flex-col items-center ${
                index === 0 ? 'items-start' :
                index === steps.length - 1 ? 'items-end' :
                'items-center'
              }`}
            >
              {/* Step Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-bold text-sm transition-all duration-300 mb-2
                  ${currentStep > step.number
                    ? 'bg-primary-600 text-white'
                    : currentStep === step.number
                    ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                    : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {currentStep > step.number ? (
                  <FiCheck className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>

              {/* Step Info */}
              <div className={`text-center ${
                index === 0 ? 'text-left' :
                index === steps.length - 1 ? 'text-right' :
                'text-center'
              }`}>
                <p
                  className={`text-sm font-semibold transition-colors ${
                    currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {currentStep === 1 && (
          <Step1Contact
            onNext={handleNext}
            initialContact={formData.contact}
          />
        )}

        {currentStep === 2 && (
          <Step2OTP
            contact={formData.contact}
            contactType={formData.contactType}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <Step3Complete
            contact={formData.contact}
            contactType={formData.contactType}
            otp={formData.otp}
            onBack={handleBack}
          />
        )}
      </div>

      {/* Step Counter (Mobile) */}
      <p className="text-center text-sm text-gray-500 mt-4 sm:hidden">
        Bước {currentStep}/{steps.length}
      </p>
    </div>
  );
};

export default RegisterForm;
