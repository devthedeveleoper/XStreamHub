import React from 'react';

const ContactPage = () => {
    return (
        <main className="container mx-auto px-6 py-12">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
                <p className="text-lg text-gray-600 mb-8">
                    We'd love to hear from you! Whether you have a question, feedback, or a concern, feel free to reach out.
                </p>
                
                <div className="bg-white p-8 rounded-lg shadow-md text-left">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Get in Touch</h2>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            <strong>Admin:</strong> For direct inquiries, you can contact the admin at <a href="mailto:kalluhalwai@aurahub.fun" className="text-blue-600 hover:underline">divyansh@aurahub.fun</a>.
                        </p>
                        <p className="text-gray-700">
                            <strong>Support:</strong> For technical issues or help with your account, please email us at <a href="mailto:support@aurahub.fun" className="text-blue-600 hover:underline">support@aurahub.fun</a>.
                        </p>
                        <p className="text-gray-700">
                            <strong>Report Issues:</strong> To report a bug or inappropriate content, contact us at <a href="mailto:report@aurahub.fun" className="text-blue-600 hover:underline">report@aurahub.fun</a>.
                        </p>
                        <p className="text-gray-700">
                            <strong>Location:</strong> Aurahub HQ, Kota, Rajasthan, India.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ContactPage;