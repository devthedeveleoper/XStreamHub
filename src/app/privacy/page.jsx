import React from 'react';

const PrivacyPage = () => {
    return (
        <main className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Privacy Policy</h1>
                
                <div className="prose max-w-none">
                    <p className="font-semibold">Last updated: September 10, 2025</p>
                    
                    <h2 className="text-xl font-semibold mt-6">1. Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us. For example, we collect information when you create an account, subscribe, upload content, post comments, or otherwise communicate with us. The types of information we may collect include your username, email address, password, and any other information you choose to provide.
                    </p>

                    <h2 className="text-xl font-semibold mt-6">2. How We Use Information</h2>
                    <p>
                        We may use the information we collect to provide, maintain, and improve our services, such as to authenticate users, process transactions, and personalize content. We may also use the information we collect to communicate with you about products, services, offers, and events offered by Aurahub.
                    </p>

                    <h2 className="text-xl font-semibold mt-6">3. Sharing of Information</h2>
                    <p>
                        We do not share your personal information with third parties except as described in this Privacy Policy or in connection with the Service. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                    </p>
                </div>
            </div>
        </main>
    );
};

export default PrivacyPage;