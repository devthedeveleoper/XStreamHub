import React, { Suspense } from 'react';
import DashboardClient from './DashboardClient';

const DashboardLoading = () => {
    return <div className="text-center p-10">Loading Dashboard...</div>;
};

const DashboardPage = () => {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardClient />
    </Suspense>
  );
};

export default DashboardPage;