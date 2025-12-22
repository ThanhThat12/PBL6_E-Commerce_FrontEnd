import { useMemo } from 'react';

/**
 * Custom hook to determine if current user owns a specific shop
 * Uses the same logic as ShopDetailPage for consistency
 */
const useShopOwnership = (user, shopData) => {
  const isShopOwner = useMemo(() => {
    if (!user || !shopData) return false;
    
    // Extract user identifiers
    const userId = user.id || user.userId;
    const userShopId = user.shopId || user.shop?.id;
    
    // Extract shop identifiers
    const shopId = shopData.id || shopData.shopId;
    const ownerId = shopData.ownerId || shopData.owner?.id || shopData.shopOwnerId;
    
    console.log('[useShopOwnership] User ID:', userId, 'Shop Owner ID:', ownerId);
    console.log('[useShopOwnership] User Shop ID:', userShopId, 'Current Shop ID:', shopId);
    
    // Check direct ownership: user.id === shop.ownerId
    if (userId && ownerId && String(userId) === String(ownerId)) {
      return true;
    }
    
    // Check shop membership: user.shopId === shop.id
    if (userShopId && shopId && String(userShopId) === String(shopId)) {
      return true;
    }
    
    return false;
  }, [user, shopData]);
  
  return isShopOwner;
};

export default useShopOwnership;