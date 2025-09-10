import React, { Suspense } from 'react';
import SearchResults from './SearchResults';

const SearchLoading = () => {
    return <p className="text-center p-10">Loading search results...</p>;
};

const SearchPage = () => {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchResults />
    </Suspense>
  );
};

export default SearchPage;