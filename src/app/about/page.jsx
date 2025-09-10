import React from 'react';
import Link from 'next/link';

const AboutPage = () => {
    return (
        <main className="container mx-auto px-6 py-12">
            <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">About Aurahub</h1>
                <p className="text-lg text-gray-600">
                    Aurahub was founded in 2025 with a simple mission: to provide a clean, fast, and community-focused platform for creators to share their passions with the world. We believe in the power of video to connect, educate, and entertain.
                </p>
            </div>

            <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-2 gap-8 text-left">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">Our Vision</h2>
                    <p className="text-gray-600">
                        To empower creators of all sizes by providing them with the tools they need to succeed. We're committed to building a platform that values quality content and fosters positive interaction, free from the noise of traditional social media.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">Get Involved</h2>
                    <p className="text-gray-600">
                        Whether you're a viewer or a creator, you are the core of our community. Start by exploring our <Link href="/" className="text-blue-600 hover:underline">trending videos</Link>, or if you're ready to share your own story, <Link href="/upload" className="text-blue-600 hover:underline">upload your first video</Link> today.
                    </p>
                </div>
            </div>
        </main>
    );
};

export default AboutPage;