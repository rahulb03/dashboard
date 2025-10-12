/**
 * Authentication utilities for cookie-based auth
 * Cookies are managed automatically by the browser with httpOnly flags
 */

// Allowed roles for admin frontend access
export const ALLOWED_ADMIN_ROLES = ['ADMIN', 'MANAGER', 'EMPLOYEE'];

// Check if user role is allowed to access admin frontend
export function isValidAdminRole(role) {
  if (!role) return false;
  return ALLOWED_ADMIN_ROLES.includes(role.toUpperCase());
}

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

// Deprecated: No longer needed with cookie-based auth
// Kept for backward compatibility but returns null
export function getStoredAuthData() {
  console.warn('getStoredAuthData is deprecated. Auth is now cookie-based.');
  return null;
}

// Deprecated: No longer needed with cookie-based auth
// Cookies are set by the server with httpOnly flag
export function storeAuthData(token, user) {
  console.warn('storeAuthData is deprecated. Auth tokens are stored in httpOnly cookies by the server.');
  // Do nothing - cookies are managed by the server
}

// Deprecated: No longer needed with cookie-based auth
// Cookies are cleared by the server during logout
export function clearStoredAuthData() {
  console.warn('clearStoredAuthData is deprecated. Cookies are cleared by the server during logout.');
  // Do nothing - cookies are managed by the server
}

// Debug function to log current auth state
export function debugAuthState() {
  // Silent in production
}

// Validate stored auth - with cookies, we rely on the API to validate
// This function is kept for compatibility but doesn't check localStorage
export function validateStoredAuth() {
  // With cookie-based auth, we can't validate on the client side
  // The server will validate the httpOnly cookie
  // Return unauthenticated state - let the app fetch user profile
  return {
    user: null,
    token: null,
    isAuthenticated: false
  };
}
