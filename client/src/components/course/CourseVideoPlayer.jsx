import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaThumbsUp, FaThumbsDown, FaRegThumbsUp, FaRegThumbsDown, FaComment, FaReply, FaUser, FaCheck } from 'react-icons/fa';
import getProfileImage from '../../utils/getProfileImage';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const CourseVideoPlayer = ({ course, videoIndex, onVideoChange, currentUser }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(videoIndex || 0);
  const [showComments, setShowComments] = useState(true);
  const [comment, setComment] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const videoRef = useRef(null);
  const commentsRef = useRef(null);

  useEffect(() => {
    if (videoIndex !== undefined && videoIndex !== currentVideoIndex) {
      setCurrentVideoIndex(videoIndex);
    }
  }, [videoIndex]);

  useEffect(() => {
    if (course && course.videos && course.videos[currentVideoIndex]) {
      const video = course.videos[currentVideoIndex];

      // Check if user has liked or disliked the video
      if (currentUser && video.likes) {
        setIsLiked(video.likes.includes(currentUser._id));
        setLikesCount(video.likes.length);
      }

      if (currentUser && video.dislikes) {
        setIsDisliked(video.dislikes.includes(currentUser._id));
        setDislikesCount(video.dislikes.length);
      }
    }
  }, [course, currentVideoIndex, currentUser]);

  const handleVideoSelect = (index) => {
    setCurrentVideoIndex(index);
    if (onVideoChange) {
      onVideoChange(index);
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Auto-play prevented:", e));
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      toast.error("Please log in to like videos");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/creator/courses/${course._id}/videos/${currentVideoIndex}/like`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsLiked(!isLiked);
        if (isDisliked) setIsDisliked(false);
        setLikesCount(response.data.likes);
        setDislikesCount(response.data.dislikes);
      }
    } catch (error) {
      console.error("Error liking video:", error);
      toast.error("Failed to like video");
    }
  };

  const handleDislike = async () => {
    if (!currentUser) {
      toast.error("Please log in to dislike videos");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/creator/courses/${course._id}/videos/${currentVideoIndex}/dislike`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setIsDisliked(!isDisliked);
        if (isLiked) setIsLiked(false);
        setLikesCount(response.data.likes);
        setDislikesCount(response.data.dislikes);
      }
    } catch (error) {
      console.error("Error disliking video:", error);
      toast.error("Failed to dislike video");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please log in to comment");
      return;
    }

    if (!comment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/creator/courses/${course._id}/videos/${currentVideoIndex}/comment`,
        { comment: comment.trim() },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update the course object with the new comment
        const updatedCourse = { ...course };
        updatedCourse.videos[currentVideoIndex].comments.push(response.data.comment);

        // Update the course state through the parent component
        if (onVideoChange) {
          onVideoChange(currentVideoIndex, updatedCourse);
        }

        setComment('');
        toast.success("Comment added successfully");

        // Scroll to the bottom of comments
        if (commentsRef.current) {
          commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleReply = async (commentId) => {
    if (!currentUser) {
      toast.error("Please log in to reply");
      return;
    }

    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/creator/courses/${course._id}/videos/${currentVideoIndex}/comments/${commentId}/reply`,
        { comment: replyText.trim() },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Update the course object with the new reply
        const updatedCourse = { ...course };
        const commentIndex = updatedCourse.videos[currentVideoIndex].comments.findIndex(
          c => c._id === commentId
        );

        if (commentIndex !== -1) {
          updatedCourse.videos[currentVideoIndex].comments[commentIndex].replies.push(response.data.reply);

          // Update the course state through the parent component
          if (onVideoChange) {
            onVideoChange(currentVideoIndex, updatedCourse);
          }

          setReplyText('');
          setReplyingTo(null);
          toast.success("Reply added successfully");
        }
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    }
  };

  if (!course || !course.videos || course.videos.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-center">
        <p className="text-gray-400">No videos available for this course</p>
      </div>
    );
  }

  const currentVideo = course.videos[currentVideoIndex];

  return (
    <div className="bg-black text-white">
      {/* Main content area with video player and sidebar */}
      <div className="flex flex-col lg:flex-row">
        {/* Left column - Video player and info */}
        <div className="flex-1 lg:max-w-[70%]">
          {/* Video player */}
          <div className="w-full bg-black">
            <div className="aspect-video bg-black relative">
              <video
                ref={videoRef}
                src={currentVideo.url}
                className="w-full h-full"
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                poster={currentVideo.thumbnail}
                preload="metadata"
              ></video>
            </div>
          </div>

          {/* Video info section */}
          <div className="p-4">
            {/* Video title */}
            <h1 className="text-xl md:text-2xl font-bold mb-2">{currentVideo.title}</h1>

            {/* Video stats and actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between py-3">
              {/* Creator info */}
              {course.creatorId && (
                <div className="flex items-center mb-3 md:mb-0">
                  {course.creatorId.profileImageUrl ? (
                    <img
                      src={course.creatorId.profileImageUrl}
                      alt={course.creatorId.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">{course.creatorId.name?.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{course.creatorId.name}</div>
                    <div className="text-gray-400 text-sm">{course.title}</div>
                  </div>
                </div>
              )}

              {/* Like/Dislike/Comment buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 ${isLiked ? 'text-blue-500' : 'text-gray-400'} hover:text-blue-500`}
                >
                  {isLiked ? <FaThumbsUp size={20} /> : <FaRegThumbsUp size={20} />}
                  <span>{likesCount}</span>
                </button>

                <button
                  onClick={handleDislike}
                  className={`flex items-center space-x-1 ${isDisliked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                >
                  {isDisliked ? <FaThumbsDown size={20} /> : <FaRegThumbsDown size={20} />}
                  <span>{dislikesCount}</span>
                </button>

                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-1 text-gray-400 hover:text-white"
                >
                  <FaComment size={20} />
                  <span>{currentVideo.comments?.length || 0}</span>
                </button>
              </div>
            </div>

            {/* Video description */}
            <div className="mt-4 p-3 bg-gray-900 rounded-lg">
              {currentVideo.description ? (
                <p className="text-gray-300">{currentVideo.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description available</p>
              )}
            </div>

            {/* Comments section */}
            {showComments && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">
                  Comments <span className="text-gray-400">({currentVideo.comments?.length || 0})</span>
                </h3>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-6">
                  <div className="flex items-start space-x-3">
                    {getProfileImage(currentUser, currentUser?.name) ? (
                      <img
                        src={getProfileImage(currentUser, currentUser?.name)}
                        alt={currentUser?.name}
                        className="w-10 h-10 rounded-full"
                        onError={e => e.target.src = "/default-avatar.png"}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {currentUser?.name?.charAt(0) || 'G'}
                        </span>
                      </div>
                    )}
                    <div className="flex-grow">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                        placeholder="Add a comment..."
                        rows="2"
                      ></textarea>
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md"
                          disabled={!comment.trim()}
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div ref={commentsRef} className="space-y-6">
                  {currentVideo.comments && currentVideo.comments.length > 0 ? (
                    currentVideo.comments.map((comment) => (
                      <div key={comment._id} className="border-b border-gray-800 pb-6 last:border-0">
                        <div className="flex items-start space-x-3">
                          {getProfileImage(comment, comment.username) ? (
                            <img
                              src={getProfileImage(comment, comment.username)}
                              alt={comment.username}
                              className="w-10 h-10 rounded-full"
                              onError={e => e.target.src = "/default-avatar.png"}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="text-white font-bold">{comment.username?.charAt(0)}</span>
                            </div>
                          )}
                          <div className="flex-grow">
                            <div className="flex items-center">
                              <span className="font-medium mr-2">{comment.username}</span>
                              {comment.isCreator && (
                                <span className="bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded">Creator</span>
                              )}
                              <span className="text-gray-500 text-sm ml-2">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-300 mt-1">{comment.comment}</p>
                            <div className="flex items-center mt-2 text-sm">
                              <button
                                onClick={() => setReplyingTo(comment._id)}
                                className="flex items-center text-gray-400 hover:text-white"
                              >
                                <FaReply className="mr-1" />
                                Reply
                              </button>
                            </div>

                            {/* Reply Form */}
                            {replyingTo === comment._id && (
                              <div className="mt-3 pl-4 border-l-2 border-gray-700">
                                <div className="flex items-start space-x-3">
                                  {getProfileImage(currentUser, currentUser?.name) ? (
                                    <img
                                      src={getProfileImage(currentUser, currentUser?.name)}
                                      alt={currentUser?.name}
                                      className="w-8 h-8 rounded-full"
                                      onError={e => e.target.src = "/default-avatar.png"}
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                      <span className="text-white font-bold text-xs">
                                        {currentUser?.name?.charAt(0) || 'G'}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex-grow">
                                    <textarea
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                                      placeholder="Add a reply..."
                                      rows="2"
                                    ></textarea>
                                    <div className="flex justify-end mt-2 space-x-2">
                                      <button
                                        type="button"
                                        onClick={() => setReplyingTo(null)}
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleReply(comment._id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                                        disabled={!replyText.trim()}
                                      >
                                        Reply
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-3 pl-4 border-l-2 border-gray-700 space-y-3">
                                {comment.replies.map((reply, index) => (
                                  <div key={index} className="flex items-start space-x-3 pt-3">
                                    {getProfileImage(reply, reply.username) ? (
                                      <img
                                        src={getProfileImage(reply, reply.username)}
                                        alt={reply.username}
                                        className="w-8 h-8 rounded-full"
                                        onError={e => e.target.src = "/default-avatar.png"}
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                        <span className="text-white font-bold text-xs">{reply.username?.charAt(0)}</span>
                                      </div>
                                    )}
                                    <div>
                                      <div className="flex items-center">
                                        <span className="font-medium text-sm mr-2">{reply.username}</span>
                                        {reply.isCreator && (
                                          <span className="bg-blue-900 text-blue-300 text-xs px-1.5 py-0.5 rounded text-[10px]">Creator</span>
                                        )}
                                        <span className="text-gray-500 text-xs ml-2">
                                          {new Date(reply.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className="text-gray-300 text-sm mt-1">{reply.comment}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-900 rounded-lg">
                      <FaComment className="mx-auto text-gray-600 text-3xl mb-3" />
                      <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Video list */}
        <div className="lg:w-[30%] p-4">
          <div className="bg-gray-900 rounded-lg p-3">
            <h3 className="font-medium mb-3 text-lg">Course Videos</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {course.videos.map((video, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-md cursor-pointer flex items-start ${index === currentVideoIndex ? 'bg-gray-800' : 'hover:bg-gray-800'
                    }`}
                  onClick={() => handleVideoSelect(index)}
                >
                  <div className="w-24 h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0 mr-2">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-600 text-xs">No Thumbnail</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm line-clamp-2 ${index === currentVideoIndex ? 'font-medium text-blue-400' : ''}`}>
                      {video.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {course.creatorId?.name || 'Course Creator'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseVideoPlayer;
