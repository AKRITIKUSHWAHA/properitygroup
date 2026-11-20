import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_USERS } from '../mock/users';
import { ROLE_NAVIGATION } from '../mock/navigation';
import { useToast } from '../components/ToastContext';
import { authApi } from '../api/authApi';
import { siteConfig } from '../config/siteConfig';

const AuthContext = createContext(null);

const isClientPortalEnabled = () => true;
const getFallbackPublicRoute = () => '/login';

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
      return targetUser;
    }
  }, []);

  // Helper to determine the role default redirect path
  const getRoleDashboard = useCallback((role) => {
    if (role === 'customer') {
      return '/customer/my-dashboard';
    }
    if (role === 'surveyor') {
      return '/surveyor/my-calendar';
    }
    if (role === 'super_admin' || role === 'admin') {
      return '/admin/dashboard';
    }
    if (ROLE_NAVIGATION[role]?.defaultPath) {
      return ROLE_NAVIGATION[role].defaultPath;
    }
    return '/customer/my-dashboard';
  }, []);

  // Login handler with real backend API authentication & graceful fallback
  const login = async (email, password, rememberMe = false, redirectTo = null, expectedRole = null) => {
    setIsLoading(true);

    const trimmedEmail = (email || '').trim().toLowerCase();

    // Check if account is in local blocked list
    try {
      const blockedList = JSON.parse(localStorage.getItem('property_group_blocked_users') || '[]');
      if (blockedList.includes(trimmedEmail)) {
        setIsLoading(false);
        throw new Error('Your account has been deactivated or blocked by management. Please contact support.');
      }
    } catch (e) {
      if (e.message?.includes('blocked') || e.message?.includes('deactivated')) throw e;
    }

    let backendUser = null;
    let authToken = null;

    try {
      const res = await authApi.login(trimmedEmail, password, expectedRole);
      if (res?.token && res?.user) {
        authToken = res.token;
        backendUser = res.user;
        localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      }
    } catch (apiErr) {
      console.warn('Real backend authentication attempt:', apiErr.message);
      const errMsg = apiErr.message || '';
      // If backend explicitly rejected the login (blocked, inactive, bad password, access denied), STOP and throw!
      if (
        errMsg.includes('blocked') ||
        errMsg.includes('inactive') ||
        errMsg.includes('deactivated') ||
        errMsg.includes('suspended') ||
        errMsg.includes('Invalid') ||
        errMsg.includes('password') ||
        errMsg.includes('Access Denied') ||
        errMsg.includes('strictly') ||
        errMsg.includes('Forbidden') ||
        errMsg.includes('forbidden') ||
        apiErr.status === 403 ||
        apiErr.status === 401 ||
        apiErr.response?.status === 403 ||
        apiErr.response?.status === 401
      ) {
        setIsLoading(false);
        throw new Error(errMsg || 'Your account is blocked or inactive. Please contact administration.');
      }
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
      // Check demo users fallback with strict password verification
      const demoUser = DEMO_USERS[trimmedEmail];
      if (demoUser) {
        const cleanPw = (password || '').trim();
        const validAdmin = (trimmedEmail === 'admin@demo.com' || trimmedEmail === 'njsadmin@gmail.com') && (cleanPw === 'admin123' || cleanPw === 'password123' || cleanPw === 'Password123!');
        const validSurveyor = (trimmedEmail === 'surveyor@demo.com' || trimmedEmail === 'njssurveyor@gmail.com') && (cleanPw === 'surveyor123' || cleanPw === 'password123' || cleanPw === 'Password123!');
        const validCustomer = (trimmedEmail === 'customer@demo.com') && (cleanPw === 'customer123' || cleanPw === 'password123');

        if (!validAdmin && !validSurveyor && !validCustomer) {
          setIsLoading(false);
          throw new Error('Invalid password. Please verify your credentials.');
        }
        matchedUser = demoUser;
      }

      // Check registered customers with exact password verification
      if (!matchedUser) {
        try {
          const registered = JSON.parse(localStorage.getItem(REGISTERED_CUSTOMERS_KEY) || '{}');
          if (registered[trimmedEmail]) {
            const customerObj = registered[trimmedEmail];
            const storedPw = customerObj.password || localStorage.getItem(`njs_user_pw_${trimmedEmail}`);
            if (storedPw && storedPw.trim() !== (password || '').trim()) {
              setIsLoading(false);
              throw new Error('Invalid password. Please enter the password you registered with.');
            }
            matchedUser = customerObj;
          }
        } catch (regErr) {
          if (regErr.message?.includes('password') || regErr.message?.includes('Invalid')) throw regErr;
        }
      }

      // If user does not exist in backend, demo users, or registered customers, strictly reject!
      if (!matchedUser) {
        setIsLoading(false);
        throw new Error('No registered account found with this email. Please create an account first.');
      }
    }

    if (!matchedUser) {
      setIsLoading(false);
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    // ========================================================
    // STRICT PORTAL ROLE ISOLATION
    // Ensures Admin logs in from Admin, Surveyor from Surveyor, Customer from Customer
    // ========================================================
    if (expectedRole) {
      const exp = String(expectedRole).toLowerCase();
      if ((exp === 'super_admin' || exp === 'admin') && matchedUser.role !== 'super_admin' && matchedUser.role !== 'admin') {
        setIsLoading(false);
        throw new Error(
          'Access Denied: This login portal is strictly reserved for NJS Operations & Administrative personnel. Customers please use the Client Portal, and Surveyors use the Surveyor Portal.'
        );
      }
      if (exp === 'surveyor' && matchedUser.role !== 'surveyor') {
        setIsLoading(false);
        throw new Error(
          'Access Denied: This login portal is strictly reserved for RICS Field Surveyors. Customers please use the Client Portal, and Staff use the Admin Portal.'
        );
      }
      if (exp === 'customer' && matchedUser.role !== 'customer' && matchedUser.role !== 'client') {
        setIsLoading(false);
        throw new Error(
          'Access Denied: This portal is strictly for Property Clients. Staff and surveyors please use the Staff Back-Office.'
        );
      }
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
  const registerCustomer = async ({ fullName, email, phone, address, postcode, password = 'password123' }) => {
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
        address,
        postcode,
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
      address: address || '',
      postcode: postcode || '',
      password: password,
      currency: 'GBP',
      dateJoined: new Date().toLocaleDateString('en-GB'),
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    try {
      const existing = JSON.parse(localStorage.getItem(REGISTERED_CUSTOMERS_KEY) || '{}');
      existing[trimmedEmail] = newCustomer;
      localStorage.setItem(REGISTERED_CUSTOMERS_KEY, JSON.stringify(existing));
      // Store exact password for Admin Users & Roles visibility and login verification
      localStorage.setItem(`njs_user_pw_${trimmedEmail}`, password);
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
        setUser,
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
