import React from 'react';

const TermsPage = () => {
    return (
        <main className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
                
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mb-8">Last updated: September 10, 2025</p>
                    
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">1. Acceptance of Terms</h2>
                    <p className="leading-relaxed">
                        By accessing and using Aurahub (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                    </p>

                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">2. User Conduct</h2>
                    <p className="leading-relaxed">
                        You are solely responsible for all video content, comments, and information that you upload, post, or otherwise transmit via the Service. You agree not to use the service to post or transmit any material which is defamatory, offensive, or of an obscene or menacing character, or which may, in our judgment, cause annoyance, inconvenience, or needless anxiety to any person.
                    </p>

                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">3. Content Ownership</h2>
                    <p className="leading-relaxed">
                        You retain all of your ownership rights in your content. However, by submitting content to Aurahub, you hereby grant Aurahub a worldwide, non-exclusive, royalty-free, sublicenseable and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the content in connection with the Service.
                    </p>
                </div>
            </div>
        </main>
    );
};

export default TermsPage;