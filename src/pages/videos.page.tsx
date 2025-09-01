import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Play,
  Search,
  Clock,
  Eye,
  ThumbsUp,
  BookOpen,
  Code,
  Palette,
  Zap,
  Filter,
  Users,
  Calendar
} from "lucide-react";
import { useSearchYouTubeVideosQuery, useGetVideoCategoriesQuery, useGetCuratedVideosQuery, YouTubeVideo, VideoCategory, CuratedVideo } from "@/lib/api";


interface TopicCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  searchQuery: string;
  color: string;
}

const topicCategories: TopicCategory[] = [
  {
    id: "html",
    name: "HTML Fundamentals",
    icon: BookOpen,
    description: "Learn HTML tags, elements, and structure",
    searchQuery: "HTML tutorial beginner tags elements structure",
    color: "bg-orange-100 text-orange-700 border-orange-200"
  },
  {
    id: "css",
    name: "CSS Styling",
    icon: Palette,
    description: "Master CSS selectors, properties, and layouts",
    searchQuery: "CSS tutorial beginner styling selectors flexbox grid",
    color: "bg-blue-100 text-blue-700 border-blue-200"
  },
  {
    id: "javascript",
    name: "JavaScript Programming",
    icon: Code,
    description: "JavaScript fundamentals and DOM manipulation",
    searchQuery: "JavaScript tutorial beginner programming variables functions",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200"
  },
  {
    id: "responsive",
    name: "Responsive Design",
    icon: Zap,
    description: "Create mobile-friendly responsive websites",
    searchQuery: "responsive web design tutorial mobile CSS media queries",
    color: "bg-green-100 text-green-700 border-green-200"
  },
  {
    id: "multimedia",
    name: "Web Multimedia",
    icon: Play,
    description: "Audio, video, and interactive media",
    searchQuery: "HTML5 multimedia tutorial audio video canvas",
    color: "bg-purple-100 text-purple-700 border-purple-200"
  },
  {
    id: "forms",
    name: "Forms & Validation",
    icon: Users,
    description: "HTML forms and input validation",
    searchQuery: "HTML forms tutorial input validation JavaScript",
    color: "bg-pink-100 text-pink-700 border-pink-200"
  }
];

const formatDuration = (duration: string): string => {
  if (!duration) return "";
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return "";
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatViewCount = (count: string): string => {
  if (!count) return "";
  const num = parseInt(count);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M views`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K views`;
  }
  return `${num} views`;
};

const formatPublishedDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
};

