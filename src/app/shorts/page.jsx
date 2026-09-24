import React, { Suspense } from 'react';
import ShortsFeedClient from '@/components/ShortsFeedClient';

const ShortsLoading = () => {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)] bg-black">
        <div className="text-white text-lg font-medium animate-pulse">Loading Shorts...</div>
      </div>
    );
};

const ShortsPage = () => {
  return (
    <Suspense fallback={<ShortsLoading />}>
      <ShortsFeedClient />
    </Suspense>
  );
};

export default ShortsPage;
