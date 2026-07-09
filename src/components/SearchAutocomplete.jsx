"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaUserCircle, FaSearch } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useAppStore } from "@/store/useAppStore";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";

const SearchAutocomplete = ({ className, inputClassName }) => {
  const router = useRouter();
  const setMobileMenuOpen = useAppStore((state) => state.setMobileMenuOpen);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  
  const [results, setResults] = useState({ videos: [], users: [] });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults({ videos: [], users: [] });
        setIsDropdownOpen(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        setResults(data);
        if (data.videos.length > 0 || data.users.length > 0) {
          setIsDropdownOpen(true);
        } else {
          setIsDropdownOpen(false);
        }
      } catch (error) {
        console.error("Failed to fetch autocomplete", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim() !== "") {
      router.push(`/search?q=${searchQuery.trim()}`);
      setMobileMenuOpen(false);
      setIsDropdownOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setIsDropdownOpen(false);
    setResults({ videos: [], users: [] });
  };

  const navigateAndClose = (path) => {
    router.push(path);
    setIsDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      <input
        type="text"
        className={inputClassName}
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (results.videos.length > 0 || results.users.length > 0) {
            setIsDropdownOpen(true);
          }
        }}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        {searchQuery && (
          <button
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <MdClose size={18} />
          </button>
        )}
        <button
          onClick={handleSearchSubmit}
          className="p-2 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
        >
          <FaSearch size={16} />
        </button>
      </div>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50"
          >
            {isLoading && (
              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Searching...
              </div>
            )}
            
            {!isLoading && results.users.length > 0 && (
              <div className="border-b border-gray-100 dark:border-slate-700">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/50">
                  Channels
                </div>
                {results.users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => navigateAndClose(`/profile/${user.username}`)}
                    className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="rounded-full object-cover mr-3"
                      />
                    ) : (
                      <FaUserCircle size={32} className="text-gray-400 mr-3" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && results.videos.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-800/50">
                  Videos
                </div>
                {results.videos.map((video) => (
                  <div
                    key={video._id}
                    onClick={() => navigateAndClose(`/video/${video._id}`)}
                    className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="w-16 h-9 relative rounded overflow-hidden mr-3 flex-shrink-0 bg-gray-200 dark:bg-slate-700">
                      <Image
                        src={video.thumbnailUrl || '/placeholder-thumb.jpg'}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {video.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <div 
              className="px-4 py-3 text-sm text-center text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 cursor-pointer border-t border-gray-100 dark:border-slate-700 transition-colors"
              onClick={handleSearchSubmit}
            >
              See all results for "{searchQuery}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchAutocomplete;
