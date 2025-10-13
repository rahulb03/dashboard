# Role-Based Access Control (RBAC)

## 🔐 Overview

The dashboard now restricts sign-in access to specific roles only. **Only users with ADMIN, MANAGER, or EMPLOYEE roles can sign in**. Users with the USER role are denied access.

---

## ✅ Allowed Roles

| Role | Access | Description |
|------|--------|-------------|
| **ADMIN** | ✅ Full Access | Administrator with all privileges |
| **MANAGER** | ✅ Full Access | Manager with management privileges |
| **EMPLOYEE** | ✅ Full Access | Employee with standard access |
| **USER** | ❌ Denied | Regular users cannot access dashboard |

---

## 🚫 Blocked Roles

- **USER** - Regular users are blocked from signing in
- Any role not in the allowed list is denied access

---

## 🔧 Implementation Details

### File Modified
`src/redux/auth/authThunks.js`

### Changes Made

#### 1. Login Function (`login` thunk)

**Role Validation Added:**
```javascript
// ROLE VALIDATION: Only allow ADMIN, MANAGER, and EMPLOYEE
const allowedRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
const userRole = user.role || user.userRole || user.type;

if (!allowedRoles.includes(userRole)) {
  return rejectWithValue(
    `Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can sign in to the dashboard. Your role: ${userRole || 'USER'}`
  );
}
```

**What happens:**
- After successful API authentication
- Before storing user data
- Checks user's role against allowed list
- Rejects with clear error message if role is not allowed
- Works for both real API and mock authentication

#### 2. Profile Fetch Function (`getProfile` thunk)

**Role Validation Added:**
```javascript
// ROLE VALIDATION: Check if user has allowed role
const allowedRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE'];
const userRole = user.role || user.userRole || user.type;

if (!allowedRoles.includes(userRole)) {
  throw new Error(
    `Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can access the dashboard. Your role: ${userRole || 'USER'}`
  );
}
```

**What happens:**
- Validates role when fetching user profile
- Prevents unauthorized users from accessing dashboard via session/cookie
- Blocks users who might have valid session but wrong role

---

## 🎯 User Experience

### For Allowed Roles (ADMIN, MANAGER, EMPLOYEE)

#### Sign In Flow:
1. Enter email and password
2. Click "Sign In"
3. ✅ **Successfully authenticated**
4. ✅ Role validation passes
5. ✅ Redirected to `/dashboard/overview`
6. ✅ Toast: "Signed In Successfully!"

### For Blocked Roles (USER)

#### Sign In Flow:
1. Enter email and password
2. Click "Sign In"
3. ⚠️ **Authentication successful** (credentials are correct)
4. ❌ **Role validation fails**
5. ❌ Sign-in rejected
6. ❌ Toast: "Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can sign in to the dashboard. Your role: USER"
7. User remains on sign-in page

---

## 📱 Error Messages

### Login Error Message
```
Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can sign in to the dashboard. Your role: USER
```

### Profile Fetch Error Message
```
Access denied. Only ADMIN, MANAGER, and EMPLOYEE roles can access the dashboard. Your role: USER
```

**Message Format:**
- Clear and informative
- States what roles are allowed
- Shows the user's current role
- Explains why access is denied

---

## 🧪 Testing Scenarios

### Test Case 1: ADMIN Login
**Given:** User has ADMIN role
**When:** User signs in with valid credentials
**Then:**
- ✅ Authentication succeeds
- ✅ Role validation passes
- ✅ User is logged in
- ✅ Redirected to dashboard

### Test Case 2: MANAGER Login
**Given:** User has MANAGER role
**When:** User signs in with valid credentials
**Then:**
- ✅ Authentication succeeds
- ✅ Role validation passes
- ✅ User is logged in
- ✅ Redirected to dashboard

### Test Case 3: EMPLOYEE Login
**Given:** User has EMPLOYEE role
**When:** User signs in with valid credentials
**Then:**
- ✅ Authentication succeeds
- ✅ Role validation passes
- ✅ User is logged in
- ✅ Redirected to dashboard

### Test Case 4: USER Login (Blocked)
**Given:** User has USER role
**When:** User signs in with valid credentials
**Then:**
- ✅ Authentication succeeds (credentials are valid)
- ❌ Role validation fails
- ❌ User is NOT logged in
- ❌ Error message shown
- ❌ Remains on sign-in page

### Test Case 5: Direct Dashboard Access (with USER session)
**Given:** User with USER role has valid session cookie
**When:** User tries to access `/dashboard/overview` directly
**Then:**
- ❌ Profile fetch fails with role validation error
- ❌ User is logged out
- ❌ Redirected to sign-in page
- ❌ Error message shown

