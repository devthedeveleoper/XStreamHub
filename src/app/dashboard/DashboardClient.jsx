"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import API from "@/lib/api";
import AnalyticsChart from "@/components/AnalyticsChart";
import CreatorStatCards from "@/components/CreatorStatCards";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import { useDebounce } from "@/hooks/useDebounce";
import VideoThumbnail from "@/components/VideoThumbnail";
import EditVideoModal from "@/components/EditVideoModal";
import ChangeThumbnailModal from "@/components/ChangeThumbnailModal";
import { toast } from "react-toastify";
import { MdOutlineAddPhotoAlternate, MdInsights, MdVideoLibrary } from "react-icons/md";
import { IoMdLink, IoIosLock, IoIosGlobe } from "react-icons/io";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

const VisibilityDropdown = ({ video, onVisibilityChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = {
    public: {
      icon: <IoIosGlobe className="text-emerald-600 dark:text-emerald-400" />,
      label: "Public",
    },
    unlisted: {
      icon: <IoMdLink className="text-amber-600 dark:text-amber-400" />,
      label: "Unlisted",
    },
    private: { icon: <IoIosLock className="text-rose-600 dark:text-rose-400" />, label: "Private" },
  };

  const selectedOption = options[video.visibility] || options.public;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/80 text-gray-700 dark:text-gray-300 w-full justify-between transition-all shadow-sm"
      >
        <div className="flex items-center font-medium">
          {selectedOption.icon}
          <span className="ml-2">{selectedOption.label}</span>
        </div>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {Object.entries(options).map(([key, { icon, label }]) => (
            <button
              key={key}
              onClick={() => {
                onVisibilityChange(video._id, key);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 flex items-center transition-colors"
            >
              {icon} <span className="ml-2 font-medium">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DashboardClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState("analytics"); // 'analytics' | 'content'
  const [editingVideo, setEditingVideo] = useState(null);
  const [changingThumbnailVideo, setChangingThumbnailVideo] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: session, status } = useSession();

  const { data: videos, error, mutate, isLoading } = useSWR(
    status === "authenticated" 
      ? `/creator/dashboard${debouncedSearchTerm ? `?q=${encodeURIComponent(debouncedSearchTerm)}` : ""}` 
      : null,
    fetcher
  );

  const { data: analytics, error: analyticsError, isLoading: analyticsLoading } = useSWR(
    status === "authenticated" ? `/creator/analytics` : null,
    fetcher
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    router.replace(`/dashboard?${params.toString()}`);
  }, [searchTerm, router]);

  const handleClearSearch = () => setSearchTerm("");

  const handleDelete = async (videoId) => {
    if (window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      try {
        await API.delete(`/videos/${videoId}`);
        mutate(videos.filter((v) => v._id !== videoId), false);
        toast.success("Video deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete video.");
      }
    }
  };

  const handleSaveEdits = async (data) => {
    try {
      const response = await API.put(`/videos/${editingVideo._id}`, data);
      mutate(videos.map((v) => (v._id === editingVideo._id ? response.data : v)), false);
      setEditingVideo(null);
      toast.success("Video updated successfully!");
    } catch (err) {
      toast.error("Failed to update video.");
    }
  };

  const handleVisibilityChange = async (videoId, newVisibility) => {
    try {
      mutate(
        videos.map((v) =>
          v._id === videoId ? { ...v, visibility: newVisibility } : v
        ),
        false
      );
      await API.put(`/videos/${videoId}`, { visibility: newVisibility });
      toast.success("Visibility updated!");
    } catch (err) {
      toast.error("Failed to update visibility.");
    }
  };

  const handleThumbnailSave = (videoId, newThumbnailUrl) => {
    mutate(
      videos.map((v) =>
        v._id === videoId ? { ...v, thumbnailUrl: newThumbnailUrl } : v
      ),
      false
    );
    setChangingThumbnailVideo(null);
  };

  if (status === "loading" || isLoading || analyticsLoading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl animate-pulse">
        <div className="flex gap-8">
          <div className="w-64 hidden md:block">
             <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded w-full mb-4"></div>
             <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
          </div>
          <div className="flex-1">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>)}
             </div>
             <div className="h-80 bg-gray-200 dark:bg-slate-800 rounded-2xl mb-8"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          onSave={handleSaveEdits}
          onCancel={() => setEditingVideo(null)}
        />
      )}
      {changingThumbnailVideo && (
        <ChangeThumbnailModal
          video={changingThumbnailVideo}
          onSave={handleThumbnailSave}
          onCancel={() => setChangingThumbnailVideo(null)}
        />
      )}

      <main className="container mx-auto px-4 sm:px-6 py-10 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="w-full md:w-64 flex-shrink-0">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display tracking-tight mb-8">
              Creator Studio
            </h1>
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === "analytics" 
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" 
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
                }`}
              >
                <MdInsights size={20} />
                Analytics Overview
              </button>
              <button
                onClick={() => setActiveTab("content")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === "content" 
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" 
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-800"
                }`}
              >
                <MdVideoLibrary size={20} />
                Content Manager
              </button>
            </nav>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-grow min-w-0">
            
            {/* TAB: ANALYTICS OVERVIEW */}
            {activeTab === "analytics" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {analyticsError ? (
                  <div className="text-center text-rose-500 dark:text-rose-400 p-8 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    Failed to load analytics data.
                  </div>
                ) : analytics ? (
                  <>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display tracking-tight mb-6">Lifetime Statistics</h2>
                      <CreatorStatCards stats={analytics.lifetimeStats} />
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display tracking-tight mb-6">30-Day Channel Growth</h3>
                      <TimeSeriesChart timeSeries={analytics.timeSeries} />
                    </div>
                    
                    {videos && videos.length > 0 && (
                      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white font-display tracking-tight mb-6">Video Performance Comparison</h3>
                        <AnalyticsChart videos={videos} />
                      </div>
                    )}
                  </>
                ) : null}
              </motion.div>
            )}

            {/* TAB: CONTENT MANAGER */}
            {activeTab === "content" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col transition-colors">
                  
                  {/* Content Header & Search */}
                  <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display tracking-tight">Channel Content</h2>
                    <div className="relative w-full sm:w-72">
                      <input
                        type="text"
                        placeholder="Search your videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                      {searchTerm && (
                        <button
                          onClick={handleClearSearch}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-slate-800">
                      <thead className="bg-gray-50/50 dark:bg-slate-800/30">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-display">Thumbnail</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-display">Video</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-display">Visibility</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-display">Views</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-display">Engagement</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider font-display">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-50 dark:divide-slate-800/50">
                        {error ? (
                           <tr><td colSpan="6" className="p-8 text-center text-rose-500">Failed to load content.</td></tr>
                        ) : videos && videos.length > 0 ? (
                          videos.map((video) => (
                            <tr key={video._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="relative w-32 aspect-video rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                  <VideoThumbnail
                                    videoId={video._id}
                                    altText={video.title}
                                  />
                                  <button
                                    onClick={() => setChangingThumbnailVideo(video)}
                                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"
                                  >
                                    <MdOutlineAddPhotoAlternate size={24} className="mb-1" />
                                    <span className="text-xs">Change</span>
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="max-w-[200px] truncate">
                                    <Link href={`/video/${video._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-base font-display">
                                        {video.title}
                                    </Link>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Uploaded {new Date(video.createdAt).toLocaleDateString()}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-36">
                                    <VisibilityDropdown
                                        video={video}
                                        onVisibilityChange={handleVisibilityChange}
                                    />
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-gray-700 dark:text-gray-300 font-medium">{video.views.toLocaleString()}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex flex-col gap-1">
                                      <span className="text-sm text-gray-600 dark:text-gray-400"><strong className="text-gray-900 dark:text-gray-200">{video.likesCount}</strong> likes</span>
                                      <span className="text-sm text-gray-600 dark:text-gray-400"><strong className="text-gray-900 dark:text-gray-200">{video.commentCount}</strong> comments</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex flex-col space-y-2">
                                  <button onClick={() => setEditingVideo(video)} className="text-left text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors font-semibold">
                                    Edit Details
                                  </button>
                                  <button onClick={() => handleDelete(video._id)} className="text-left text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 transition-colors font-semibold">
                                    Delete Video
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="px-6 py-16 text-center text-gray-500 dark:text-gray-400"
                            >
                              <div className="flex flex-col items-center justify-center">
                                  <MdVideoLibrary size={48} className="text-gray-300 dark:text-slate-700 mb-4" />
                                  <p className="text-lg font-medium text-gray-900 dark:text-gray-300">
                                    {searchTerm ? "No videos match your search." : "You haven't uploaded any videos yet."}
                                  </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
            
          </div>
        </div>
      </main>
    </>
  );
};

export default DashboardClient;
