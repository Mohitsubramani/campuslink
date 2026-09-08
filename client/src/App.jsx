import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PostItemPage from './pages/PostItemPage';
import BrowseItemsPage from './pages/BrowseItemsPage';
import MyPostsPage from './pages/MyPostsPage';
import ListBorrowResourcePage from './pages/ListBorrowResourcePage';
import BrowseBorrowPage from './pages/BrowseBorrowPage';
import BorrowRequestsPage from './pages/BorrowRequestsPage';
import ActiveBorrowsPage from './pages/ActiveBorrowsPage';
import PostGiveawayPage from './pages/PostGiveawayPage';
import BrowseGiveawayPage from './pages/BrowseGiveawayPage';
import GiveawayClaimsPage from './pages/GiveawayClaimsPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AIMatchingPage from './pages/AIMatchingPage';
import AIResourceMatcherPage from './pages/AIResourceMatcherPage';
import SmartSearchPage from './pages/SmartSearchPage';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#ECEFF4] text-[#1D2233]">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Phase 1 Protected Routes */}
          <Route path="/home" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* Phase 2 Lost & Found Protected Routes */}
          <Route path="/lost-found" element={
            <ProtectedRoute>
              <BrowseItemsPage />
            </ProtectedRoute>
          } />

          <Route path="/lost-found/post" element={
            <ProtectedRoute>
              <PostItemPage />
            </ProtectedRoute>
          } />

          <Route path="/my-posts" element={
            <ProtectedRoute>
              <MyPostsPage />
            </ProtectedRoute>
          } />

          {/* Phase 3 Resource Borrowing Protected Routes */}
          <Route path="/borrow" element={
            <ProtectedRoute>
              <BrowseBorrowPage />
            </ProtectedRoute>
          } />

          <Route path="/borrow/list" element={
            <ProtectedRoute>
              <ListBorrowResourcePage />
            </ProtectedRoute>
          } />

          <Route path="/borrow/new" element={<Navigate to="/borrow/list" replace />} />

          <Route path="/borrow/requests" element={
            <ProtectedRoute>
              <BorrowRequestsPage />
            </ProtectedRoute>
          } />

          <Route path="/borrow/active" element={
            <ProtectedRoute>
              <ActiveBorrowsPage />
            </ProtectedRoute>
          } />

          <Route path="/borrow/lent" element={<Navigate to="/borrow/active" replace />} />

          {/* Phase 4 Give Away Protected Routes */}
          <Route path="/giveaway" element={
            <ProtectedRoute>
              <BrowseGiveawayPage />
            </ProtectedRoute>
          } />

          <Route path="/giveaway/post" element={
            <ProtectedRoute>
              <PostGiveawayPage />
            </ProtectedRoute>
          } />

          <Route path="/giveaway/new" element={<Navigate to="/giveaway/post" replace />} />

          <Route path="/giveaway/claims" element={
            <ProtectedRoute>
              <GiveawayClaimsPage />
            </ProtectedRoute>
          } />

          {/* Phase 5 Profile & Notifications Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />

          {/* Phase 6 AI Powerhouse Protected Routes */}
          <Route path="/ai/lost-found-matches" element={
            <ProtectedRoute>
              <AIMatchingPage />
            </ProtectedRoute>
          } />

          <Route path="/ai/resource-matches" element={
            <ProtectedRoute>
              <AIResourceMatcherPage />
            </ProtectedRoute>
          } />

          <Route path="/search" element={
            <ProtectedRoute>
              <SmartSearchPage />
            </ProtectedRoute>
          } />

          {/* Alias / space URL redirects */}
          <Route path="/lost found/post" element={<Navigate to="/lost-found/post" replace />} />
          <Route path="/lost%20found/post" element={<Navigate to="/lost-found/post" replace />} />
          <Route path="/lost found" element={<Navigate to="/lost-found" replace />} />
          <Route path="/lost%20found" element={<Navigate to="/lost-found" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
