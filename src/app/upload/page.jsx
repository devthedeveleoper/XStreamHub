"use client";

import UploadForm from "@/components/UploadForm";

const UploadPage = () => {
  return (
    <main className="container mx-auto px-6 py-8 flex justify-center items-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-4xl">
        <UploadForm />
      </div>
    </main>
  );
};

export default UploadPage;
