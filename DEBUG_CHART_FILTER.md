# Debug Chart Filter - Console Testing Guide

## 🔍 How to Debug

### Step 1: Open Browser Console
1. Press `F12` (or right-click → Inspect)
2. Go to **Console** tab
3. Clear console (`Ctrl+L` or click 🚫)

### Step 2: What to Look For

When you **change the date range dropdown**, you should see:

```
========================================
🔍 BarGraph - RECALCULATING CHART DATA
========================================
State: { dateRange: '7', groupBy: 'day' }
trackingSessions: 100

📊 Using API session data: 100 sessions

📊 Date Range Filter:
  - Selected range: Last 7 days
  - Total sessions: 100
  - Filtered sessions: 15
  - Date range in data: 10/6/2025 to 10/12/2025

📊 Final chart data: 7 entries
```

### Step 3: Test Each Filter

#### Test "Last 7 days"
1. Select "Last 7 days" from dropdown
2. Check console: Should say "Last 7 days"
3. Check console: "Final chart data: 7 entries" (or less)
4. Check chart: Should show max 7 bars
5. Check badge: Should show "7d | Day | 7 pts"

#### Test "Last 14 days"
1. Select "Last 14 days"
2. Check console: Should say "Last 14 days"
3. Check console: "Final chart data: 14 entries" (or less)
4. Check chart: Should show max 14 bars
5. Check badge: Should show "14d | Day | 14 pts"

#### Test "All time"
1. Select "All time"
2. Check console: Should say "All time"
3. Check console: "Final chart data: X entries" (where X = all data)
4. Check chart: Should show all bars
5. Check badge: Should show "All time | Day | X pts"

---

## 🐛 If Filter STILL Not Working

### Check 1: Is useMemo Recalculating?
Look for this in console:
```
========================================
🔍 BarGraph - RECALCULATING CHART DATA
========================================
```

- **If YES:** Good! State is updating, proceed to Check 2
- **If NO:** Problem! Component not re-rendering. Try:
  - Hard refresh (`Ctrl+Shift+R`)
  - Clear browser cache
  - Check if React DevTools shows state changing

### Check 2: Is Data Being Filtered?
Look for this in console:
```
📊 Date Range Filter:
  - Selected range: Last 7 days
  - Total sessions: 100
  - Filtered sessions: 15  ← Should change!
```

- **If "Filtered sessions" CHANGES:** Good! Filter working
- **If "Filtered sessions" STAYS SAME:** Problem! Date logic broken

### Check 3: Is Chart Updating?
Look for this in console:
```
📊 Final chart data: 7 entries  ← Should match filter!
```

- **If number matches date range:** Good! Data correct
- **If number doesn't match:** Problem! Grouping or rendering issue

### Check 4: Visual Indicators
**Look at the badge** next to chart title:
```
Session Analytics Trends  [7d | Day | 7 pts]
                              ↑    ↑     ↑
                           Range Group Points
```

- Badge should update when you change dropdown
- If badge changes but chart doesn't → rendering issue
- If badge doesn't change → state not updating

---

## 🔧 Manual Fix Tests

### Test 1: Force Refresh
Run in console:
```javascript
window.location.reload(true);
```

### Test 2: Check React State
Install React DevTools, then:
1. Find `BarGraph` component
2. Check state/hooks:
   - `dateRange` should be '7', '14', '30', or 'all'
   - `groupBy` should be 'day' or 'week'
3. Change dropdown and verify state updates

### Test 3: Log chartData
Run in console after changing filter:
```javascript
// Find the chart component in React DevTools
// Check the chartData memo value
// It should have length matching your filter
```

---

## 📊 Expected Console Output

### When Selecting "Last 7 days"

```
========================================
🔍 BarGraph - RECALCULATING CHART DATA
========================================
State: { dateRange: '7', groupBy: 'day' }
trackingSessions: 100

📊 Using API session data: 100 sessions

📊 Date Range Filter:
  - Selected range: Last 7 days
  - Total sessions: 100
  - Filtered sessions: 15
  - Date range in data: 10/6/2025 to 10/12/2025

📊 Final chart data: 7 entries
```

### When Selecting "All time"

```
========================================
🔍 BarGraph - RECALCULATING CHART DATA
========================================
State: { dateRange: 'all', groupBy: 'day' }
trackingSessions: 100

📊 Using API session data: 100 sessions

📊 Date Range Filter:
  - Selected range: All time
  - Total sessions: 100
  - Filtered sessions: 100  ← Should be SAME as total
  
📊 Final chart data: 45 entries  ← All unique days
```

---

## 🎯 Quick Checklist

When you change the date range, verify:

1. [ ] Console shows "RECALCULATING CHART DATA"
2. [ ] "Selected range" matches what you picked
3. [ ] "Filtered sessions" changes appropriately
4. [ ] "Final chart data" matches expected number
5. [ ] Badge updates (e.g., "7d | Day | 7 pts")
6. [ ] Chart visually shows correct number of bars
7. [ ] X-axis labels match date range
8. [ ] No errors in console

---

## 💡 Common Issues

### Issue 1: Console shows calculation but chart doesn't update
**Cause:** Chart not re-rendering
**Fix:** Added `key={dateRange-groupBy}` to BarChart (already done)

### Issue 2: "Filtered sessions" is always same as "Total sessions"
**Cause:** Date filter not working
**Fix:** Check date comparison logic (already fixed)

### Issue 3: Badge updates but chart shows wrong data
**Cause:** chartData calculation issue
**Fix:** Check useMemo dependencies (already includes dateRange, groupBy)

### Issue 4: Dropdown selection doesn't trigger update
**Cause:** onValueChange not calling setState
**Fix:** Verify `<Select value={dateRange} onValueChange={setDateRange}>` (already correct)

---

*Debug Guide Created: 2025-10-12*