### Test Case 6: Invalid Credentials
**Given:** User enters wrong email/password
**When:** User clicks sign in
**Then:**
- ❌ Authentication fails
- ❌ Standard login error shown
- ❌ No role validation (happens before that)

---

## 🔍 Technical Details

### Role Field Detection
The validation checks multiple possible field names for the role:
```javascript
const userRole = user.role || user.userRole || user.type;
```

**Supported field names:**
- `role` (primary)
- `userRole` (alternative)
- `type` (fallback)

### Validation Points
Role validation occurs at **two critical points**:

1. **Login Time**
   - During `login` thunk execution
   - After API authentication
   - Before setting user state

2. **Session Validation**
   - During `getProfile` thunk execution
   - When app initializes
   - On dashboard page access

### Security Considerations

✅ **Server-Side Validation**
- The API should also validate roles server-side
- This client-side validation is an additional layer
- Never rely solely on client-side validation

✅ **Session Hijacking Prevention**
- Role validation on profile fetch prevents session reuse
- Even with valid cookie, wrong role is rejected

✅ **Clear Error Messages**
- Users understand why access is denied
- Shows their current role
- No confusion about access rules

---

## 🛠️ Customization

### To Add More Allowed Roles

Edit `allowedRoles` array in both locations:

```javascript
// In login function (line ~21)
const allowedRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPERVISOR'];

// In getProfile function (line ~107)
const allowedRoles = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'SUPERVISOR'];
```

### To Change Allowed Roles

Replace the array with different roles:

```javascript
// Example: Only allow ADMIN and MANAGER
const allowedRoles = ['ADMIN', 'MANAGER'];
```

### To Customize Error Messages

Edit the `rejectWithValue` strings:

```javascript
return rejectWithValue(
  `Your custom error message here. Role: ${userRole}`
);
```

---

## 📊 Flow Diagram

```
User Enters Credentials
        ↓
API Authentication
        ↓
    Success?
    ↙     ↘
  No      Yes
   ↓        ↓
Error   Get User Data
         ↓
    Check Role
         ↓
  Role in [ADMIN, MANAGER, EMPLOYEE]?
    ↙              ↘
  No              Yes
   ↓               ↓
Access           Login
Denied          Success
   ↓               ↓
Error          Dashboard
Message         Access
   ↓
Stay on
Sign-in
Page
```

---

## 🔐 Best Practices

### 1. Server-Side Validation (Critical)
Always implement role validation on the API server:
```javascript
// Backend example (Node.js/Express)
if (!['ADMIN', 'MANAGER', 'EMPLOYEE'].includes(user.role)) {
  return res.status(403).json({ message: 'Access denied' });
}
```

### 2. Consistent Role Names
Ensure role names match across:
- Database
- API responses
- Frontend validation

### 3. Clear Error Messages
Always inform users:
- Why access is denied
- What roles are allowed
- Their current role

### 4. Logging and Monitoring
Log denied access attempts:
```javascript
console.warn(`Access denied for user ${user.email} with role ${userRole}`);
```

---

## 📝 Checklist

After implementing RBAC, verify:

- [ ] ADMIN users can sign in
- [ ] MANAGER users can sign in
- [ ] EMPLOYEE users can sign in
- [ ] USER users cannot sign in
- [ ] Error message is clear and helpful
- [ ] Profile fetch validates roles
- [ ] Direct dashboard access is blocked for USER role
- [ ] Existing sessions are validated
- [ ] Server-side validation exists (critical!)

---

## 🚨 Troubleshooting

### Issue: All users are blocked
**Cause:** Role field name mismatch
**Solution:** Check `user.role` field in API response. Update detection:
```javascript
const userRole = user.role || user.userRole || user.customRoleField;
```

### Issue: USER role can still access
**Cause:** Role validation not applied in both places
**Solution:** Ensure validation exists in:
1. `login` thunk (line ~21)
2. `getProfile` thunk (line ~107)

### Issue: Error message doesn't show
**Cause:** Error not properly caught in UI
**Solution:** Check `user-auth-form.jsx` error handling

### Issue: Role field is undefined
**Cause:** API not returning role data
**Solution:** Verify API response includes role field:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "ADMIN"  // ← Must be present
  }
}
```

---

## 📚 Related Files

- `src/redux/auth/authThunks.js` - Role validation logic
- `src/lib/auth.jsx` - Auth context (error handling)
- `src/features/auth/components/user-auth-form.jsx` - Login form
- `src/components/auth/auth-guard.jsx` - Route protection

---

*Implemented on: 2025-10-13*
*Status: ✅ Active*
