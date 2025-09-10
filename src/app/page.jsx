import React, { Suspense } from 'react';
import HomePageClient from '@/components/HomePageClient';

const HomePageLoading = () => {
    return <div className="text-center p-10">Loading videos...</div>;
};

const HomePage = () => {
  return (
    <Suspense fallback={<HomePageLoading />}>
      <HomePageClient />
    </Suspense>
  );
};

export default HomePage;