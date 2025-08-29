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
            <Route path="/" element={<HomePage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route element={<ProtectedLayout/>}> 
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/ai" element={<AITutorPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ClerkProvider>
    </Provider>
  </StrictMode>
);
