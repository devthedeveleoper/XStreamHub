import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-gray-50 border-t mt-12">
            <div className="container mx-auto px-6 py-8 text-center text-gray-500">
                <div className="flex justify-center space-x-6 mb-4">
                    <Link href="/about" className="text-sm hover:underline">About</Link>
                    <Link href="/contact" className="text-sm hover:underline">Contact</Link>
                    <Link href="/terms" className="text-sm hover:underline">Terms of Service</Link>
                    <Link href="/privacy" className="text-sm hover:underline">Privacy Policy</Link>
                </div>
                <p className="text-sm">&copy; {new Date().getFullYear()} Aurahub. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;