# Export Empty Data Fix - Null Filter Values

## Problem

When exporting sessions, the API call was returning 0 sessions due to passing `phoneNumber=null` as a string in the URL:

```
https://api.onegred.com/api/admin/tracking/sessions?offset=0&includeSteps=false&status=all&dateRange=7d&phoneNumber=null
```

The backend was treating `"null"` as a literal string filter, which matched no sessions.

## Root Cause

The Redux state has initial filter values including:
```javascript
sessionsFilters: {
  status: 'all',
  dateRange: '7d',
  phoneNumber: null,  // ← This was being stringified
  includeSteps: false
}
```

When spread into URL parameters, `null` was being converted to the string `"null"` instead of being omitted.

## Solution

Updated `exportSessionsThunk` in `trackingThunks.js` to filter out null/empty values before building the API request:

```javascript
// Before
const params = new URLSearchParams({
  offset: '0',
  includeSteps: 'true',
  ...filters  // ← Included phoneNumber: null
});

// After
const cleanFilters = {};
Object.entries(filters).forEach(([key, value]) => {
  if (value !== null && value !== undefined && value !== '' && value !== 'null') {
    cleanFilters[key] = value;
  }
});

const params = new URLSearchParams({
  offset: '0',
  includeSteps: 'false',
  ...cleanFilters  // ← Only includes valid filter values
});
```

## Changes Made

### File: `src/redux/tracking/trackingThunks.js`

**Lines 321-336** - Added filter cleaning logic:

```javascript
export const exportSessionsThunk = createAsyncThunk(
  'tracking/exportSessions',
  async ({ filters = {} } = {}, { rejectWithValue }) => {
    try {
      // Only include non-null, non-empty filter values
      const cleanFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '' && value !== 'null') {
          cleanFilters[key] = value;
        }
      });
      
      const params = new URLSearchParams({
        offset: '0',
        includeSteps: 'false',
        ...cleanFilters
      });
      // ... rest of export logic
    }
  }
);
```

## Additional Improvement

Also changed `includeSteps` from `'true'` to `'false'` in the export to make it faster, since step details aren't needed in the CSV export.

## Result

### Before (Broken)
```
API Call: ?offset=0&includeSteps=false&status=all&dateRange=7d&phoneNumber=null
Response: { data: [] }  ← Empty because phoneNumber filter was active
```

### After (Fixed)
```
API Call: ?offset=0&includeSteps=false&status=all&dateRange=7d
Response: { data: [session1, session2, ...] }  ← Returns all sessions
```

## Testing

1. **Without Phone Filter**:
   - Open Tracking > Sessions
   - Don't enter any phone number search
   - Click Export
   - ✅ Should export all sessions matching current filters

2. **With Phone Filter**:
   - Enter a phone number in search
   - Click search button
   - Click Export
   - ✅ Should export only matching phone numbers

3. **After Clearing Search**:
   - Clear phone number search
   - Click Export
   - ✅ Should export all sessions again

## Similar Issues Prevented

This fix also handles:
- `status: null` - Won't filter by status if null
- `dateRange: null` - Won't filter by date if null
- `undefined` values - Won't be included in params
- Empty strings `''` - Won't be included in params
- String `'null'` - Won't be included in params (safety check)

## Code Pattern

This pattern can be reused anywhere you're building URL params from filters:

```javascript
// Reusable filter cleaner
const cleanFilters = (filters) => {
  const clean = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '' && value !== 'null') {
      clean[key] = value;
    }
  });
  return clean;
};

// Usage
const params = new URLSearchParams({
  ...defaultParams,
  ...cleanFilters(userFilters)
});
```

## Summary

**Fixed**: Export now works correctly by excluding `null`, `undefined`, empty strings, and the string `"null"` from API query parameters.

**Impact**: All tracking session exports now work regardless of which filters are set or cleared.

**Performance**: Also improved by setting `includeSteps: false` for faster exports.

✅ Export now returns actual session data instead of empty results!
