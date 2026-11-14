import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_USERS } from '../mock/users';
import { ROLE_NAVIGATION } from '../mock/navigation';
import { useToast } from '../components/ToastContext';
import { authApi } from '../api/authApi';
import { siteConfig } from '../config/siteConfig';

const AuthContext = createContext(null);

const isClientPortalEnabled = () => Boolean(siteConfig.features?.showPublicPortalLogin);
const getFallbackPublicRoute = () => (isClientPortalEnabled() ? '/login' : '/');

const STORAGE_KEY = 'property_group_user_session';
const AUTH_TOKEN_KEY = 'property_group_auth_token';
const REMEMBERED_EMAIL_KEY = 'property_group_remembered_email';
const REGISTERED_CUSTOMERS_KEY = 'property_group_registered_customers';

export const AuthProvider = ({ children }) => {
  // Initialize user strictly from localStorage; default to null if not authenticated
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email && parsed.role) {
          // Clear any cached customer session while public client login is deactivated
          if (parsed.role === 'customer' && !isClientPortalEnabled()) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(AUTH_TOKEN_KEY);
            return null;
          }
          return parsed;
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.clear();
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Ensure active admin has a live backend JWT stored for reliable CRM & quote API operations
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      const existingToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!existingToken) {
        authApi.login('admin@demo.com', 'password123')
          .then((res) => {
            if (res?.token) {
              localStorage.setItem(AUTH_TOKEN_KEY, res.token);
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

  // Fast role switcher for development/testing if needed
  const switchRole = useCallback((newRole) => {
    if (newRole === 'customer' && !isClientPortalEnabled()) {
      return null;
    }
    const roleEmailMap = {
      admin: 'admin@demo.com',
      super_admin: 'admin@demo.com',
      surveyor: 'surveyor@demo.com',
      customer: 'customer@demo.com',
    };
    const targetEmail = roleEmailMap[newRole] || 'admin@demo.com';
    const targetUser = DEMO_USERS[targetEmail];
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(targetUser));

      // Auto-fetch real backend JWT in background for admin API requests
      if (newRole === 'admin' || newRole === 'super_admin') {
        authApi.login('admin@demo.com', 'password123')
          .then((res) => {
            if (res?.token) {
              localStorage.setItem(AUTH_TOKEN_KEY, res.token);
            }
          })
          .catch(() => {});
      }

      return targetUser;
    }
  }, []);

  // Helper to determine the role default redirect path
  const getRoleDashboard = useCallback((role) => {
    if (role === 'customer' && !isClientPortalEnabled()) {
      return '/';
    }
    if (role === 'surveyor') {
      return '/surveyor/my-calendar';
    }
    if (ROLE_NAVIGATION[role]?.defaultPath) {
      return ROLE_NAVIGATION[role].defaultPath;
    }
    return getFallbackPublicRoute();
  }, []);

  // Login handler with real backend API authentication & graceful fallback
  const login = async (email, password, rememberMe = false, redirectTo = null) => {
    setIsLoading(true);

    const trimmedEmail = (email || '').trim().toLowerCase();
    let backendUser = null;
    let authToken = null;

    try {
      const res = await authApi.login(trimmedEmail, password);
      if (res?.token && res?.user) {
        authToken = res.token;
        backendUser = res.user;
        localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      }
    } catch (apiErr) {
      console.warn('Real backend authentication attempt:', apiErr.message);
    }

    let matchedUser = null;

    if (backendUser) {
      const roleLower = (backendUser.role || 'customer').toLowerCase();
      const mappedRole = roleLower === 'admin' ? 'super_admin' : roleLower;
      matchedUser = {
        id: `usr_${backendUser.id}`,
        email: backendUser.email,
        name: backendUser.name,
        role: mappedRole,
        roleLabel: mappedRole === 'super_admin' ? 'Admin' : mappedRole === 'surveyor' ? 'Chartered Surveyor' : 'Property Client',
        company: 'NJS Property Group',
        phone: backendUser.phone || '+44 20 7946 0912',
        avatar: backendUser.avatar || null,
        token: authToken,
      };
    } else {
      // Check demo users fallback
      matchedUser = DEMO_USERS[trimmedEmail];

      if (!matchedUser) {
        try {
          const registered = JSON.parse(localStorage.getItem(REGISTERED_CUSTOMERS_KEY) || '{}');
          if (registered[trimmedEmail]) {
            matchedUser = registered[trimmedEmail];
          }
        } catch {
          // ignore
        }
      }
    }

    if (!matchedUser) {
      setIsLoading(false);
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    if (matchedUser.role === 'customer' && !isClientPortalEnabled()) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setIsLoading(false);
      throw new Error('Client portal login is currently deactivated. Please submit a quote enquiry or contact our office directly.');
    }

    if (!password || password.trim().length < 4) {
      setIsLoading(false);
      throw new Error('Password must be at least 4 characters.');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(matchedUser));

    if (rememberMe) {
      localStorage.setItem(`${REMEMBERED_EMAIL_KEY}_${matchedUser.role}`, trimmedEmail);
      localStorage.setItem(REMEMBERED_EMAIL_KEY, trimmedEmail);
    } else {
      localStorage.removeItem(`${REMEMBERED_EMAIL_KEY}_${matchedUser.role}`);
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    setUser(matchedUser);
    setIsLoading(false);

    addToast({
      type: 'success',
      title: `Welcome, ${matchedUser.name}`,
      message: `Signed in as ${matchedUser.roleLabel || 'User'}`,
    });

    const defaultRolePath = getRoleDashboard(matchedUser.role);

    const isTargetAllowed =
      redirectTo &&
      !redirectTo.includes('/login') &&
      !redirectTo.includes('/403') &&
      (
        matchedUser.role === 'super_admin' ||
        matchedUser.role === 'admin' ||
        (matchedUser.role === 'surveyor' && redirectTo.startsWith('/surveyor')) ||
        (matchedUser.role === 'customer' && redirectTo.startsWith('/customer'))
      );

    const destination = isTargetAllowed ? redirectTo : defaultRolePath;
    navigate(destination, { replace: true });
    return matchedUser;
  };

  // Customer registration
  const registerCustomer = async ({ fullName, email, phone, password = 'password123' }) => {
    if (!isClientPortalEnabled()) {
      setIsLoading(false);
      throw new Error('Client portal registration is currently deactivated. Please submit an enquiry instead.');
    }
    setIsLoading(true);

    const trimmedEmail = (email || '').trim().toLowerCase();

    try {
      await authApi.register({
        name: fullName,
        email: trimmedEmail,
        password,
        phone,
        role: 'CUSTOMER',
      });
    } catch (err) {
      console.warn('Backend registration API note:', err.message);
    }

    const newCustomer = {
      id: 'usr_cust_' + Date.now(),
      email: trimmedEmail,
      name: fullName,
      role: 'customer',
      roleLabel: 'Property Client',
      department: 'Private Client',
      company: 'Private Residential',
      phone,
      currency: 'GBP',
      dateJoined: new Date().toLocaleDateString('en-GB'),
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    try {
      const existing = JSON.parse(localStorage.getItem(REGISTERED_CUSTOMERS_KEY) || '{}');
      existing[trimmedEmail] = newCustomer;
      localStorage.setItem(REGISTERED_CUSTOMERS_KEY, JSON.stringify(existing));
    } catch {
      // ignore
    }

    setIsLoading(false);

    addToast({
      type: 'success',
      title: 'Registration Complete',
      message: 'Account created. You can now sign in.',
    });

    return newCustomer;
  };

  // Logout handler with backend API notification
  const logout = async () => {
    const previousRole = user?.role;
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have been securely signed out.',
    });

    if (previousRole === 'super_admin' || previousRole === 'admin') {
      navigate('/login/admin', { replace: true });
    } else if (previousRole === 'surveyor') {
      navigate('/login/surveyor', { replace: true });
    } else {
      navigate(getFallbackPublicRoute(), { replace: true });
    }
  };

  // Profile update
  const updateProfile = (data) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Your personal details have been saved.',
    });
  };

  const hasRole = useCallback(
    (allowedRoles) => {
      if (!user) return false;
      if (Array.isArray(allowedRoles)) {
        return allowedRoles.includes(user.role);
      }
      return user.role === allowedRoles;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        registerCustomer,
        logout,
        updateProfile,
        switchRole,
        hasRole,
        getRoleDashboard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
