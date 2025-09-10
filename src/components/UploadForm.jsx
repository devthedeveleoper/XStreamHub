"use client";

import React, { useState, useRef, useEffect } from "react";
import API from "@/lib/api";
import axios from 'axios';
import { toast } from 'react-toastify';
import CATEGORIES from "@/constants/categories";


const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatTime = (seconds) => {
    if (seconds === Infinity || isNaN(seconds) || seconds < 0) return '...';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v, i) => v !== "00" || i > 0)
        .join(":");
};

const UploadForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [tags, setTags] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const thumbnailRef = useRef(null);
  const videoFileRef = useRef(null);
  
  const [uploadType, setUploadType] = useState("direct");
  const [statusMessage, setStatusMessage] = useState("");
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState("");
  const [eta, setEta] = useState("");

  const [isPolling, setIsPolling] = useState(false);
  const [remoteProgress, setRemoteProgress] = useState(0);
  const pollingIntervalRef = useRef(null);

  const createFinalRecord = async (videoId) => {
    toast.info("Publishing video...");
    const finalFormData = new FormData();
    finalFormData.append("title", title);
    finalFormData.append("description", description);
    finalFormData.append("videoId", videoId);
    finalFormData.append("category", category);
    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    finalFormData.append("tags", JSON.stringify(tagsArray));

    const thumbnailFile = thumbnailRef.current?.files?.[0];
    if (thumbnailFile) {
      finalFormData.append("thumbnailFile", thumbnailFile);
    }
    
    await API.post("/videos/create-record", finalFormData);
    toast.success("Video published successfully!");
  };

  const handleDirectUpload = async (e) => {
    e.preventDefault();
    const videoFile = videoFileRef.current?.files?.[0];

    if (!videoFile || !title) {
      toast.error("Please provide a title and a video file.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSpeed('');
    setEta('');
    setStatusMessage("");
    const startTime = Date.now();

    try {
      const { data: { url: uploadUrl } } = await API.get("/videos/get-upload-url");
      
      const videoFormData = new FormData();
      videoFormData.append("file", videoFile);

      const response = await axios.post(uploadUrl, videoFormData, {
        onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            if (total) {
                const percent = Math.floor((loaded * 100) / total);
                setUploadProgress(percent);
                const elapsedTime = (Date.now() - startTime) / 1000;
                const bytesPerSecond = loaded / elapsedTime;
                const remainingBytes = total - loaded;
                const remainingSeconds = remainingBytes / bytesPerSecond;
                setUploadSpeed(`${formatBytes(bytesPerSecond)}/s`);
                setEta(`${formatTime(remainingSeconds)} remaining`);
            }
        },
      });

      const uploadResult = response.data;
      if (uploadResult.status !== 200) {
        throw new Error(uploadResult.msg || "Video upload failed");
      }
      
      const videoId = uploadResult.result.id;
      await createFinalRecord(videoId);
      
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoteUpload = async (e) => {
    e.preventDefault();
    if (!videoUrl || !title) {
      toast.error("Please provide a video URL and a title.");
      return;
    }

    setIsPolling(true);
    setRemoteProgress(0);
    setStatusMessage("Queuing remote upload...");

    try {
      const startResponse = await API.post("/videos/remote-upload/start", { videoUrl });
      const remoteId = startResponse.data.id;

      if (!remoteId) {
        throw new Error("Failed to get remote upload ID from server.");
      }

      setStatusMessage(`Upload queued. Polling status...`);

      let failedAttempts = 0;
      const maxFailedAttempts = 100;

      pollingIntervalRef.current = setInterval(async () => {
        try {
            const statusResponse = await API.get(`/videos/remote-upload/status`, {
                params: { id: remoteId }
            });

            failedAttempts = 0;
            const statusData = statusResponse.data[remoteId];

            if (statusData && statusData.status === "finished") {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                setRemoteProgress(100);
                setIsPolling(false);
                const videoId = statusData.linkid;
                toast.success("Remote download finished! Publishing video...");
                await createFinalRecord(videoId);

            } else if (statusData && statusData.status === "error") {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                setIsPolling(false);
                toast.error(`Error during remote upload: ${statusData.error_message || 'Unknown error'}`);
            } else if (statusData) {
                const loaded = statusData.bytes_loaded || 0;
                const total = statusData.bytes_total || 0;
                const percentage = total > 0 ? Math.floor((loaded * 100) / total) : 0;
                setRemoteProgress(percentage);
                setStatusMessage(`Downloading: ${formatBytes(loaded)} / ${formatBytes(total)}`);
            }
        } catch (statusError) {
             failedAttempts++;
             console.log(`Status check attempt ${failedAttempts} failed. Retrying...`);
             setStatusMessage(`Waiting for upload to initialize... (Attempt ${failedAttempts})`);

             if (failedAttempts >= maxFailedAttempts) {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                setIsPolling(false);
                toast.error("Could not get upload status after multiple attempts.");
                console.error("Status check failed:", statusError);
             }
        }
      }, 30000);

    } catch (error) {
      toast.error("Remote upload failed. Please check the URL and try again.");
      console.error("Remote upload initiation failed:", error);
      setIsPolling(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);


  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Upload a New Video 🎬
        </h2>
        
        <div className="flex justify-center mb-6 rounded-lg p-1 bg-gray-200">
            <button
                onClick={() => setUploadType("direct")}
                disabled={isPolling || isUploading}
                className={`w-1/2 p-2 rounded-md font-semibold transition-colors duration-300 ${uploadType === "direct" ? "bg-blue-600 text-white" : "hover:bg-gray-300"} disabled:opacity-50`}
            >
                Direct Upload
            </button>
            <button
                onClick={() => setUploadType("remote")}
                disabled={isPolling || isUploading}
                className={`w-1/2 p-2 rounded-md font-semibold transition-colors duration-300 ${uploadType === "remote" ? "bg-blue-600 text-white" : "hover:bg-gray-300"} disabled:opacity-50`}
            >
                Remote URL
            </button>
        </div>

        <form onSubmit={uploadType === "direct" ? handleDirectUpload : handleRemoteUpload} className="space-y-6">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input id="title" type="text" placeholder="My Awesome Video" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
            </div>

            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input 
                    id="tags" 
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., gaming, react, tutorial"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with a comma.</p>
            </div>

            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                    id="category" 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="description" placeholder="A short description of your video..." value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"/>
            </div>

            <div>
                <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">Custom Thumbnail <span className="text-xs text-gray-500">(Optional)</span></label>
                <input 
                    id="thumbnail" 
                    type="file" 
                    ref={thumbnailRef}
                    accept="image/*" 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {uploadType === 'direct' ? (
                <div>
                    <label htmlFor="videoFile" className="block text-sm font-medium text-gray-700 mb-1">Video File</label>
                    <input 
                        id="videoFile" 
                        type="file"
                        ref={videoFileRef}
                        accept="video/*" 
                        required 
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
            ) : (
                <div>
                    <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                    <input id="videoUrl" type="url" placeholder="http://example.com/video.mp4" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
                </div>
            )}
            
            {isUploading && (
                <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-gray-600">
                        <span>{uploadProgress}%</span>
                        <span>{uploadSpeed}</span>
                        <span>{eta}</span>
                    </div>
                </div>
            )}

            {isPolling && (
                <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${remoteProgress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-gray-600">
                        <span>{remoteProgress}%</span>
                        <span className="truncate">{statusMessage}</span>
                    </div>
                </div>
            )}

            <button type="submit" disabled={isPolling || isUploading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                {isUploading ? `Uploading... (${uploadProgress}%)` : isPolling ? "Processing..." : "Upload Video"}
            </button>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;