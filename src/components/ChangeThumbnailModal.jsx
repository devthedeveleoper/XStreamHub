"use client";

import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import API from "@/lib/api";

const ChangeThumbnailModal = ({ video, onSave, onCancel }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a new thumbnail image.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("thumbnailFile", file);

    try {
      const response = await API.post(
        `/videos/${video._id}/update-thumbnail`,
        formData
      );
      onSave(video._id, response.data.thumbnailUrl);
      toast.success("Thumbnail updated successfully!");
    } catch (error) {
      toast.error("Failed to update thumbnail.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Change Thumbnail</h2>
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 dark:hover:file:bg-indigo-900/50 transition-all cursor-pointer"
          />
          {previewUrl && (
            <div className="mt-4 border border-gray-200 dark:border-slate-700 rounded-xl p-2 bg-gray-50 dark:bg-slate-800">
              <img
                src={previewUrl}
                alt="New thumbnail preview"
                className="w-full h-auto rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-3 mt-8">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUploading}
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {isUploading ? "Uploading..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeThumbnailModal;
