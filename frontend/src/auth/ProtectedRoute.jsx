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
            <span>Verifying session security...</span>
          </div>
        </div>
      </div>
    );
  }

  // 1. Strict Authentication Check: If user is not logged in, redirect to designated portal
  if (!isAuthenticated || !user) {
    const path = location.pathname;
    if (path.startsWith('/admin') || path.startsWith('/superadmin') || path.startsWith('/staff')) {
      return <Navigate to="/login/admin" state={{ from: location }} replace />;
    }
    if (path.startsWith('/surveyor')) {
      return <Navigate to="/login/surveyor" state={{ from: location }} replace />;
    }
    if (path.startsWith('/customer')) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Strict Role Authorization Check:
  const userRole = user.role;
  const isAdmin = userRole === 'super_admin' || userRole === 'admin';

  // Super Admin / Admin has operational authority across system modules
  if (isAdmin) {
    return children ? children : <Outlet />;
  }

  // If specific roles are required, ensure user has permitted role
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // If a Customer attempts to enter Admin or Surveyor routes -> bounce back to Customer portal
    if (userRole === 'customer') {
      return <Navigate to="/customer/my-dashboard" replace />;
    }
    // If a Surveyor attempts to enter Admin or Customer routes -> bounce back to Surveyor portal
    if (userRole === 'surveyor') {
      return <Navigate to="/surveyor/dashboard" replace />;
    }
    return <Navigate to="/403" replace />;
  }

  return children ? children : <Outlet />;
};
