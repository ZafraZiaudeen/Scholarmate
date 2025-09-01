import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Database, 
  Mail, 
  Shield, 
  Server,
  Key,
  FileText,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Globe,
  Eye,
  EyeOff,
  Download,
  Upload
} from "lucide-react"
import { useState } from "react"
import { useGetAdminAnalyticsQuery } from "@/lib/api"

interface LocalSettings {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  supportEmail: string;
  maxFileSize: number;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  systemNotifications: boolean;
  sessionTimeout: number;
  debugMode: boolean;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [showApiKey, setShowApiKey] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Get system status from existing analytics
  const { data: analyticsResponse } = useGetAdminAnalyticsQuery()
  const systemStatus = analyticsResponse?.data?.systemStatus

  // Local settings state (stored in localStorage)
  const [settings, setSettings] = useState<LocalSettings>(() => {
    const saved = localStorage.getItem('scholarmate-admin-settings')
    return saved ? JSON.parse(saved) : {
      siteName: "ScholarMate",
      siteDescription: "Advanced Learning Management System for O/L IT Students",
      adminEmail: "admin@scholarmate.com",
      supportEmail: "support@scholarmate.com",
      maxFileSize: 10,
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotifications: true,
      systemNotifications: true,
      sessionTimeout: 30,
      debugMode: false
    }
  })

  const handleInputChange = (key: keyof LocalSettings, value: string | number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const handleSaveSettings = () => {
    localStorage.setItem('scholarmate-admin-settings', JSON.stringify(settings))
    setHasUnsavedChanges(false)
    alert("Settings saved successfully!")
  }

  const handleResetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      const defaultSettings: LocalSettings = {
        siteName: "ScholarMate",
        siteDescription: "Advanced Learning Management System for O/L IT Students",
        adminEmail: "admin@scholarmate.com",
        supportEmail: "support@scholarmate.com",
        maxFileSize: 10,
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotifications: true,
        systemNotifications: true,
        sessionTimeout: 30,
        debugMode: false
      }
      setSettings(defaultSettings)
      localStorage.setItem('scholarmate-admin-settings', JSON.stringify(defaultSettings))
      setHasUnsavedChanges(false)
      alert("Settings reset to defaults!")
    }
  }

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `scholarmate-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          setSettings(importedSettings)
          setHasUnsavedChanges(true)
          alert("Settings imported successfully!")
        } catch {
          alert("Error importing settings. Please check the file format.")
        }
      }
      reader.readAsText(file)
    }
  }

  const handleClearCache = () => {
    // Clear browser cache/localStorage
    const keys = Object.keys(localStorage)
    const scholarMateKeys = keys.filter(key => key.startsWith('scholarmate-') && key !== 'scholarmate-admin-settings')
    scholarMateKeys.forEach(key => localStorage.removeItem(key))
    
    // Clear session storage
    sessionStorage.clear()
    
    alert("Browser cache cleared successfully!")
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'available':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'available':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure your ScholarMate platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleResetSettings} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSaveSettings} disabled={!hasUnsavedChanges} className="bg-cyan-600 hover:bg-cyan-700">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">You have unsaved changes</span>
          </div>
        </div>
      )}

      {/* System Status Overview */}
      {systemStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current status of system components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(systemStatus).map(([service, status]) => (
                <div key={service} className={`p-3 rounded-lg border ${getStatusColor(status)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {service.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {getStatusIcon(status)}
                  </div>
                  <div className="text-xs mt-1 capitalize">{status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
                <CardDescription>Basic information about your platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Control platform behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>User Registration</Label>
                    <p className="text-sm text-gray-500">Allow new users to register</p>
                  </div>
                  <Button
                    variant={settings.registrationEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('registrationEnabled', !settings.registrationEnabled)}
                  >
                    {settings.registrationEnabled ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Show maintenance message</p>
                  </div>
                  <Button
                    variant={settings.maintenanceMode ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('maintenanceMode', !settings.maintenanceMode)}
                  >
                    {settings.maintenanceMode ? "Active" : "Inactive"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.maxFileSize}
                    onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send email alerts</p>
                  </div>
                  <Button
                    variant={settings.emailNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('emailNotifications', !settings.emailNotifications)}
                  >
                    {settings.emailNotifications ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>Security and session configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="480"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-gray-500">Show detailed error information</p>
                  </div>
                  <Button
                    variant={settings.debugMode ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('debugMode', !settings.debugMode)}
                  >
                    {settings.debugMode ? "Enabled" : "Disabled"}
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Notifications</Label>
                    <p className="text-sm text-gray-500">Internal system alerts</p>
                  </div>
                  <Button
                    variant={settings.systemNotifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange('systemNotifications', !settings.systemNotifications)}
                  >
                    {settings.systemNotifications ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>External service settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>OpenRouter API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value="sk-or-v1-********************************"
                      readOnly
                      className="font-mono text-sm bg-gray-50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">Configure in environment variables</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>API Status</Label>
                    <p className="text-sm text-gray-500">OpenRouter connection</p>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-200">
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Import, export, and backup settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleExportSettings} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportSettings}
                      className="hidden"
                      id="import-settings"
                    />
                    <Button asChild variant="outline" className="w-full">
                      <label htmlFor="import-settings" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Settings
                      </label>
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Settings Storage</Label>
                    <p className="text-sm text-gray-500">Stored in browser localStorage</p>
                  </div>
                  <Badge variant="outline">Local</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>System optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Browser Cache</Label>
                    <p className="text-sm text-gray-500">Local storage and session data</p>
                  </div>
                  <Badge variant="outline" className="text-blue-700 border-blue-200">
                    Active
                  </Badge>
                </div>
                <Button onClick={handleClearCache} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Browser Cache
                </Button>
                <div className="text-xs text-gray-500">
                  This will clear cached data but preserve your settings
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Developer Information</CardTitle>
                <CardDescription>System and development details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Application Version</Label>
                    <p className="text-sm text-gray-500">Current build version</p>
                  </div>
                  <Badge variant="outline">v1.0.0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Environment</Label>
                    <p className="text-sm text-gray-500">Current environment</p>
                  </div>
                  <Badge variant="outline">Development</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Last Updated</Label>
                    <p className="text-sm text-gray-500">Settings last modified</p>
                  </div>
                  <Badge variant="outline">{new Date().toLocaleDateString()}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>Help and resources</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Documentation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  API Reference
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}