export default function VideosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory | null>(null);
  const [selectedAdminCategory, setSelectedAdminCategory] = useState<VideoCategory | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | CuratedVideo | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [useAdminCategories, setUseAdminCategories] = useState(true);

  // Get admin-curated categories and videos
  const { data: adminCategoriesResponse, isLoading: adminCategoriesLoading } = useGetVideoCategoriesQuery({ includeInactive: false });
  const { data: curatedVideosResponse, isLoading: curatedVideosLoading } = useGetCuratedVideosQuery({
    categoryId: selectedAdminCategory?._id,
    includeInactive: false
  });

  const adminCategories = adminCategoriesResponse?.data || [];
  const curatedVideos = curatedVideosResponse?.data || [];

  // Default search for O/L IT content
  const defaultQuery = "O/L IT web design HTML CSS JavaScript tutorial";
  const currentQuery = selectedAdminCategory?.searchQuery || selectedCategory?.searchQuery || searchQuery || defaultQuery;

  const {
    data: videosResponse,
    isLoading: youtubeLoading,
    error,
    refetch
  } = useSearchYouTubeVideosQuery({
    query: currentQuery,
    maxResults: 12,
    order: "relevance",
    useCurated: useAdminCategories ? "true" : "false"
  });

  const youtubeVideos = videosResponse?.data?.videos || [];
  
  // Prioritize curated videos if available, otherwise use YouTube search
  const videos = useAdminCategories && curatedVideos.length > 0 ?
    curatedVideos.map(video => ({
      id: video.videoId,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      duration: video.duration,
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      url: video.url
    })) : youtubeVideos;

  const isLoading = useAdminCategories ? (adminCategoriesLoading || curatedVideosLoading) : youtubeLoading;

  const handleSearch = () => {
    setSelectedCategory(null);
    setSelectedAdminCategory(null);
    setUseAdminCategories(false);
    refetch();
  };

  const handleCategorySelect = (category: TopicCategory) => {
    setSelectedCategory(category);
    setSelectedAdminCategory(null);
    setSearchQuery("");
    setUseAdminCategories(false);
  };

  const handleAdminCategorySelect = (category: VideoCategory) => {
    setSelectedAdminCategory(category);
    setSelectedCategory(null);
    setSearchQuery("");
    setUseAdminCategories(true);
  };

  const handleVideoSelect = (video: YouTubeVideo | CuratedVideo) => {
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            📺 Video Learning Hub
          </h1>
          <p className="text-slate-600">
            Discover curated educational videos for O/L IT Web Design. Learn HTML, CSS, JavaScript, and more!
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search for tutorials, concepts, or specific topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-base"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Admin Categories (if available) */}
            {adminCategories.length > 0 && (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">📚 Curated Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {adminCategories.map((category) => (
                      <Button
                        key={category._id}
                        variant="outline"
                        className={`h-auto p-3 flex flex-col items-center space-y-2 ${
                          selectedAdminCategory?._id === category._id
                            ? category.color
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => handleAdminCategorySelect(category)}
                      >
                        <span className="text-lg">{category.icon === 'BookOpen' ? '📖' : category.icon === 'Code' ? '💻' : category.icon === 'Palette' ? '🎨' : category.icon === 'Zap' ? '⚡' : category.icon === 'Play' ? '▶️' : category.icon === 'Users' ? '👥' : '📖'}</span>
                        <span className="text-xs font-medium text-center">{category.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-2">🔍 Browse All Topics</h3>
                </div>
              </>
            )}

            {/* Default Topic Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {topicCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  className={`h-auto p-3 flex flex-col items-center space-y-2 ${
                    selectedCategory?.id === category.id
                      ? category.color
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <category.icon className="h-5 w-5" />
                  <span className="text-xs font-medium text-center">{category.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Search Info */}
        {(selectedAdminCategory || selectedCategory || searchQuery) && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                {selectedAdminCategory
                  ? `Showing curated videos for: ${selectedAdminCategory.name}`
                  : selectedCategory
                    ? `Showing videos for: ${selectedCategory.name}`
                    : `Search results for: "${searchQuery}"`
                }
              </span>
              {(useAdminCategories && curatedVideos.length > 0) && (
                <Badge variant="secondary" className="text-xs">
                  Curated Content
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedAdminCategory(null);
                  setSearchQuery("");
                  setUseAdminCategories(true);
                }}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading educational videos...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <div className="text-red-600 mb-4">
                <p className="font-medium">Unable to load videos</p>
                <p className="text-sm">Please check your internet connection and try again.</p>
              </div>
              <Button onClick={() => refetch()} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Videos Grid */}
        {!isLoading && !error && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => {
              const videoKey = 'videoId' in video ? video.videoId : video.id;
              return (
                <Card
                  key={videoKey}
                  className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-t-lg flex items-center justify-center">
                      <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                    {video.duration && (
                      <Badge className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(video.duration)}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-red-600 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-600 mb-2">{video.channelTitle}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        {video.viewCount && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatViewCount(video.viewCount)}
                          </span>
                        )}
                        {video.likeCount && (
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {formatViewCount(video.likeCount)}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatPublishedDate(video.publishedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && videos.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 mb-4">
                <Search className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">No videos found</h3>
                <p className="text-sm">Try adjusting your search terms or browse our topic categories.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Player Dialog */}
        <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold line-clamp-2">
                {selectedVideo?.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                by {selectedVideo?.channelTitle} • {selectedVideo && formatPublishedDate(selectedVideo.publishedAt)}
                {useAdminCategories && curatedVideos.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Curated
                  </Badge>
                )}
              </DialogDescription>
            </DialogHeader>
            
            {selectedVideo && (
              <div className="space-y-4">
                {/* Video Player */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${'videoId' in selectedVideo ? selectedVideo.videoId : selectedVideo.id}?autoplay=1&rel=0`}
                    title={selectedVideo.title}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>

                {/* Video Info */}
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-4">
                    {selectedVideo.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(selectedVideo.duration)}
                      </span>
                    )}
                    {selectedVideo.viewCount && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {formatViewCount(selectedVideo.viewCount)}
                      </span>
                    )}
                    {selectedVideo.likeCount && (
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {formatViewCount(selectedVideo.likeCount)}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedVideo.url, '_blank')}
                  >
                    Watch on YouTube
                  </Button>
                </div>

                {/* Description */}
                {selectedVideo.description && (
                  <div className="max-h-32 overflow-y-auto">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedVideo.description.slice(0, 500)}
                      {selectedVideo.description.length > 500 && '...'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}