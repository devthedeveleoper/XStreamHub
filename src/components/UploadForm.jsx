"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import API from "@/lib/api";
import CATEGORIES from "@/constants/categories";
import { useVideoUpload } from "@/hooks/useVideoUpload";
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  category: yup.string().required("Category is required"),
  tags: yup.string(),
  visibility: yup.string().required("Visibility is required"),
  playlistId: yup.string(),
  videoUrl: yup.string().url("Must be a valid URL").when("$uploadType", {
    is: "remote",
    then: (schema) => schema.required("Video URL is required for remote upload"),
  }),
  isShort: yup.boolean(),
});

const UploadForm = () => {
  const [uploadType, setUploadType] = useState("direct");
  const [playlists, setPlaylists] = useState([]);
  
  const {
    isUploading, uploadProgress, uploadSpeed, eta,
    isPolling, remoteProgress, statusMessage,
    uploadDirect, uploadRemote
  } = useVideoUpload();

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "Other",
      tags: "",
      visibility: "public",
      playlistId: "",
      videoUrl: "",
      isShort: false
    },
    context: { uploadType }
  });

  const thumbnailFileList = watch("thumbnail");
  const videoFileList = watch("videoFile");

  useEffect(() => {
    const fetchPlaylists = async () => {
        try {
            const response = await API.get('/playlists/my-playlists');
            setPlaylists(response.data);
        } catch (error) {
            console.error("Could not fetch playlists", error);
        }
    };
    fetchPlaylists();
  }, []);

  const onSubmit = async (data) => {
    const thumbnailFile = thumbnailFileList?.[0];
    
    if (uploadType === "direct") {
      const videoFile = videoFileList?.[0];
      if (!videoFile) {
        toast.error("Please select a video file.");
        return;
      }
      await uploadDirect(videoFile, thumbnailFile, data);
    } else {
      if (!data.videoUrl) {
        toast.error("Please provide a video URL.");
        return;
      }
      await uploadRemote(data.videoUrl, thumbnailFile, data);
    }
  };

  const isBusy = isUploading || isPolling;

  return (
    <div className="bg-gray-50 dark:bg-slate-900 flex items-center justify-center min-h-screen py-12 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 dark:border-slate-700 transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white tracking-tight">
          Upload a New Video 🎬
        </h2>
        
        <div className="flex justify-center mb-6 rounded-xl p-1 bg-gray-100 dark:bg-slate-900 shadow-inner">
            <button
                type="button"
                onClick={() => setUploadType("direct")}
                disabled={isBusy}
                className={`w-1/2 p-2 rounded-lg font-semibold transition-all duration-300 ${uploadType === "direct" ? "bg-indigo-600 text-white shadow-md transform hover:-translate-y-0.5" : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"} disabled:opacity-50`}
            >
                Direct Upload
            </button>
            <button
                type="button"
                onClick={() => setUploadType("remote")}
                disabled={isBusy}
                className={`w-1/2 p-2 rounded-lg font-semibold transition-all duration-300 ${uploadType === "remote" ? "bg-indigo-600 text-white shadow-md transform hover:-translate-y-0.5" : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"} disabled:opacity-50`}
            >
                Remote URL
            </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input {...register("title")} type="text" placeholder="My Awesome Video" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-all"/>
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                <input {...register("tags")} type="text" placeholder="e.g., gaming, react, tutorial" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-all" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate tags with a comma.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea {...register("description")} placeholder="A short description of your video..." className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white h-24 resize-none transition-all"/>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Thumbnail <span className="text-xs text-gray-500 dark:text-gray-400">(Optional)</span></label>
                <input {...register("thumbnail")} type="file" accept="image/*" className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 dark:hover:file:bg-indigo-900/50 transition-all cursor-pointer" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select {...register("category")} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer">
                        {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add to Playlist (Optional)</label>
                    <select {...register("playlistId")} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer">
                        <option value="">None</option>
                        {playlists.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visibility</label>
                    <select {...register("visibility")} className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer">
                        <option value="public">Public</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="private">Private</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-indigo-50 dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-slate-700">
                <input 
                  type="checkbox" 
                  id="isShort" 
                  {...register("isShort")} 
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 dark:bg-slate-900 border-gray-300 dark:border-slate-600"
                />
                <label htmlFor="isShort" className="text-sm font-bold text-gray-800 dark:text-gray-200 cursor-pointer">
                  Upload as a Short (Vertical Video)
                  <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                    This will display the video in the dedicated Shorts feed.
                  </span>
                </label>
            </div>

            {uploadType === 'direct' ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video File</label>
                    <input {...register("videoFile")} type="file" accept="video/*" className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 dark:hover:file:bg-indigo-900/50 transition-all cursor-pointer" />
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video URL</label>
                    <input {...register("videoUrl")} type="url" placeholder="http://example.com/video.mp4" className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-all"/>
                    {errors.videoUrl && <p className="text-red-500 text-xs mt-1">{errors.videoUrl.message}</p>}
                </div>
            )}
            
            {isUploading && (
                <div className="space-y-2 animate-in fade-in duration-300">
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-150 relative">
                           <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                        <span>{uploadProgress}%</span>
                        <span>{uploadSpeed}</span>
                        <span>{eta}</span>
                    </div>
                </div>
            )}

            {isPolling && (
                <div className="space-y-2 animate-in fade-in duration-300">
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300 relative" style={{ width: `${remoteProgress}%` }}>
                           <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-400">
                        <span>{remoteProgress}%</span>
                        <span className="truncate">{statusMessage}</span>
                    </div>
                </div>
            )}

            <button type="submit" disabled={isBusy} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                {isUploading ? `Uploading... (${uploadProgress}%)` : isPolling ? "Processing..." : "Upload Video"}
            </button>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;