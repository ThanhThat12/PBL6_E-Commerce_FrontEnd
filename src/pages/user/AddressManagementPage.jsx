import React from 'react';
import ProfileLayout from '../../components/layout/ProfileLayout';
import AddressManagement from '../../components/profile/AddressManagement';

/**
 * AddressManagementPage
 * Page wrapper cho AddressManagement với ProfileLayout sidebar
 */
const AddressManagementPage = () => {
  return (
    <ProfileLayout>
      <AddressManagement />
    </ProfileLayout>
  );
};

export default AddressManagementPage;
