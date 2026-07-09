import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 mt-12 transition-colors duration-300">
            <div className="container mx-auto px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                <div className="flex justify-center space-x-6 mb-4">
                    <Link href="/about" className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</Link>
                    <Link href="/contact" className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</Link>
                    <Link href="/terms" className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</Link>
                    <Link href="/privacy" className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link>
                </div>
                <p className="text-sm">&copy; {new Date().getFullYear()} Aurahub. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;