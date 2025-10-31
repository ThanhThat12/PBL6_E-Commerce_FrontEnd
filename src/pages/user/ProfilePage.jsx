import React from 'react';
import ProfileLayout from '../../components/layout/ProfileLayout';
import ProfileInfo from '../../components/profile/ProfileInfo';

/**
 * ProfilePage
 * Main profile page with sidebar navigation (Shopee-style layout)
 */
const ProfilePage = () => {
  return (
    <ProfileLayout>
      <ProfileInfo />
    </ProfileLayout>
  );
};

export default ProfilePage;
