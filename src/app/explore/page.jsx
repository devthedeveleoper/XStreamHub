import React, { Suspense } from 'react';
import ExploreFeedClient from '@/components/ExploreFeedClient';

const ExploreLoading = () => {
    return <div className="text-center p-10 text-gray-500 dark:text-gray-400 font-medium">Loading explore feed...</div>;
};

const ExplorePage = () => {
  return (
    <Suspense fallback={<ExploreLoading />}>
      <ExploreFeedClient />
    </Suspense>
  );
};

export default ExplorePage;
