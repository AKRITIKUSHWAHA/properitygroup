import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Loader2, Building2 } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles = null, children }) => {
  const { user, isAuthenticated, isLoading, switchRole } = useAuth();
  const location = useLocation();

  // Auto-align demo session role with the route being visited
  useEffect(() => {
    const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
    if ((location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/admin')) && !isAdmin) {
      switchRole('super_admin');
    } else if (location.pathname.startsWith('/staff') && user?.role !== 'admin_staff' && !isAdmin) {
      switchRole('admin_staff');
    } else if (location.pathname.startsWith('/surveyor') && user?.role !== 'surveyor' && !isAdmin) {
      switchRole('surveyor');
    } else if (location.pathname.startsWith('/customer') && user?.role !== 'customer' && !isAdmin) {
      switchRole('customer');
    }
  }, [location.pathname, user?.role, switchRole]);

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

  const isAdmin = user.role === 'super_admin' || user.role === 'admin';

  // Admin has universal super-user access to all modules across the application
  if (isAdmin) {
    return children ? children : <Outlet />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If accessing an admin route in demo mode, auto-switch to admin instead of throwing 403
    if (location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/admin')) {
      switchRole('super_admin');
      return children ? children : <Outlet />;
    }
    return <Navigate to="/403" replace />;
  }

  return children ? children : <Outlet />;
};
