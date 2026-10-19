import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf7]">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-agri-600" />
          <p className="text-sm font-medium text-gray-500">Authenticating KrishiSetu session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to user's authorized home
    const roleHomes = {
      FARMER: '/portal/farmer',
      BUYER: '/portal/buyer',
      ADMIN: '/portal/admin',
    };
    return <Navigate to={roleHomes[user?.role] || '/login'} replace />;
  }

  return children;
};
