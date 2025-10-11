"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from 'next/image';
import NotificationsPanel from "./NotificationsPanel";
import { FaUserCircle, FaUserEdit } from "react-icons/fa";
import { MdDashboard, MdSubscriptions, MdPlaylistPlay, MdLogout } from "react-icons/md";

const Navbar = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  console.log(session);

  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  const handleSearchSubmit = () => {
    if (searchTerm.trim() !== "") {
      router.push(`/search?q=${searchTerm.trim()}`);
      setSearchTerm("");
      setIsMenuOpen(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-blue-600 hover:text-blue-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Aurahub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative w-72 lg:w-96">
              <input
                type="text"
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-full py-2 pl-4 pr-20 focus:outline-none focus:border-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="px-3 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleSearchSubmit}
                  className="px-3 text-gray-400 hover:text-blue-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {isAuthenticated ? (
              <>
                <Link
                  href="/upload"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold whitespace-nowrap"
                >
                  Upload
                </Link>
                <NotificationsPanel />
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || "User avatar"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <FaUserCircle size={28} />
                    )}
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border overflow-hidden">
                      <ul>
                        <li className="px-4 py-3 border-b">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </li>
                        <li>
                          <Link
                            href="/my-profile"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <span>My Profile</span>
                            <FaUserEdit />
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <span>Dashboard</span>
                            <MdDashboard />
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/my-playlists"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <span>My Playlists</span>
                            <MdPlaylistPlay />
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/subscriptions"
                            onClick={() => setIsProfileMenuOpen(false)}
                            className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <span>Subscriptions</span>
                            <MdSubscriptions />
                          </Link>
                        </li>
                        <li className="border-t">
                          <button
                            onClick={handleLogout}
                            className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <span>Logout</span>
                            <MdLogout />
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-800 hover:text-blue-600 font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <div className="relative mb-4">
              <input
                type="text"
                className="w-full bg-gray-100 border-2 border-gray-200 rounded-full py-2 pl-4 pr-20 focus:outline-none focus:border-blue-500"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="px-3 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleSearchSubmit}
                  className="px-3 text-gray-400 hover:text-blue-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex flex-col items-start space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="w-full flex justify-between items-center py-2 px-2">
                    <span className="font-medium text-gray-700">
                      Welcome, {user.name}!
                    </span>
                    <NotificationsPanel />
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-left py-2 px-2 text-gray-800 font-semibold rounded-md hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/my-playlists"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-left py-2 px-2 text-gray-800 font-semibold rounded-md hover:bg-gray-100"
                  >
                    My Playlists
                  </Link>
                  <Link
                    href="/subscriptions"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-left py-2 px-2 text-gray-800 font-semibold rounded-md hover:bg-gray-100"
                  >
                    Subscriptions
                  </Link>
                  <Link
                    href="/upload"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-left py-2 px-2 text-gray-800 font-semibold rounded-md hover:bg-gray-100"
                  >
                    Upload
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 px-2 text-red-600 font-semibold rounded-md hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-left py-2 px-2 text-gray-800 font-semibold rounded-md hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-left py-2 px-2 text-gray-800 font-semibold rounded-md hover:bg-gray-100"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;