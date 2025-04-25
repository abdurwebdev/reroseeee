const VideoCard = ({ video }) => (
  <div className="w-full sm:w-[300px]">
    <img src={video.thumbnailUrl} className="w-full h-48 object-cover rounded-md" />
    <h2 className="mt-2 text-lg font-semibold">{video.title}</h2>
    <p className="text-sm text-gray-600">{video.description.slice(0, 60)}...</p>
    <p className="text-xs text-gray-500">{video.views} views</p>
  </div>
);
