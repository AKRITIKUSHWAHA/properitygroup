import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2, Building2 } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = null, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#D5DAE2] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B1F4D] flex items-center justify-center text-white shadow-xl shadow-[#0B1F4D]/20">
            <Building2 className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
            <span>Loading UK Property Surveying Practice...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children ? children : <Outlet />;
};
