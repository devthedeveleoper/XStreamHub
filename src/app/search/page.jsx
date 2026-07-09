import React, { Suspense } from 'react';
import SearchResults from './SearchResults';

const SearchLoading = () => {
    return <p className="text-center p-12 text-gray-500 dark:text-gray-400 font-medium">Loading search results...</p>;
};

const SearchPage = () => {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchResults />
    </Suspense>
  );
};

export default SearchPage;