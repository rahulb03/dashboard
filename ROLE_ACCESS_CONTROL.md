# Role-Based Access Control for Admin Frontend

## Overview
This document describes the implementation of role-based access control to prevent users with the `USER` role from accessing the admin frontend dashboard. Only users with `ADMIN`, `MANAGER`, or `EMPLOYEE` roles can access this admin dashboard.

## Implementation Details

### 1. **Allowed Roles**
The following roles are permitted to access the admin frontend:
- `ADMIN`
- `MANAGER`
- `EMPLOYEE`

Any user with role `USER` (or any other unauthorized role) will be denied access, and their authentication data will be cleared.

### 2. **Modified Files**

#### `src/lib/auth-utils.js`
- Added `ALLOWED_ADMIN_ROLES` constant array
- Added `isValidAdminRole(role)` function to validate user roles
- Updated `getStoredAuthData()` to check role validity and clear localStorage if invalid
- Updated `validateStoredAuth()` to double-check role validation

#### `src/redux/auth/authSlice.js`
- Imported `isValidAdminRole` function
- Updated `login.fulfilled` case to validate role before setting authentication
- Updated `signup.fulfilled` case to validate role before setting authentication
- Updated `REHYDRATE` case to validate role when restoring persisted state
- Invalid roles trigger auth clearing and error message

#### `src/components/auth/auth-guard.jsx`
- Imported `isValidAdminRole` and `clearStoredAuthData`
- Added role validation check after authentication verification
- Shows toast error and redirects to sign-in if invalid role detected
- Clears localStorage when invalid role is found

#### `src/lib/auth.jsx`
- Updated `loginUser` function to handle role validation errors
- Improved error message handling for role-based access denial

#### `src/redux/auth/authThunks.js`
- Added documentation comment explaining role validation is handled in reducer

### 3. **Security Flow**

#### On Login:
1. User submits credentials via sign-in form
2. Login request is sent to backend
3. Backend returns token and user data (including role)
4. `authSlice.js` receives the response in `login.fulfilled`
5. Role is validated using `isValidAdminRole()`
6. If role is invalid:
   - Authentication is rejected
   - localStorage is cleared
   - Error message is set
   - User stays on login page
7. If role is valid:
   - Token and user are stored in Redux
   - Token and user are synced to localStorage
   - User is redirected to dashboard

#### On Page Load/Refresh:
1. Redux persist attempts to rehydrate state
2. `REHYDRATE` action is triggered in `authSlice.js`
3. Persisted auth data is validated:
   - Token expiration is checked
   - User role is validated
4. If role is invalid:
   - Auth state is cleared
   - localStorage is cleared
5. `AuthGuard` component performs additional validation
6. If user has invalid role:
   - Toast error is shown
   - Redirected to sign-in page
   - localStorage is cleared

#### During Navigation:
1. `AuthGuard` checks authentication on every route change
2. If authenticated, role is validated
3. Invalid roles are immediately logged out and redirected

### 4. **Error Messages**
When a user with invalid role attempts to access the dashboard:
- **Error Message**: "Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can access this dashboard."
- **Console Warning**: "Unauthorized role detected. Clearing authentication data."

### 5. **Testing Scenarios**

#### Test 1: Login with USER role
1. Login with credentials that have `role: USER`
2. Expected: Login fails, error message shown, localStorage cleared

#### Test 2: Login with ADMIN role
1. Login with credentials that have `role: ADMIN`
2. Expected: Login succeeds, redirected to dashboard

#### Test 3: Existing USER token in localStorage
1. Manually set localStorage with USER role token
2. Refresh page
3. Expected: Auth cleared, redirected to login

#### Test 4: Token from regular frontend to admin frontend
1. Login to regular (user) frontend
2. Navigate to admin frontend URL
3. Expected: Auth cleared on page load, redirected to login

### 6. **Benefits**
- **Multi-layered protection**: Validation at multiple points (localStorage, Redux, AuthGuard)
- **Automatic cleanup**: Invalid auth data is automatically cleared
- **User-friendly**: Clear error messages inform users why access is denied
- **Persistent**: Works across page refreshes and browser sessions
- **Secure**: Prevents unauthorized access even if token is manually copied to localStorage

### 7. **Configuration**
To modify allowed roles, edit the `ALLOWED_ADMIN_ROLES` array in `src/lib/auth-utils.js`:

```javascript
export const ALLOWED_ADMIN_ROLES = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
```

To add a new role, simply add it to this array (in uppercase):

```javascript
export const ALLOWED_ADMIN_ROLES = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPERVISOR'];
```

## Notes
- Role validation is case-insensitive (converted to uppercase)
- All validation checks clear localStorage immediately upon detecting invalid role
- The implementation works seamlessly with existing authentication flow
- No breaking changes to existing authenticated users with valid roles
