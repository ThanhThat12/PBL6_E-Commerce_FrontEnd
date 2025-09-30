import React from 'react';

import JustForYou from '../components/feature/wishlist/JustForYou';
import WishlistTab from '../components/feature/wishlist/WishlistTab';
import Footer from '../components/layout/footer/Footer';
import { wishlistProducts, justForYouProducts } from '../mockData';



const WishlistPage = () => {
  // Dummy handlers
  const handleAddToCart = () => {};
  const handleRemoveFromWishlist = () => {};
  const handleMoveAllToBag = () => {};
  const handleSeeAll = () => {};

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col gap-8 pt-8">
      <div className="container mx-auto px-4 flex flex-col gap-8" style={{ flex: 1 }}>
        <WishlistTab
          products={wishlistProducts}
          onAddToCart={handleAddToCart}
          onRemove={handleRemoveFromWishlist}
          onMoveAllToBag={handleMoveAllToBag}
        />
        <JustForYou
          products={justForYouProducts}
          onAddToCart={handleAddToCart}
          onSeeAll={handleSeeAll}
        />
      </div>
      <Footer />
    </main>
  );
};

export default WishlistPage;
