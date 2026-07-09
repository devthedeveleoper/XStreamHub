import { useState, useRef, useEffect } from 'react';
import API from '@/lib/api';
import axios from 'axios';
import { toast } from 'react-toastify';

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

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState("");
  const [eta, setEta] = useState("");
  
  const [isPolling, setIsPolling] = useState(false);
  const [remoteProgress, setRemoteProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const createFinalRecord = async (videoId, data, thumbnailFile) => {
    toast.info("Publishing video...");
    const finalFormData = new FormData();
    finalFormData.append("title", data.title);
    finalFormData.append("description", data.description);
    finalFormData.append("videoId", videoId);
    finalFormData.append("category", data.category);
    finalFormData.append("visibility", data.visibility);
    if (data.playlistId) {
      finalFormData.append("playlistId", data.playlistId);
    }
    const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    finalFormData.append("tags", JSON.stringify(tagsArray));

    if (thumbnailFile) {
      finalFormData.append("thumbnailFile", thumbnailFile);
    }
    
    await API.post("/videos/create-record", finalFormData);
    toast.success("Video published successfully!");
  };

  const uploadDirect = async (videoFile, thumbnailFile, data) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSpeed('');
    setEta('');

    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
    const totalChunks = Math.ceil(videoFile.size / CHUNK_SIZE);
    const uploadId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const startTime = Date.now();
    let uploadedBytes = 0;

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, videoFile.size);
        const chunk = videoFile.slice(start, end);

        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("uploadId", uploadId);
        formData.append("chunkIndex", chunkIndex);
        formData.append("totalChunks", totalChunks);
        formData.append("fileName", videoFile.name);

        let attempt = 0;
        let success = false;
        let response;

        while (attempt < 3 && !success) {
          try {
            response = await API.post("/videos/upload-chunk", formData, {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (progressEvent) => {
                const currentChunkLoaded = progressEvent.loaded;
                const totalLoaded = uploadedBytes + currentChunkLoaded;
                const percent = Math.floor((totalLoaded * 100) / videoFile.size);
                
                // Prevent progress from dropping back when a new chunk starts
                setUploadProgress((prev) => Math.max(prev, percent));

                const elapsedTime = (Date.now() - startTime) / 1000;
                if (elapsedTime > 0) {
                  const bytesPerSecond = totalLoaded / elapsedTime;
                  const remainingBytes = videoFile.size - totalLoaded;
                  const remainingSeconds = remainingBytes / bytesPerSecond;
                  setUploadSpeed(`${formatBytes(bytesPerSecond)}/s`);
                  setEta(`${formatTime(remainingSeconds)} remaining`);
                }
              }
            });
            success = true;
            uploadedBytes += chunk.size;
          } catch (err) {
            attempt++;
            console.warn(`Chunk ${chunkIndex} failed (Attempt ${attempt}/3)`);
            if (attempt >= 3) {
              throw new Error(`Failed to upload chunk ${chunkIndex} after 3 attempts`);
            }
            await new Promise(r => setTimeout(r, 1000 * attempt)); // Exponential backoff
          }
        }

        if (response.data.completed) {
          const videoId = response.data.videoId;
          await createFinalRecord(videoId, data, thumbnailFile);
          return;
        }
      }
    } catch (error) {
      toast.error("Upload failed. Please try again.");
      console.error("Chunked upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const uploadRemote = async (videoUrl, thumbnailFile, data) => {
    setIsPolling(true);
    setRemoteProgress(0);
    setStatusMessage("Queuing remote upload...");
    try {
      const startResponse = await API.post("/videos/remote-upload/start", { videoUrl });
      const remoteId = startResponse.data.id;
      if (!remoteId) throw new Error("Failed to get remote upload ID from server.");
      setStatusMessage(`Upload queued. Polling status...`);
      let failedAttempts = 0;
      const maxFailedAttempts = 5;
      pollingIntervalRef.current = setInterval(async () => {
        try {
            const statusResponse = await API.get(`/videos/remote-upload/status`, { params: { id: remoteId } });
            failedAttempts = 0;
            const statusData = statusResponse.data[remoteId];
            if (statusData && statusData.status === "finished") {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                setRemoteProgress(100);
                setIsPolling(false);
                const videoId = statusData.linkid;
                toast.success("Remote download finished! Publishing video...");
                await createFinalRecord(videoId, data, thumbnailFile);
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
      }, 5000);
    } catch (error) {
      toast.error("Remote upload failed. Please check the URL and try again.");
      console.error("Remote upload initiation failed:", error);
      setIsPolling(false);
    }
  };

  return {
    isUploading,
    uploadProgress,
    uploadSpeed,
    eta,
    isPolling,
    remoteProgress,
    statusMessage,
    uploadDirect,
    uploadRemote
  };
};
