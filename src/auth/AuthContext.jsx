import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_USERS } from '../mock/users';
import { ROLE_NAVIGATION } from '../mock/navigation';
import { useToast } from '../components/ToastContext';

const AuthContext = createContext(null);

const STORAGE_KEY = 'property_group_user_session';
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
          return parsed;
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    sessionStorage.clear();
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Fast role switcher for development/testing if needed
  const switchRole = useCallback((newRole) => {
    const roleEmailMap = {
      admin: 'admin@demo.com',
      super_admin: 'admin@demo.com',
      admin_staff: 'admin@demo.com',
      surveyor: 'surveyor@demo.com',
      customer: 'customer@demo.com',
    };
    const targetEmail = roleEmailMap[newRole] || 'admin@demo.com';
    const targetUser = DEMO_USERS[targetEmail];
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(targetUser));
      return targetUser;
    }
  }, []);

  // Helper to determine the role default redirect path
  const getRoleDashboard = useCallback((role) => {
    if (ROLE_NAVIGATION[role]?.defaultPath) {
      return ROLE_NAVIGATION[role].defaultPath;
    }
    return '/login';
  }, []);

  // Login handler with optional return redirection
  const login = async (email, password, rememberMe = false, redirectTo = null) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 500));

    const trimmedEmail = (email || '').trim().toLowerCase();

    // Check demo users first
    let matchedUser = DEMO_USERS[trimmedEmail];

    // If not found in demo users, check registered customers
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

    if (!matchedUser) {
      setIsLoading(false);
      throw new Error('Invalid email or password. Please verify your credentials or register.');
    }

    if (!password || password.trim().length < 4) {
      setIsLoading(false);
      throw new Error('Password must be at least 4 characters.');
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(matchedUser));

    if (rememberMe) {
      localStorage.setItem(REMEMBERED_EMAIL_KEY, trimmedEmail);
    } else {
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }

    setUser(matchedUser);
    setIsLoading(false);

    addToast({
      type: 'success',
      title: `Welcome, ${matchedUser.name}`,
      message: `Signed in as ${matchedUser.roleLabel} (${matchedUser.company})`,
    });

    const defaultRolePath = getRoleDashboard(matchedUser.role);
    
    // Check if redirectTo is compatible with the logged-in role
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
  const registerCustomer = async ({ fullName, email, phone, postcode }) => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 800));

    const trimmedEmail = (email || '').trim().toLowerCase();

    if (DEMO_USERS[trimmedEmail]) {
      setIsLoading(false);
      throw new Error('An account with this email address already exists.');
    }

    const newCustomer = {
      id: 'usr_cust_' + Date.now(),
      email: trimmedEmail,
      name: fullName,
      role: 'customer',
      roleLabel: 'Property Client',
      department: 'Private Client',
      company: 'Private Residential',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      phone: phone || '+44 7700 900000',
      postcode: postcode || 'SW1A 1AA',
      currency: 'GBP',
      dateJoined: new Date().toLocaleDateString('en-GB'),
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    };

    try {
      const registered = JSON.parse(localStorage.getItem(REGISTERED_CUSTOMERS_KEY) || '{}');
      registered[trimmedEmail] = newCustomer;
      localStorage.setItem(REGISTERED_CUSTOMERS_KEY, JSON.stringify(registered));
    } catch (e) {
      console.error(e);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCustomer));
    setUser(newCustomer);
    setIsLoading(false);

    addToast({
      type: 'success',
      title: 'Customer Account Created',
      message: `Welcome to NJS Property Group, ${fullName}!`,
    });

    navigate('/customer/my-dashboard', { replace: true });
    return newCustomer;
  };

  // Forgot Password
  const forgotPassword = async () => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 700));
    setIsLoading(false);
    return { success: true };
  };

  // Reset Password
  const resetPassword = async () => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 700));
    setIsLoading(false);
    return { success: true };
  };

  // Logout handler
  const logout = () => {
    const previousRole = user?.role;
    localStorage.removeItem(STORAGE_KEY);
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
      navigate('/login', { replace: true });
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
      message: 'Your personal details have been saved successfully.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchRole,
        registerCustomer,
        forgotPassword,
        resetPassword,
        updateProfile,
        getRoleDashboard,
        getRememberedEmail: () => localStorage.getItem(REMEMBERED_EMAIL_KEY) || '',
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
