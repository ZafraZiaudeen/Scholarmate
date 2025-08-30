"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useGetPapersQuery, useUploadPaperMutation, useUpdatePaperMutation, useDeletePaperMutation, PastPaper } from "@/lib/api"
import { toast } from "sonner"

export default function PapersManagement() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingPaper, setEditingPaper] = useState<PastPaper | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [paperTypeFilter, setPaperTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    year: "",
    type: "",
    duration: "",
    description: "",
    paperType: "past paper",
    status: "Draft"
  })
  const [paperFile, setPaperFile] = useState<File | null>(null)
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null)

  const paperFileRef = useRef<HTMLInputElement>(null)
  const answerSheetFileRef = useRef<HTMLInputElement>(null)

  // API hooks
  const { data: papersResponse, isLoading, error, refetch } = useGetPapersQuery({
    year: yearFilter === "all" ? undefined : yearFilter || undefined,
    type: typeFilter === "all" ? undefined : typeFilter || undefined,
    paperType: paperTypeFilter === "all" ? undefined : paperTypeFilter || undefined,
    status: statusFilter === "all" ? undefined : statusFilter || undefined
  })
  const [uploadPaper, { isLoading: isUploading }] = useUploadPaperMutation()
  const [updatePaper, { isLoading: isUpdating }] = useUpdatePaperMutation()
  const [deletePaper, { isLoading: isDeleting }] = useDeletePaperMutation()

  const papers = papersResponse?.data || []

  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      title: "",
      year: "",
      type: "",
      duration: "",
      description: "",
      paperType: "past paper",
      status: "Draft"
    })
    setPaperFile(null)
    setAnswerSheetFile(null)
    if (paperFileRef.current) paperFileRef.current.value = ""
    if (answerSheetFileRef.current) answerSheetFileRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.year || !formData.type) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!editingPaper && !paperFile) {
      toast.error("Please select a paper file")
      return
    }

    const submitFormData = new FormData()
    submitFormData.append('title', formData.title)
    submitFormData.append('year', formData.year)
    submitFormData.append('type', formData.type)
    submitFormData.append('paperType', formData.paperType)
    submitFormData.append('status', formData.status)
    if (formData.duration) submitFormData.append('duration', formData.duration)
    if (formData.description) submitFormData.append('description', formData.description)
    if (paperFile) submitFormData.append('paper', paperFile)
    if (answerSheetFile) submitFormData.append('answerSheet', answerSheetFile)

    try {
      if (editingPaper) {
        await updatePaper({ id: editingPaper._id, formData: submitFormData }).unwrap()
        toast.success("Paper updated successfully")
        setShowEditDialog(false)
        setEditingPaper(null)
      } else {
        await uploadPaper(submitFormData).unwrap()
        toast.success("Paper uploaded successfully")
        setShowAddDialog(false)
      }
      resetForm()
      refetch()
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error.data as { error?: string })?.error || "An error occurred"
        : "An error occurred"
      toast.error(errorMessage)
    }
  }

  const handleEdit = (paper: PastPaper) => {
    setEditingPaper(paper)
    setFormData({
      title: paper.title,
      year: paper.year.toString(),
      type: paper.type,
      duration: paper.duration?.toString() || "",
      description: paper.description || "",
      paperType: paper.paperType || "past paper",
      status: paper.status
    })
    setShowEditDialog(true)
  }

  const handleDelete = async (paperId: string) => {
    if (window.confirm("Are you sure you want to delete this paper?")) {
      try {
        await deletePaper(paperId).unwrap()
        toast.success("Paper deleted successfully")
        refetch()
      } catch (error: unknown) {
        const errorMessage = error && typeof error === 'object' && 'data' in error
          ? (error.data as { error?: string })?.error || "Failed to delete paper"
          : "Failed to delete paper"
        toast.error(errorMessage)
      }
    }
  }

  const handleDownload = (fileId: string, filename: string) => {
    const downloadUrl = `http://localhost:8000/api/paper/download/${fileId}`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) return <div className="p-6">Loading papers...</div>
  if (error) return <div className="p-6 text-red-600">Error loading papers</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Papers Management</h1>
          <p className="text-gray-600">Add and manage past papers and answer sheets</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Paper
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Past Paper</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Paper Title *</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., 2024 O/L IT Theory Paper"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input 
                    id="year" 
                    type="number"
                    placeholder="2024"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Paper Part *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select part" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="part 1">Part 1</SelectItem>
                      <SelectItem value="part 2">Part 2</SelectItem>
                      <SelectItem value="both">Both Parts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input 
                    id="duration" 
                    type="number" 
                    placeholder="120"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Brief description of the paper..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

                <div>
                  <Label htmlFor="paperType">Paper Type</Label>
                  <Select value={formData.paperType} onValueChange={(value) => setFormData({...formData, paperType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="model paper">Model Paper</SelectItem>
                      <SelectItem value="past paper">Past Paper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              <div>
                <Label>Upload Paper File *</Label>
                <Input
                  ref={paperFileRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Upload Answer Sheet (Optional)</Label>
                <Input
                  ref={answerSheetFileRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setAnswerSheetFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => {setShowAddDialog(false); resetForm()}}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Add Paper"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search papers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by part" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parts</SelectItem>
                <SelectItem value="part 1">Part 1</SelectItem>
                <SelectItem value="part 2">Part 2</SelectItem>
                <SelectItem value="both">Both Parts</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paperTypeFilter} onValueChange={setPaperTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by paper type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Paper Types</SelectItem>
                <SelectItem value="model paper">Model Paper</SelectItem>
                <SelectItem value="past paper">Past Paper</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Papers List */}
      <Card>
        <CardHeader>
          <CardTitle>Past Papers ({filteredPapers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPapers.map((paper) => (
              <div key={paper._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900">{paper.title}</h3>
                    <Badge variant={paper.status === "Published" ? "default" : "secondary"}>
                      {paper.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Year: {paper.year}</span>
                    <span>Part: {paper.type}</span>
                    <span>Type: {paper.paperType}</span>
                    {paper.duration && <span>Duration: {paper.duration}min</span>}
                    <span>Created: {new Date(paper.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownload(paper.paperFileId, `${paper.title}.pdf`)}
                    title="Download Paper"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {paper.answerSheetFileId && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownload(paper.answerSheetFileId!, `${paper.title}_answers.pdf`)}
                      title="Download Answer Sheet"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(paper)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(paper._id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredPapers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No papers found. {papers.length === 0 ? "Add your first paper!" : "Try adjusting your search or filters."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Past Paper</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Paper Title *</Label>
                <Input 
                  id="edit-title" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-year">Year *</Label>
                <Input 
                  id="edit-year" 
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Paper Part *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="part 1">Part 1</SelectItem>
                    <SelectItem value="part 2">Part 2</SelectItem>
                    <SelectItem value="both">Both Parts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Input 
                  id="edit-duration" 
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit-paperType">Paper Type</Label>
              <Select value={formData.paperType} onValueChange={(value) => setFormData({...formData, paperType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="model paper">Model Paper</SelectItem>
                  <SelectItem value="past paper">Past Paper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Replace Paper File (Optional)</Label>
              <Input
                ref={paperFileRef}
                type="file"
                accept=".pdf"
                onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Replace Answer Sheet (Optional)</Label>
              <Input
                ref={answerSheetFileRef}
                type="file"
                accept=".pdf"
                onChange={(e) => setAnswerSheetFile(e.target.files?.[0] || null)}
                className="mt-2"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {setShowEditDialog(false); setEditingPaper(null); resetForm()}}>
                Cancel
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Paper"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
