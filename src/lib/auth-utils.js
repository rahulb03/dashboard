/**
 * Authentication persistence utilities
 * Handles token validation and cross-session persistence
 */

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Token expiration check (handles both JWT and plain string tokens)
export function isTokenExpired(token) {
  if (!token) {
    return true;
  }
  
  // Check if token has JWT format (3 parts separated by dots)
  const tokenParts = token.split('.');
  
  if (tokenParts.length === 3) {
    // This is a JWT token, decode and check expiration
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp) {
        return payload.exp < currentTime;
      } else {
        return false; // No exp claim, consider valid
      }
    } catch (error) {
      return true; // Error decoding, consider expired
    }
  } else {
    // Plain string token, assume it doesn't expire
    return false;
  }
}

// Get stored auth data from localStorage
export function getStoredAuthData() {
  if (!isBrowser) {
    return null;
  }
  
  try {
    const token = localStorage.getItem('token');
    const userDetail = localStorage.getItem('userdetail');
    
    if (!token || !userDetail) {
      return null;
    }
    
    // Check if token is expired
    const tokenExpired = isTokenExpired(token);
    
    if (tokenExpired) {
      clearStoredAuthData();
      return null;
    }
    
    const user = JSON.parse(userDetail);
    return { token, user };
  } catch (error) {
    clearStoredAuthData();
    return null;
  }
}

// Store auth data to localStorage
export function storeAuthData(token, user) {
  if (!isBrowser || !token || !user) {
    return;
  }
  
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('userdetail', JSON.stringify(user));
  } catch (error) {
    // Silent error handling
  }
}

// Clear stored auth data
export function clearStoredAuthData() {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('userdetail');
  } catch (error) {
    // Silent error handling
  }
}

// Debug function to log current auth state
export function debugAuthState() {
  // Silent in production
}

// Validate stored auth data and return clean state
export function validateStoredAuth() {
  const storedAuth = getStoredAuthData();
  
  if (storedAuth) {
    return {
      user: storedAuth.user,
      token: storedAuth.token,
      isAuthenticated: true
    };
  } else {
    return {
      user: null,
      token: null,
      isAuthenticated: false
    };
  }
}
