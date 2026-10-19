import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Public & Auth Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Farmer Pages
import { FarmerDashboardPage } from '../pages/farmer/FarmerDashboardPage';
import { FarmsPage } from '../pages/farmer/FarmsPage';
import { CropsPage } from '../pages/farmer/CropsPage';
import { AiCropPage } from '../pages/farmer/AiCropPage';
import { DiseasePage } from '../pages/farmer/DiseasePage';
import { WeatherPage } from '../pages/farmer/WeatherPage';
import { IrrigationPage } from '../pages/farmer/IrrigationPage';
import { ListingsPage } from '../pages/farmer/ListingsPage';
import { OrdersPage } from '../pages/farmer/OrdersPage';
import { AnalyticsPage } from '../pages/farmer/AnalyticsPage';
import { AssistantPage } from '../pages/farmer/AssistantPage';
import { ConsultationsPage } from '../pages/farmer/ConsultationsPage';
import { SchemesPage } from '../pages/farmer/SchemesPage';

// Buyer Pages
import { BuyerDashboardPage } from '../pages/buyer/BuyerDashboardPage';
import { BuyerMatchPage } from '../pages/buyer/BuyerMatchPage';

// Expert Pages
import { ExpertDashboardPage } from '../pages/expert/ExpertDashboardPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Portal Routes */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Farmer Domain */}
        <Route
          path="farmer"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <FarmerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/farms"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <FarmsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/crops"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <CropsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/ai-crop"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <AiCropPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/disease"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <DiseasePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/weather"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <WeatherPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/irrigation"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <IrrigationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/listings"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <ListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/orders"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/analytics"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/assistant"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <AssistantPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/consultations"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <ConsultationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="farmer/schemes"
          element={
            <ProtectedRoute allowedRoles={['FARMER']}>
              <SchemesPage />
            </ProtectedRoute>
          }
        />

        {/* Buyer Domain */}
        <Route
          path="buyer"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <BuyerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="buyer/marketplace"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <BuyerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="buyer/match"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <BuyerMatchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="buyer/orders"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <BuyerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="buyer/shipments"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <BuyerDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Agriculture Expert Domain */}
        <Route
          path="expert"
          element={
            <ProtectedRoute allowedRoles={['AGRICULTURE_EXPERT']}>
              <ExpertDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="expert/cases"
          element={
            <ProtectedRoute allowedRoles={['AGRICULTURE_EXPERT']}>
              <ExpertDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Domain */}
        <Route
          path="admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
