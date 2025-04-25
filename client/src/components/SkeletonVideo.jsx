const SkeletonVideo = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="w-full aspect-video bg-gray-800 rounded-lg"></div>
      <div className="h-6 bg-gray-800 rounded w-3/4"></div>
      <div className="h-4 bg-gray-800 rounded w-1/2"></div>
    </div>
  );
};

export default SkeletonVideo;
