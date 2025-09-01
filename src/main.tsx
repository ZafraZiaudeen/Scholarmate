import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from './pages/home.page'
import DashboardPage from './pages/dashboard.page'
import { ClerkProvider } from '@clerk/clerk-react';
import SignInPage from './pages/sign-in.page';
import SignUpPage from './pages/sign-up.page';
import ProtectedLayout from './layouts/protected.layout';
import AITutorPage from './pages/ai.page';
import { Provider } from 'react-redux';
import { store } from './lib/store';
import TasksPage from './pages/task.page';
import TaskDetailPage from './pages/questions-for-task.page';
import PastPapersPage from './pages/past-papers.page';
import VideosPage from './pages/videos.page';
import AchievementsPage from './pages/achievements.page';
import AdminProtectedLayout from './layouts/admin-protected.layout';
import AdminLayout from './layouts/admin.layout';
import PapersManagement from './pages/admin/paper.page';
import UsersManagement from './pages/admin/users.page';
import RootLayout from './layouts/root-layout.layout';
import AdminDashboard from './pages/admin/dashboard.page';
import ContactPage from './pages/contact.page';
import AdminContactPage from './pages/admin/contact.page';
import AdminAnalyticsPage from './pages/admin/analytics.page';
import AdminSettingsPage from './pages/admin/settings.page';
import VideosManagement from './pages/admin/videos.page';
import MainLayout from './layouts/main.layout';


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if(!PUBLISHABLE_KEY){
  throw new Error("Add your Clerk Publishable Key to .env file");
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout/>}>

            <Route path="/" element={<HomePage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            
            {/* Public Contact Page - accessible without authentication */}
            <Route element={<MainLayout/>}>
              <Route path="/contact" element={<ContactPage />} />
            </Route>
            
            <Route element={<ProtectedLayout/>}>
            <Route element={<MainLayout/>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/ai" element={<AITutorPage />} />
              <Route path="/task" element={<TasksPage/>} />
              <Route path="/task/:taskId" element={<TaskDetailPage />} />
              <Route path="/past-papers" element={<PastPapersPage />} />
              <Route path="/videos" element={<VideosPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/dashboard/*" element={<DashboardPage/>} />
            </Route>
             </Route>
            {/* Admin Routes */}
            <Route element={<AdminProtectedLayout />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard/>} />
                <Route path="/admin/dashboard" element={<AdminDashboard/>} />
                <Route path="/admin/papers" element={<PapersManagement />} />
                <Route path="/admin/users" element={<UsersManagement />} />
                <Route path="/admin/contacts" element={<AdminContactPage />} />
                <Route path="/admin/videos" element={<VideosManagement />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage/>} />
              </Route>
            </Route>
         
            <Route path="*" element={<h1 className='text-center mt-20 text-3xl font-bold text-red-600'>404 - Page Not Found</h1>} />
</Route>
          </Routes>
        </BrowserRouter>
      </ClerkProvider>
    </Provider>
  </StrictMode>
);
