import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
    return (
        <main className="container mx-auto px-6 py-12">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About Aurahub</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Aurahub was founded in 2025 with a simple mission: to provide a clean, fast, and community-focused platform for creators to share their passions with the world. We believe in the power of video to connect, educate, and entertain.
                </p>
            </div>

            <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-2 gap-8 text-left">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Our Vision</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        To empower creators of all sizes by providing them with the tools they need to succeed. We're committed to building a platform that values quality content and fosters positive interaction, free from the noise of traditional social media.
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Get Involved</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Whether you're a viewer or a creator, you are the core of our community. Start by exploring our <Link href="/" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">trending videos</Link>, or if you're ready to share your own story, <Link href="/upload" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">upload your first video</Link> today.
                    </p>
                </div>
            </div>
        </main>
    );
};

export default AboutPage;