// Token storage key
const TOKEN_KEY = 'auth_token';

// User interface definition
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin?: boolean;
  phone_num?: string;
  graduate_yr?: number;
}

// Set auth token in localStorage
export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

// Remove auth token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const logout = () => {
  localStorage.removeItem('user');
  window.location.href = '/';
};

// Verify admin status by checking user data and optionally calling backend
export const verifyAdminStatus = async (): Promise<boolean> => {
  try {
    const user = getUser();
    if (!user || !user.isAdmin) {
      return false;
    }
    
    // Optionally, you could add a backend call here to double-check admin status
    // const token = getAuthToken();
    // if (token) {
    //   const response = await fetch('/api/verify-admin', {
    //     headers: getAuthHeaders()
    //   });
    //   return response.ok;
    // }
    
    return true;
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return false;
  }
};
