import React, { Suspense } from 'react';
import TrendingFeedClient from '@/components/TrendingFeedClient';

const HomePageLoading = () => {
    return <div className="text-center p-10 text-gray-500 dark:text-gray-400 font-medium">Loading videos...</div>;
};

const HomePage = () => {
  return (
    <Suspense fallback={<HomePageLoading />}>
      <TrendingFeedClient />
    </Suspense>
  );
};

export default HomePage;