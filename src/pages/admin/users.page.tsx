"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, UserCheck, UserX, Shield, User as UserIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useGetUsersQuery, useUpdateUserRoleMutation, useToggleUserBanMutation, useDeleteUserMutation, User } from "@/lib/api"
import { toast } from "sonner"

export default function UsersManagement() {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Form states
  const [formData, setFormData] = useState({
    role: "user" as "user" | "admin"
  })

  // API hooks
  const { data: usersResponse, isLoading, error, refetch } = useGetUsersQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm
  })
  const [updateUserRole, { isLoading: isUpdating }] = useUpdateUserRoleMutation()
  const [toggleUserBan, { isLoading: isToggling }] = useToggleUserBanMutation()
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation()

  const users = usersResponse?.data || []
  const pagination = usersResponse?.pagination

  const filteredUsers = users.filter(user => {
    const matchesRole = !roleFilter || roleFilter === "all" || user.role === roleFilter
    const matchesStatus = !statusFilter || statusFilter === "all" || 
      (statusFilter === "active" && !user.banned) ||
      (statusFilter === "banned" && user.banned)
    return matchesRole && matchesStatus
  })

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      role: user.role
    })
    setShowEditDialog(true)
  }

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingUser) return

    try {
      await updateUserRole({ 
        userId: editingUser.id, 
        role: formData.role 
      }).unwrap()
      toast.success("User role updated successfully")
      setShowEditDialog(false)
      setEditingUser(null)
      refetch()
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error
        ? (error.data as { error?: string })?.error || "Failed to update user role"
        : "Failed to update user role"
      toast.error(errorMessage)
    }
  }

  const handleToggleBan = async (userId: string, userName: string, isBanned: boolean) => {
    const action = isBanned ? "unban" : "ban"
    if (window.confirm(`Are you sure you want to ${action} ${userName}?`)) {
      try {
        await toggleUserBan(userId).unwrap()
        toast.success(`User ${action}ned successfully`)
        refetch()
      } catch (error: unknown) {
        const errorMessage = error && typeof error === 'object' && 'data' in error
          ? (error.data as { error?: string })?.error || `Failed to ${action} user`
          : `Failed to ${action} user`
        toast.error(errorMessage)
      }
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        await deleteUser(userId).unwrap()
        toast.success("User deleted successfully")
        refetch()
      } catch (error: unknown) {
        const errorMessage = error && typeof error === 'object' && 'data' in error
          ? (error.data as { error?: string })?.error || "Failed to delete user"
          : "Failed to delete user"
        toast.error(errorMessage)
      }
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) return <div className="p-6">Loading users...</div>
  if (error) return <div className="p-6 text-red-600">Error loading users</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users, roles, and permissions</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center">
                    {user.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.fullName} 
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-cyan-700">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-gray-900">
                        {user.fullName || `${user.firstName} ${user.lastName}`.trim() || 'No Name'}
                      </h3>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role === "admin" ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <UserIcon className="h-3 w-3 mr-1" />
                            User
                          </>
                        )}
                      </Badge>
                      {user.banned && (
                        <Badge variant="destructive">Banned</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{user.email}</span>
                      <span>Joined: {formatDate(user.createdAt)}</span>
                      {user.lastSignInAt && (
                        <span>Last seen: {formatDate(user.lastSignInAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(user)}
                    title="Edit Role"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleToggleBan(user.id, user.fullName || user.email, user.banned)}
                    className={user.banned ? "text-green-600 hover:text-green-700" : "text-orange-600 hover:text-orange-700"}
                    disabled={isToggling}
                    title={user.banned ? "Unban User" : "Ban User"}
                  >
                    {user.banned ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(user.id, user.fullName || user.email)}
                    disabled={isDeleting}
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No users found. {users.length === 0 ? "No users available." : "Try adjusting your search or filters."}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateRole} className="space-y-4">
            <div>
              <Label htmlFor="user-info">User</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center">
                    {editingUser?.imageUrl ? (
                      <img 
                        src={editingUser.imageUrl} 
                        alt={editingUser.fullName} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-cyan-700">
                        {editingUser?.firstName?.[0]}{editingUser?.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{editingUser?.fullName || 'No Name'}</p>
                    <p className="text-sm text-gray-500">{editingUser?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: "user" | "admin") => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      User
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {setShowEditDialog(false); setEditingUser(null)}}>
                Cancel
              </Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Role"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}