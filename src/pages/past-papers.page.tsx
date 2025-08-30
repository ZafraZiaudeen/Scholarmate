"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Download, FileText, Clock, Calendar } from "lucide-react"
import { useGetPapersQuery } from "@/lib/api"
import { toast } from "sonner"

export default function PastPapersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [paperTypeFilter, setPaperTypeFilter] = useState("all")

  // Only fetch published papers for students
  const { data: papersResponse, isLoading, error } = useGetPapersQuery({
    year: yearFilter === "all" ? undefined : yearFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    paperType: paperTypeFilter === "all" ? undefined : paperTypeFilter,
    status: "Published"
  })

  const papers = papersResponse?.data || []

  const filteredPapers = papers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDownload = async (fileId: string, filename: string, type: 'paper' | 'answer') => {
    try {
      const response = await fetch(`http://localhost:8000/api/paper/download/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${await window?.Clerk?.session?.getToken()}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}_${type}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success(`${type === 'paper' ? 'Paper' : 'Answer sheet'} downloaded successfully`)
    } catch {
      toast.error(`Failed to download ${type === 'paper' ? 'paper' : 'answer sheet'}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading past papers...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading past papers. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Past Papers</h1>
          <p className="text-gray-600 text-lg">
            Download past papers and answer sheets to practice and prepare for your exams
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search past papers..."
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
                  <SelectItem value="2020">2020</SelectItem>
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
            </div>
          </CardContent>
        </Card>

        {/* Papers Grid */}
        {filteredPapers.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Papers Found</h3>
                <p className="text-gray-600">
                  {papers.length === 0 
                    ? "No past papers are available at the moment. Check back later!"
                    : "No papers match your search criteria. Try adjusting your filters."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <Card key={paper._id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {paper.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {paper.type.charAt(0).toUpperCase() + paper.type.slice(1)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {paper.paperType}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {paper.year}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {paper.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {paper.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                    </div>
                    {paper.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{paper.duration} min</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={() => handleDownload(paper.paperFileId, paper.title, 'paper')}
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Paper
                    </Button>
                    
                    {paper.answerSheetFileId && (
                      <Button
                        onClick={() => handleDownload(paper.answerSheetFileId!, paper.title, 'answer')}
                        variant="outline"
                        className="w-full border-cyan-600 text-cyan-600 hover:bg-cyan-50"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Answer Sheet
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {filteredPapers.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing {filteredPapers.length} of {papers.length} past papers
            </p>
          </div>
        )}
      </div>
    </div>
  )
}