import React from 'react';

const TermsPage = () => {
    return (
        <main className="container mx-auto px-6 py-12">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Terms of Service</h1>
                
                <div className="prose max-w-none">
                    <p className="font-semibold">Last updated: September 10, 2025</p>
                    
                    <h2 className="text-xl font-semibold mt-6">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using Aurahub (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                    </p>

                    <h2 className="text-xl font-semibold mt-6">2. User Conduct</h2>
                    <p>
                        You are solely responsible for all video content, comments, and information that you upload, post, or otherwise transmit via the Service. You agree not to use the service to post or transmit any material which is defamatory, offensive, or of an obscene or menacing character, or which may, in our judgment, cause annoyance, inconvenience, or needless anxiety to any person.
                    </p>

                    <h2 className="text-xl font-semibold mt-6">3. Content Ownership</h2>
                    <p>
                        You retain all of your ownership rights in your content. However, by submitting content to Aurahub, you hereby grant Aurahub a worldwide, non-exclusive, royalty-free, sublicenseable and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the content in connection with the Service.
                    </p>
                </div>
            </div>
        </main>
    );
};

export default TermsPage;