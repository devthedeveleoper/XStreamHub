import React from 'react';

const PrivacyPage = () => {
    return (
        <main className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
                
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-8">Last updated: September 10, 2025</p>
                    
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">1. Information We Collect</h2>
                    <p className="leading-relaxed">
                        We collect information you provide directly to us. For example, we collect information when you create an account, subscribe, upload content, post comments, or otherwise communicate with us. The types of information we may collect include your username, email address, password, and any other information you choose to provide.
                    </p>

                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">2. How We Use Information</h2>
                    <p className="leading-relaxed">
                        We may use the information we collect to provide, maintain, and improve our services, such as to authenticate users, process transactions, and personalize content. We may also use the information we collect to communicate with you about products, services, offers, and events offered by Aurahub.
                    </p>

                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">3. Sharing of Information</h2>
                    <p className="leading-relaxed">
                        We do not share your personal information with third parties except as described in this Privacy Policy or in connection with the Service. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                    </p>
                </div>
            </div>
        </main>
    );
};

export default PrivacyPage;