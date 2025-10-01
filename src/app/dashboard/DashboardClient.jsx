"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import API from "@/lib/api";
import AnalyticsChart from "@/components/AnalyticsChart";
import { useDebounce } from "@/hooks/useDebounce";
import VideoThumbnail from "@/components/VideoThumbnail";
import EditVideoModal from "@/components/EditVideoModal";
import ChangeThumbnailModal from "@/components/ChangeThumbnailModal";
import { toast } from "react-toastify";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { IoMdLink, IoIosLock, IoIosGlobe } from "react-icons/io";

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
      icon: <IoIosGlobe className="text-green-600" />,
      label: "Public",
    },
    unlisted: {
      icon: <IoMdLink className="text-yellow-600" />,
      label: "Unlisted",
    },
    private: { icon: <IoIosLock className="text-red-600" />, label: "Private" },
  };

  const selectedOption = options[video.visibility] || options.public;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm rounded-md border border-gray-300 px-3 py-1 bg-white hover:bg-gray-50 w-full justify-between"
      >
        <div className="flex items-center">
          {selectedOption.icon}
          <span className="ml-2">{selectedOption.label}</span>
        </div>
        <svg
          className="h-4 w-4 text-gray-400"
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
        <div className="absolute left-0 mt-2 w-full bg-white rounded-md shadow-lg border z-10">
          {Object.entries(options).map(([key, { icon, label }]) => (
            <button
              key={key}
              onClick={() => {
                onVisibilityChange(video._id, key);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              {icon} <span className="ml-2">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DashboardClient = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [editingVideo, setEditingVideo] = useState(null);
  const [changingThumbnailVideo, setChangingThumbnailVideo] = useState(null);

  const { data: session, status } = useSession();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          const params = {};
          if (debouncedSearchTerm) {
            params.q = debouncedSearchTerm;
          }
          const response = await API.get("/creator/dashboard", { params });
          setVideos(response.data);
        } catch (error) {
          toast.error("Could not load dashboard data.");
        } finally {
          setLoading(false);
        }
      };
      fetchDashboardData();
    }
  }, [status, router, debouncedSearchTerm]);

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
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await API.delete(`/videos/${videoId}`);
        setVideos((prev) => prev.filter((v) => v._id !== videoId));
        toast.success("Video deleted successfully!");
      } catch (err) {
        toast.error("Failed to delete video.");
      }
    }
  };

  const handleSaveEdits = async (data) => {
    try {
      const response = await API.put(`/videos/${editingVideo._id}`, data);
      setVideos((prev) =>
        prev.map((v) => (v._id === editingVideo._id ? response.data : v))
      );
      setEditingVideo(null);
      toast.success("Video updated successfully!");
    } catch (err) {
      toast.error("Failed to update video.");
    }
  };

  const handleVisibilityChange = async (videoId, newVisibility) => {
    try {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, visibility: newVisibility } : v
        )
      );
      await API.put(`/videos/${videoId}`, { visibility: newVisibility });
      toast.success("Visibility updated!");
    } catch (err) {
      toast.error("Failed to update visibility.");
    }
  };

  const handleThumbnailSave = (videoId, newThumbnailUrl) => {
    setVideos((prev) =>
      prev.map((v) =>
        v._id === videoId ? { ...v, thumbnailUrl: newThumbnailUrl } : v
      )
    );
    setChangingThumbnailVideo(null);
  };

  if (status === "loading" || loading) {
    return (
      <main className="container mx-auto px-6 py-8 animate-pulse">
        <div className="h-10 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-80 bg-gray-300 rounded"></div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-40 bg-gray-300 rounded"></div>
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

      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Creator Dashboard
        </h1>

        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold">Analytics Overview</h2>
            <div className="relative w-full sm:w-1/3">
              <input
                type="text"
                placeholder="Search to filter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
            </div>
          </div>

          {videos.length > 0 ? (
            <AnalyticsChart videos={videos} />
          ) : (
            <div className="text-center text-gray-400 p-8">
              {searchTerm
                ? "No videos found matching your search."
                : "No data to display."}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-semibold">Your Videos</h2>
            <div className="relative w-full sm:w-1/3">
              <input
                type="text"
                placeholder="Search your videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 ...">Thumbnail</th>
                  <th className="px-6 py-3 ...">Video Title</th>
                  <th className="px-6 py-3 ...">Visibility</th>
                  <th className="px-6 py-3 ...">Views</th>
                  <th className="px-6 py-3 ...">Likes</th>
                  <th className="px-6 py-3 ...">Comments</th>
                  <th className="px-6 py-3 ...">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {videos.length > 0 ? (
                  videos.map((video) => (
                    <tr key={video._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative w-24 h-14 group">
                          <VideoThumbnail
                            videoId={video._id}
                            altText={video.title}
                          />
                          <button
                            onClick={() => setChangingThumbnailVideo(video)}
                            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                          >
                            <MdOutlineAddPhotoAlternate />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/video/${video._id}`}>{video.title}</Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <VisibilityDropdown
                          video={video}
                          onVisibilityChange={handleVisibilityChange}
                        />
                      </td>
                      <td className="px-6 py-4 ...">{video.views}</td>
                      <td className="px-6 py-4 ...">{video.likesCount}</td>
                      <td className="px-6 py-4 ...">{video.commentCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => setEditingVideo(video)}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(video._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "No videos found..."
                        : "You haven't uploaded any videos yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
};

export default DashboardClient;
