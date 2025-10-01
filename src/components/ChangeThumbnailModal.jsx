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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Change Thumbnail</h2>
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-50"
          />
          {previewUrl && (
            <div className="mt-4 border rounded-md p-2">
              <img
                src={previewUrl}
                alt="New thumbnail preview"
                className="w-full h-auto rounded-md"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
          >
            {isUploading ? "Uploading..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeThumbnailModal;
