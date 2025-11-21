import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import AuctionCreatePage from '@/pages/AuctionCreatePage'
import AuctionDetailPage from '@/pages/AuctionDetailPage'
import AuctionListPage from '@/pages/AuctionListPage'
import AuctionManagementPage from '@/pages/AuctionManagementPage'
import DealerPurchaseCenter from '@/pages/DealerPurchaseCenter'
import DataAnalyticsPage from '@/pages/DataAnalyticsPage'
import ContentDisplayPage from '@/pages/ContentDisplayPage'
import UserProfilePage from '@/pages/UserProfilePage'
import AdminUserManagementPage from '@/pages/AdminUserManagementPage'
import AccessDeniedPage from '@/pages/AccessDeniedPage'
import NotFoundPage from '@/pages/NotFoundPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auctions" element={<AuctionListPage />} />
        <Route path="/auction/create" element={<AuctionCreatePage />} />
        <Route path="/auction/:id" element={<AuctionDetailPage />} />
        <Route path="/auction/manage" element={<AuctionManagementPage />} />
        <Route path="/dealer-center" element={<DealerPurchaseCenter />} />
        <Route path="/admin/users" element={<AdminUserManagementPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route path="/analytics" element={<DataAnalyticsPage />} />
        <Route path="/content-display" element={<ContentDisplayPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}

export default App