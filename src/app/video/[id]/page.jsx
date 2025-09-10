"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import API from "@/lib/api";
import { useThrottle } from "@/hooks/useThrottle";
import { toast } from 'react-toastify';
import { FcLike } from "react-icons/fc";
import SuggestedVideoCard from "@/components/SuggestedVideoCard";
import EditVideoModal from "@/components/EditVideoModal";
import VideoPlayerSkeleton from "@/components/VideoPlayerSkeleton";
import Comment from "@/components/Comment";
import SaveToPlaylistModal from "@/components/SaveToPlaylistModal";
import { useInView } from 'react-intersection-observer';

const VideoPlayerPage = () => {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [suggestionPage, setSuggestionPage] = useState(1);
  const [hasMoreSuggestions, setHasMoreSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const { ref, inView } = useInView({ threshold: 0.5 });

  const fetchSuggestions = useCallback(async (currentPage) => {
    setLoadingSuggestions(true);
    try {
        const response = await API.get('/videos/suggestions', {
            params: { page: currentPage, limit: 10, exclude: id }
        });
        setSuggestedVideos(prev => currentPage === 1 ? response.data.videos : [...prev, ...response.data.videos]);
        setHasMoreSuggestions(response.data.currentPage < response.data.totalPages);
    } catch (err) {
        console.error("Failed to fetch suggestions", err);
    } finally {
        setLoadingSuggestions(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError("");
        setSuggestionPage(1);
        setSuggestedVideos([]);

        const videoRes = await API.get(`/videos/${id}`);
        setVideo(videoRes.data);

        API.get(`/videos/${id}/comments`)
            .then(res => setComments(res.data))
            .catch(err => console.error("Failed to fetch comments:", err));
        
        fetchSuggestions(1);
        
        API.post(`/videos/${id}/view`).catch(err => console.error("Failed to count view:", err));

      } catch (err) {
        setError("Could not load video data. It may have been removed or the link is incorrect.");
        console.error("Error fetching main video data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    window.scrollTo(0, 0);
  }, [id, fetchSuggestions]);

  useEffect(() => {
    if (inView && hasMoreSuggestions && !loadingSuggestions) {
        const nextPage = suggestionPage + 1;
        setSuggestionPage(nextPage);
        fetchSuggestions(nextPage);
    }
  }, [inView, hasMoreSuggestions, loadingSuggestions, suggestionPage, fetchSuggestions]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.warn("Please log in to like a video.");
      return;
    }
    try {
      setVideo(prev => prev ? ({ ...prev, isLiked: !prev.isLiked, likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1 }) : null);
      await API.post(`/videos/${id}/like`);
    } catch (err) {
      toast.error("An error occurred while liking the video.");
      console.error("Like failed:", err);
      setVideo(prev => prev ? ({ ...prev, isLiked: !prev.isLiked, likesCount: prev.isLiked ? prev.likesCount + 1 : prev.likesCount - 1 }) : null);
    }
  };

  const throttledLikeHandler = useThrottle(handleLike, 2000);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await API.post(`/videos/${id}/comments`, { text: newComment });
      setComments([res.data, ...comments]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (err) {
      toast.error("Failed to post comment. Please try again.");
      console.error("Comment submission failed:", err);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
        try {
            await API.delete(`/videos/${id}`);
            toast.success('Video deleted successfully!');
            router.push('/');
        } catch (err) {
            toast.error('Failed to delete video.');
            console.error("Delete failed:", err);
        }
    }
  };

  const handleSaveEdits = async (data) => {
    try {
        const response = await API.put(`/videos/${id}`, data);
        setVideo(prev => prev ? ({ ...prev, title: response.data.title, description: response.data.description }) : null);
        setShowEditModal(false);
        toast.success('Video updated successfully!');
    } catch (err) {
        toast.error('Failed to update video.');
        console.error("Save edits failed:", err);
    }
  };

  const handleCommentDeleted = (deletedComment) => {
      setComments(prev => prev.filter(c => c._id !== deletedComment._id));
  };

  const handleCommentUpdated = (updatedComment) => {
      setComments(prev => prev.map(c => c._id === updatedComment._id ? updatedComment : c));
  };

  if (loading || status === 'loading') {
    return (
        <div className="bg-gray-50 min-h-screen">
            <VideoPlayerSkeleton />
        </div>
    );
  }

  if (error || !video) {
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="text-center p-10 text-red-500 font-semibold">{error || "Video not found."}</div>
        </div>
    );
  }

  return (
    <>
      {showEditModal && <EditVideoModal video={video} onSave={handleSaveEdits} onCancel={() => setShowEditModal(false)} />}
      {showSaveModal && <SaveToPlaylistModal videoId={id} onClose={() => setShowSaveModal(false)} />}
      
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="w-full h-[576px] rounded-lg overflow-hidden shadow-xl bg-black">
            <iframe
              src={`https://streamtape.com/e/${video.fileId}`}
              title={video.title}
              frameBorder="0"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-900">{video.title}</h1>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                <span>{video.views} views</span>
                <span className="mx-2">•</span>
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={throttledLikeHandler}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold transition-colors ${
                    video.isLiked ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  <FcLike />
                  <span>{video.likesCount}</span>
                </button>
                {isAuthenticated && (
                    <button onClick={() => setShowSaveModal(true)} className="flex items-center space-x-2 px-4 py-2 rounded-full font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                        <span>Save</span>
                    </button>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <p className="text-gray-800">
                  Uploaded by{' '}
                  <Link href={`/profile/${video.uploader?.username}`} className="font-bold hover:text-blue-600 hover:underline">
                    {video.uploader?.username || 'Unknown'}
                  </Link>
                </p>
                {user && user.id === video.uploader?._id && (
                    <div className="flex space-x-2">
                        <button onClick={() => setShowEditModal(true)} className="text-sm px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">Edit</button>
                        <button onClick={handleDelete} className="text-sm px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600">Delete</button>
                    </div>
                )}
              </div>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{video.description}</p>
                 {video.tags && video.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">{comments.length} Comments</h2>
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
                <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">
                  Post Comment
                </button>
              </form>
            ) : (
              <p className="mb-6 text-gray-600">
                Please <Link href="/login" className="text-blue-600">log in</Link> to post a comment.
              </p>
            )}
            <div className="space-y-4">
              {comments.map((comment) => (
                <Comment 
                    key={comment._id} 
                    comment={comment} 
                    videoId={id}
                    onCommentDeleted={handleCommentDeleted}
                    onCommentUpdated={handleCommentUpdated}
                    onReplySubmitted={() => {}}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <h3 className="font-bold text-lg mb-4">Up Next</h3>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
              {suggestedVideos.map((suggestedVideo) => (
                <SuggestedVideoCard key={suggestedVideo._id} video={suggestedVideo} />
              ))}
              <div ref={ref} className="h-10">
                {loadingSuggestions && <p className="text-center text-sm text-gray-500">Loading...</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default VideoPlayerPage;