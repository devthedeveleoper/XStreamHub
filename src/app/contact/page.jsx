import React from 'react';

const ContactPage = () => {
    return (
        <main className="container mx-auto px-6 py-12">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
                    We'd love to hear from you! Whether you have a question, feedback, or a concern, feel free to reach out.
                </p>
                
                <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 text-left transition-colors duration-300">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h2>
                    <div className="space-y-6">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            <strong className="text-gray-900 dark:text-gray-100">Admin:</strong> For direct inquiries, you can contact the admin at <a href="mailto:kalluhalwai@aurahub.fun" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">divyansh@aurahub.fun</a>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            <strong className="text-gray-900 dark:text-gray-100">Support:</strong> For technical issues or help with your account, please email us at <a href="mailto:support@aurahub.fun" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">support@aurahub.fun</a>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            <strong className="text-gray-900 dark:text-gray-100">Report Issues:</strong> To report a bug or inappropriate content, contact us at <a href="mailto:report@aurahub.fun" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">report@aurahub.fun</a>.
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            <strong className="text-gray-900 dark:text-gray-100">Location:</strong> Aurahub HQ, Kota, Rajasthan, India.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ContactPage;