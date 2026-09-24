"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from 'next/image';
import NotificationsPanel from "./NotificationsPanel";
import ThemeToggle from "./ThemeToggle";
import SearchAutocomplete from "./SearchAutocomplete";
import { useAppStore } from "@/store/useAppStore";
import {
  FaUserCircle,
  FaUserEdit,
  FaHistory,
  FaHourglassStart,
} from "react-icons/fa";
import { MdDashboard, MdSubscriptions, MdPlaylistPlay, MdLogout, MdExplore, MdAmpStories } from "react-icons/md";

const Navbar = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const router = useRouter();
  const isMobileMenuOpen = useAppStore((state) => state.isMobileMenuOpen);
  const setMobileMenuOpen = useAppStore((state) => state.setMobileMenuOpen);
  const toggleMobileMenu = useAppStore((state) => state.toggleMobileMenu);

  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/75 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-800 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="font-display text-3xl tracking-tighter font-extrabold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent hover:from-indigo-400 hover:to-violet-400 transition-all duration-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            Aurahub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <SearchAutocomplete 
              className="w-72 lg:w-96" 
              inputClassName="w-full bg-gray-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-full py-2 pl-4 pr-12 focus:outline-none transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" 
            />

            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <Link
                  href="/upload"
                  className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium whitespace-nowrap"
                >
                  Upload
                </Link>
                <NotificationsPanel />
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center justify-center p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors duration-300"
                  >
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User avatar"}
                        width={36}
                        height={36}
                        className="rounded-full ring-2 ring-transparent hover:ring-indigo-500 transition-all duration-300"
                      />
                    ) : (
                      <FaUserCircle size={32} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <ul>
                        <li className="px-4 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {user.email}
                          </p>
                        </li>
                        <div className="py-2">
                          {[
                            { name: "Explore", icon: MdExplore, href: "/explore" },
                            { name: "Shorts", icon: MdAmpStories, href: "/shorts" },
                            { name: "My Profile", icon: FaUserEdit, href: "/my-profile" },
                            { name: "Dashboard", icon: MdDashboard, href: "/dashboard" },
                            { name: "Watch Later", icon: FaHourglassStart, href: "/watch-later" },
                            { name: "My Playlists", icon: MdPlaylistPlay, href: "/my-playlists" },
                            { name: "History", icon: FaHistory, href: "/history" },
                            { name: "Subscriptions", icon: MdSubscriptions, href: "/subscriptions" },
                          ].map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              >
                                <item.icon className="mr-3 text-lg opacity-70" />
                                <span>{item.name}</span>
                              </Link>
                            </li>
                          ))}
                          <li className="border-t border-gray-100 dark:border-slate-700 mt-2 pt-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-400/10 transition-colors"
                            >
                              <MdLogout className="mr-3 text-lg opacity-80" />
                              <span>Logout</span>
                            </button>
                          </li>
                        </div>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium px-2 py-2 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
            <SearchAutocomplete 
              className="mb-6"
              inputClassName="w-full bg-gray-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-full py-3 pl-4 pr-12 focus:outline-none transition-all text-gray-800 dark:text-gray-100 placeholder-gray-500" 
            />
            
            <div className="flex flex-col space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="flex justify-between items-center p-3 mb-2 bg-indigo-50 dark:bg-slate-800 rounded-xl">
                    <span className="font-semibold text-indigo-900 dark:text-indigo-100">
                      Welcome, {user.name}!
                    </span>
                    <NotificationsPanel />
                  </div>
                  {[
                    { name: "Explore", href: "/explore" },
                    { name: "Shorts", href: "/shorts" },
                    { name: "Dashboard", href: "/dashboard" },
                    { name: "My Playlists", href: "/my-playlists" },
                    { name: "Subscriptions", href: "/subscriptions" },
                    { name: "Upload Video", href: "/upload" }
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="text-left px-4 py-3 text-rose-600 dark:text-rose-400 font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-400/10 mt-4 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center items-center py-3 text-gray-700 dark:text-gray-300 font-bold rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex justify-center items-center py-3 text-white font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;