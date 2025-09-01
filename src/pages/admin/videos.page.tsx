
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Edit, Trash2, Eye, Play, Clock, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  useGetVideoCategoriesQuery,
  useCreateVideoCategoryMutation,
  useUpdateVideoCategoryMutation,
  useDeleteVideoCategoryMutation,
  useGetCuratedVideosQuery,
  useAddCuratedVideoMutation,
  useUpdateCuratedVideoMutation,
  useDeleteCuratedVideoMutation,
  useSearchYouTubeForCurationQuery,
  VideoCategory,
  CuratedVideo,
  YouTubeVideo
} from "@/lib/api"
import { toast } from "sonner"

const iconOptions = [
  { value: 'BookOpen', label: '📖 Book Open' },
  { value: 'Code', label: '💻 Code' },
  { value: 'Palette', label: '🎨 Palette' },
  { value: 'Zap', label: '⚡ Zap' },
  { value: 'Play', label: '▶️ Play' },
  { value: 'Users', label: '👥 Users' },
  { value: 'Globe', label: '🌐 Globe' },
  { value: 'Monitor', label: '🖥️ Monitor' },
]

const colorOptions = [
  { value: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Blue' },
  { value: 'bg-green-100 text-green-700 border-green-200', label: 'Green' },
  { value: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Yellow' },
  { value: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Purple' },
  { value: 'bg-pink-100 text-pink-700 border-pink-200', label: 'Pink' },
  { value: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Orange' },
  { value: 'bg-red-100 text-red-700 border-red-200', label: 'Red' },
  { value: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Gray' },
]

export default function VideosManagement() {
  const [activeTab, setActiveTab] = useState("categories")
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [showYouTubeSearchDialog, setShowYouTubeSearchDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<VideoCategory | null>(null)
  const [editingVideo, setEditingVideo] = useState<CuratedVideo | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [youtubeSearchQuery, setYoutubeSearchQuery] = useState("")

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    searchQuery: "",
    icon: "BookOpen",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    order: 0
  })

  const [videoForm, setVideoForm] = useState({
    videoId: "",
    categoryId: "",
    title: "",
    description: "",
    thumbnail: "",
    channelTitle: "",
    publishedAt: "",
    duration: "",
    viewCount: "",
    likeCount: "",
    order: 0,
    tags: "",
    adminNotes: ""
  })

  // API hooks
  const { data: categoriesResponse, isLoading: categoriesLoading, refetch: refetchCategories } = useGetVideoCategoriesQuery({ includeInactive: true })
  const { data: videosResponse, isLoading: videosLoading, refetch: refetchVideos } = useGetCuratedVideosQuery({ includeInactive: true })
  const [createCategory, { isLoading: creatingCategory }] = useCreateVideoCategoryMutation()
  const [updateCategory, { isLoading: updatingCategory }] = useUpdateVideoCategoryMutation()
  const [deleteCategory, { isLoading: deletingCategory }] = useDeleteVideoCategoryMutation()
  const [addVideo, { isLoading: addingVideo }] = useAddCuratedVideoMutation()
  const [updateVideo, { isLoading: updatingVideo }] = useUpdateCuratedVideoMutation()
  const [deleteVideo, { isLoading: deletingVideo }] = useDeleteCuratedVideoMutation()

  // YouTube search
  const { data: youtubeSearchResponse, isLoading: searchingYoutube, refetch: searchYoutube } = useSearchYouTubeForCurationQuery(
    { query: youtubeSearchQuery },
    { skip: !youtubeSearchQuery }
  )

  const categories = categoriesResponse?.data || []
  const videos = videosResponse?.data || []
  const youtubeVideos = youtubeSearchResponse?.data?.videos || []

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || !categoryFilter ||
                           (typeof video.categoryId === 'object' ? video.categoryId._id === categoryFilter : video.categoryId === categoryFilter)
    return matchesSearch && matchesCategory
  })

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      searchQuery: "",
      icon: "BookOpen",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      order: 0
    })
  }

  const resetVideoForm = () => {
    setVideoForm({
      videoId: "",
      categoryId: "",
      title: "",
      description: "",
      thumbnail: "",
      channelTitle: "",
      publishedAt: "",
      duration: "",
      viewCount: "",
      likeCount: "",
      order: 0,
      tags: "",
      adminNotes: ""
    })
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!categoryForm.name || !categoryForm.description || !categoryForm.searchQuery) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      if (editingCategory) {
        await updateCategory({ 
          id: editingCategory._id, 
          ...categoryForm 
        }).unwrap()
        toast.success("Category updated successfully")
        setEditingCategory(null)
      } else {
        await createCategory(categoryForm).unwrap()
        toast.success("Category created successfully")
      }
      setShowCategoryDialog(false)
      resetCategoryForm()
      refetchCategories()
    } catch (error: any) {
      const errorMessage = error?.data?.error || "An error occurred"
      toast.error(errorMessage)
    }
  }

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!videoForm.videoId || !videoForm.categoryId) {
      toast.error("Video ID and category are required")
      return
    }

    const videoData = {
      ...videoForm,
      tags: videoForm.tags ? videoForm.tags.split(',').map(tag => tag.trim()) : []
    }

    try {
      if (editingVideo) {
        await updateVideo({ 
          id: editingVideo._id, 
          ...videoData 
        }).unwrap()
        toast.success("Video updated successfully")
        setEditingVideo(null)
      } else {
        await addVideo(videoData).unwrap()
        toast.success("Video added successfully")
      }
      setShowVideoDialog(false)
      resetVideoForm()
      refetchVideos()
    } catch (error: any) {
      const errorMessage = error?.data?.error || "An error occurred"
      toast.error(errorMessage)
    }
  }

  const handleEditCategory = (category: VideoCategory) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      description: category.description,
      searchQuery: category.searchQuery,
      icon: category.icon,
      color: category.color,
      order: category.order
    })
    setShowCategoryDialog(true)
  }

  const handleEditVideo = (video: CuratedVideo) => {
    setEditingVideo(video)
    setVideoForm({
      videoId: video.videoId,
      categoryId: typeof video.categoryId === 'object' ? video.categoryId._id : video.categoryId,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      channelTitle: video.channelTitle,
      publishedAt: video.publishedAt,
      duration: video.duration || "",
      viewCount: video.viewCount || "",
      likeCount: video.likeCount || "",
      order: video.order,
      tags: video.tags.join(', '),
      adminNotes: video.adminNotes || ""
    })
    setShowVideoDialog(true)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category? This will also affect associated videos.")) {
      try {
        await deleteCategory(categoryId).unwrap()
        toast.success("Category deleted successfully")
        refetchCategories()
      } catch (error: any) {
        const errorMessage = error?.data?.error || "Failed to delete category"
        toast.error(errorMessage)
      }
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await deleteVideo(videoId).unwrap()
        toast.success("Video deleted successfully")
        refetchVideos()
      } catch (error: any) {
        const errorMessage = error?.data?.error || "Failed to delete video"
        toast.error(errorMessage)
      }
    }
  }

  const handleAddFromYoutube = (youtubeVideo: YouTubeVideo) => {
    setVideoForm({
      videoId: youtubeVideo.id,
      categoryId: "",
      title: youtubeVideo.title,
      description: youtubeVideo.description,
      thumbnail: youtubeVideo.thumbnail,
      channelTitle: youtubeVideo.channelTitle,
      publishedAt: youtubeVideo.publishedAt,
      duration: youtubeVideo.duration || "",
      viewCount: youtubeVideo.viewCount || "",
      likeCount: youtubeVideo.likeCount || "",
      order: 0,
      tags: "",
      adminNotes: ""
    })
    setShowYouTubeSearchDialog(false)
    setShowVideoDialog(true)
  }

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Videos Management</h1>
          <p className="text-gray-600">Manage video categories and curated video content</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="videos">Curated Videos</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Category Name *</Label>
                      <Input 
                        id="name" 
                        placeholder="e.g., HTML Fundamentals"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="order">Display Order</Label>
                      <Input 
                        id="order" 
                        type="number"
                        placeholder="0"
                        value={categoryForm.order}
                        onChange={(e) => setCategoryForm({...categoryForm, order: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Brief description of the category..."
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="searchQuery">Search Query *</Label>
                    <Input 
                      id="searchQuery" 
                      placeholder="HTML tutorial beginner tags elements structure"
                      value={categoryForm.searchQuery}
                      onChange={(e) => setCategoryForm({...categoryForm, searchQuery: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="icon">Icon</Label>
                      <Select value={categoryForm.icon} onValueChange={(value) => setCategoryForm({...categoryForm, icon: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="color">Color Theme</Label>
                      <Select value={categoryForm.color} onValueChange={(value) => setCategoryForm({...categoryForm, color: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => {setShowCategoryDialog(false); setEditingCategory(null); resetCategoryForm()}}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={creatingCategory || updatingCategory}>
                      {creatingCategory || updatingCategory ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Categories ({filteredCategories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoriesLoading ? (
                  <div className="text-center py-8">Loading categories...</div>
                ) : filteredCategories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No categories found. Add your first category!
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <div key={category._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline" className={category.color}>
                            {category.icon}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Order: {category.order}</span>
                          <span>Search: {category.searchQuery}</span>
                          <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCategory(category._id)}
                          disabled={deletingCategory}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Dialog open={showYouTubeSearchDialog} onOpenChange={setShowYouTubeSearchDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Search className="h-4 w-4 mr-2" />
                    Search YouTube
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Search YouTube Videos</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Search YouTube videos..."
                        value={youtubeSearchQuery}
                        onChange={(e) => setYoutubeSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={() => searchYoutube()} disabled={searchingYoutube || !youtubeSearchQuery}>
                        {searchingYoutube ? "Searching..." : "Search"}
                      </Button>
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {youtubeVideos.map((video) => (
                        <div key={video.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <img src={video.thumbnail} alt={video.title} className="w-24 h-18 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{video.channelTitle}</p>
                            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                              {video.duration && (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDuration(video.duration)}
                                </span>
                              )}
                              {video.viewCount && (
                                <span className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {formatViewCount(video.viewCount)}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleAddFromYoutube(video)}>
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-600 hover:bg-cyan-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleVideoSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="videoId">YouTube Video ID *</Label>
                        <Input 
                          id="videoId" 
                          placeholder="dQw4w9WgXcQ"
                          value={videoForm.videoId}
                          onChange={(e) => setVideoForm({...videoForm, videoId: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="categoryId">Category *</Label>
                        <Select value={videoForm.categoryId} onValueChange={(value) => setVideoForm({...videoForm, categoryId: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(cat => cat.isActive).map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title" 
                        placeholder="Video title (auto-filled from YouTube)"
                        value={videoForm.title}
                        onChange={(e) => setVideoForm({...videoForm, title: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Video description (auto-filled from YouTube)"
                        value={videoForm.description}
                        onChange={(e) => setVideoForm({...videoForm, description: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="order">Display Order</Label>
                        <Input 
                          id="order" 
                          type="number"
                          placeholder="0"
                          value={videoForm.order}
                          onChange={(e) => setVideoForm({...videoForm, order: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input 
                          id="tags" 
                          placeholder="html, css, tutorial"
                          value={videoForm.tags}
                          onChange={(e) => setVideoForm({...videoForm, tags: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="adminNotes">Admin Notes</Label>
                      <Textarea 
                        id="adminNotes" 
                        placeholder="Internal notes about this video..."
                        value={videoForm.adminNotes}
                        onChange={(e) => setVideoForm({...videoForm, adminNotes: e.target.value})}
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => {setShowVideoDialog(false); setEditingVideo(null); resetVideoForm()}}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={addingVideo || updatingVideo}>
                        {addingVideo || updatingVideo ? "Saving..." : editingVideo ? "Update Video" : "Add Video"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Curated Videos ({filteredVideos.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {videosLoading ? (
                  <div className="text-center py-8">Loading videos...</div>
                ) : filteredVideos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No videos found. Add your first video!
                  </div>
                ) : (
                  filteredVideos.map((video) => (
                    <div key={video._id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      <img src={video.thumbnail} alt={video.title} className="w-32 h-24 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 line-clamp-2">{video.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{video.channelTitle}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Category: {typeof video.categoryId === 'object' ? video.categoryId.name : 'Unknown'}</span>
                              <span>Order: {video.order}</span>
                              {video.duration && (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDuration(video.duration)}
                                </span>
                              )}
                              {video.viewCount && (
                                <span className="flex items-center">
                                  <Eye className="h-3 w-3 mr-1" />
                                  {formatViewCount(video.viewCount)}
                                </span>
                              )}
                            </div>
                            {video.tags.length > 0 && (
                              <div className="flex items-center space-x-1 mt-2">
                                <Tag className="h-3 w-3 text-gray-400" />
                                <div className="flex flex-wrap gap-1">
                                  {video.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {video.adminNotes && (
                              <p className="text-xs text-gray-500 mt-2 italic">
                                Admin Notes: {video.adminNotes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={video.isActive ? "default" : "secondary"}>
                              {video.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(video.url, '_blank')}
                              title="Watch on YouTube"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditVideo(video)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteVideo(video._id)}
                              disabled={deletingVideo}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
                                