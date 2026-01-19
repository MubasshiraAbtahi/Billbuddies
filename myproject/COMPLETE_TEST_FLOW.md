# Bill Buddies - Complete End-to-End Testing Instructions

## 🎯 Objective
Verify that the Bill Buddies application works end-to-end from user authentication through expense tracking, balance calculations, and payment settlement.

---

## 📋 Pre-Test Checklist

Before starting tests, ensure:
- [ ] MongoDB is running (local or remote)
- [ ] No other services using ports 5000 or 3000
- [ ] Latest code pulled/saved
- [ ] Browser DevTools open (F12) for debugging
- [ ] Fresh test user accounts (can create during testing)

---

## Phase 1: Setup & Verification (15 minutes)

### Step 1.1: Project Validation
```bash
# From project root directory
node validate-setup.js
```

**Expected Output:**
- ✅ All files present in Backend Setup
- ✅ All files present in Frontend Setup
- ✅ All packages installed
- ✅ Summary shows "All validations passed"

**If validation fails:**
- Install dependencies: `cd backend && npm install && cd ../frontend && npm install`
- Check missing files are created
- Re-run validation

---

### Step 1.2: Start Backend Server
```bash
cd backend
node server.js
```

**Expected Output:**
```
Connected to MongoDB
Server running on http://localhost:5000
```

**If connection fails:**
- Verify MongoDB is running: `mongod` or check Atlas connection
- Check `.env` file has correct MongoDB URI
- Ensure firewall allows port 5000

---

### Step 1.3: Start Frontend Server (New Terminal)
```bash
cd frontend
npm start
```

**Expected Output:**
- Browser opens to `http://localhost:3000`
- React app loads without errors in console
- Login page displays

**If frontend fails:**
- Check console (F12) for errors
- Ensure backend is running (should see network requests)
- Clear browser cache: Ctrl+Shift+Delete

---

## Phase 2: User Authentication (20 minutes)

### Test 2.1: User Signup
**Scenario:** Create first test user

1. On Login page, click "Create an account"
2. Fill form:
   - First Name: `Test`
   - Last Name: `User1`
   - Email: `test1+${Date.now()}@example.com` (unique email)
   - Phone: `555-0001`
   - Password: `TestPass123!`
3. Click "Create Account"

**Verify:**
- ✅ Toast message: "Account created successfully"
- ✅ Redirected to Dashboard
- ✅ Page loads without errors
- ✅ Token in localStorage (DevTools → Application → Storage → localStorage → token)

---

### Test 2.2: Logout & Re-login
**Scenario:** Test session persistence

1. Click profile avatar → "Logout"
2. Verify redirected to Login page
3. Enter email and password from Test 2.1
4. Click "Sign In"

**Verify:**
- ✅ Toast message: "Logged in successfully"
- ✅ Redirected to Dashboard
- ✅ New token in localStorage
- ✅ Same user data loaded

---

### Test 2.3: Token Persistence
**Scenario:** Verify token works across page refresh

1. Refresh page (F5)
2. Verify still logged in (not redirected to login)
3. Dashboard loads data

**Verify:**
- ✅ No logout/redirect on refresh
- ✅ Data loads normally
- ✅ Same user visible in profile

---

## Phase 3: Dashboard & Balance Display (15 minutes)

### Test 3.1: Dashboard Initial State
**Scenario:** New user dashboard should be empty

1. View Dashboard page
2. Observe all sections

**Verify:**
- ✅ Balance Summary Card shows "$0.00" with "Settled" status
- ✅ Outstanding Balances tabs show "No balances"
- ✅ Activity Feed shows "No recent activities"
- ✅ Quick Access Cards show:
  - Groups: 0
  - Friends: 0
  - Analytics: $0.00

---

### Test 3.2: Check Network Requests
**Scenario:** Verify API calls made correctly

1. Open DevTools → Network tab
2. Refresh Dashboard
3. Filter requests to `/api/payment/`

**Verify:**
- ✅ `GET /api/payment/summary/dashboard` returns 200
- ✅ Response includes:
  - `balance` object with total, youOwe, youAreOwed, status
  - `youOwe` array
  - `youAreOwed` array
  - `recentExpenses` array
  - `groupsCount` number

**Response Example:**
```json
{
  "success": true,
  "balance": {
    "total": 0,
    "youOwe": 0,
    "youAreOwed": 0,
    "status": "settled"
  },
  "youOwe": [],
  "youAreOwed": [],
  "recentExpenses": [],
  "groupsCount": 0
}
```

---

## Phase 4: Friends Management (20 minutes)

### Test 4.1: Create Second User
**Scenario:** Create friend for relationship testing

1. Open new incognito browser window
2. Navigate to `http://localhost:3000`
3. Click "Create an account"
4. Fill form:
   - First Name: `Test`
   - Last Name: `User2`
   - Email: `test2+${Date.now()}@example.com`
   - Phone: `555-0002`
   - Password: `TestPass123!`
5. Click "Create Account"
6. Don't logout - note this User2 window

---

### Test 4.2: Send Friend Request
**Scenario:** User1 adds User2 as friend

1. Back to User1 window (original)
2. Click "Friends" in navigation
3. Click "+ Add Friend" button
4. In search box, enter User2's email
5. When result appears, click "Send Request"

**Verify:**
- ✅ Toast: "Friend request sent!"
- ✅ User shows "Pending" status in search results
- ✅ Search results can be cleared

---

### Test 4.3: Accept Friend Request
**Scenario:** User2 accepts friend request from User1

1. Switch to User2 window
2. Click "Friends" in navigation
3. Click "Pending Requests" tab
4. See request from User1
5. Click "Accept"

**Verify:**
- ✅ Toast: "Friend request accepted!"
- ✅ Request moves from Pending to All Friends
- ✅ User1 appears in All Friends list

---

### Test 4.4: Verify Friend in Both Accounts
**Scenario:** Both users see each other as friends

1. In User1 window: Go to Friends → All Friends
2. Should see User2 in list

**Verify:**
- ✅ User2 appears in All Friends list
- ✅ Shows correct name and email
- ✅ No longer shows "Add Friend" option

---

## Phase 5: Group Creation (20 minutes)

### Test 5.1: Create Group with Both Users
**Scenario:** User1 creates group with User2

1. In User1 window, click "Groups" in navigation
2. Click "+ Create Group" button
3. Modal opens - fill form:
   - Group Name: `Test Group`
   - Description: `Testing shared expenses`
   - Members: Search and select User2
4. Click "Create"

**Verify:**
- ✅ Toast: "Group created successfully!"
- ✅ Modal closes
- ✅ Group appears in grid with:
   - Group name
   - 2 members indicator
   - $0.00 total spent
- ✅ Quick Access Card shows Groups: 1

---

### Test 5.2: Verify Group in User2's Account
**Scenario:** User2 sees group created by User1

1. Switch to User2 window
2. Navigate to Groups page
3. Refresh if needed

**Verify:**
- ✅ Group appears in User2's list
- ✅ Shows 2 members
- ✅ Same group name

---

## Phase 6: Expense Creation & Splitting (25 minutes)

### Test 6.1: Create Expense from Dashboard
**Scenario:** User1 creates shared expense

1. In User1 window, on Dashboard, click "+ Add Expense" button
2. Modal opens - fill form:
   - Expense Title: `Lunch`
   - Amount: `45.00`
   - Currency: `USD`
   - Category: `Food`
   - Select Group: Choose the "Test Group"
   - Members appear as checkboxes:
     - Verify both User1 and User2 are listed
     - Leave both checked (default)
   - Split Method: `Equal` (default)
   - Date: Today (default)
3. Click "Add Expense"

**Verify:**
- ✅ Toast: "Expense added successfully!"
- ✅ Modal closes
- ✅ Activity Feed updates to show new expense:
   - Shows your name as payer
   - Shows expense title "Lunch"
   - Shows group name "Test Group"
   - Shows amount with correct split ($22.50 for each person)

---

### Test 6.2: Verify Split Calculation
**Scenario:** Balance updates with expense split

1. Observe Balance Summary Card
2. Should show updated balance information

**Verify:**
- ✅ If User1 paid entire $45, User2 owes $22.50
- ✅ Balance shows:
   - You Are Owed: $22.50 (User2 owes you)
   - Status: Green "You are owed"
   - Or if calculation is reversed: Red "You owe"
   - (Depends on payment logic)

---

### Test 6.3: Verify Dashboard API Call
**Scenario:** Confirm API returns updated data

1. Open DevTools → Network tab
2. Click Dashboard in navigation
3. Look for `/api/payment/summary/dashboard` request
4. Check Response tab

**Verify Response includes:**
- ✅ `recentExpenses` array with new "Lunch" expense
- ✅ Updated balance calculations
- ✅ Expense shows correct split amounts
- ✅ Activity count increased

---

### Test 6.4: Create Second Expense with Different Split
**Scenario:** Test custom split scenario

1. Click "Add Expense" again
2. Fill form:
   - Title: `Gas`
   - Amount: `60.00`
   - Category: `Travel`
   - Group: Same "Test Group"
   - Members: Select only User1 (uncheck User2)
   - Amount shown should be $60.00 (full amount)
3. Click "Add Expense"

**Verify:**
- ✅ Expense created successfully
- ✅ Activity Feed shows $60.00 (not split)
- ✅ Only User1 has share
- ✅ Balance updates appropriately

---

## Phase 7: Balance Tracking (15 minutes)

### Test 7.1: Outstanding Balances Tabs
**Scenario:** Verify balance display

1. In User1 account, open Dashboard
2. Look at Outstanding Balances section
3. Click "You Owe" tab

**Verify:**
- ✅ If expenses show User1 owes something, displays here
- ✅ Shows other person's name
- ✅ Shows amount owed
- ✅ Shows "Settle" button

4. Click "You Are Owed" tab

**Verify:**
- ✅ Shows User2 (who owes User1)
- ✅ Shows amount: $22.50 (from lunch split)
- ✅ Shows "Remind" button

---

### Test 7.2: Check User2's Perspective
**Scenario:** Verify balances from other user's view

1. Switch to User2 window
2. Go to Dashboard
3. Check Outstanding Balances

**Verify:**
- ✅ "You Owe" tab shows:
   - User1
   - Amount: $22.50
   - "Settle" button
- ✅ "You Are Owed" tab shows:
   - Empty or shows if User2 paid anything

---

## Phase 8: Payment Settlement (20 minutes)

### Test 8.1: Record Payment - User2 Pays User1
**Scenario:** Settle outstanding balance

1. In User2 account, Dashboard
2. Outstanding Balances → You Owe tab
3. Click "Settle" button for User1

**Settle Modal opens:**
- ✅ Shows User1 as recipient
- ✅ Shows amount: $22.50
- ✅ Payment method options: Cash, Venmo, PayPal, Bank
- ✅ Notes field available

4. Select payment method: `Cash`
5. Leave notes empty (optional)
6. Click "Record Payment"

**Verify:**
- ✅ Toast: "Payment recorded successfully!"
- ✅ Modal closes
- ✅ Outstanding Balances updates:
   - User1 no longer appears in "You Owe"
   - Balance shows $0.00 settled

---

### Test 8.2: Verify Balance Settlement in User1's Account
**Scenario:** Payment reflects in other user's balance

1. Switch to User1 window
2. Refresh Dashboard (or it may auto-update)

**Verify:**
- ✅ Outstanding Balances → You Are Owed:
   - User2 should now show $0.00 or be removed
- ✅ Balance Summary: $0.00 settled
- ✅ No pending balances

---

## Phase 9: Activity Feed (10 minutes)

### Test 9.1: View Complete Activity Feed
**Scenario:** All transactions show in activity feed

1. Navigate to Activity section (or Dashboard activity feed)
2. Observe all entries

**Verify entries include:**
- ✅ Lunch expense ($45.00 split)
- ✅ Gas expense ($60.00)
- ✅ Payment settlement ($22.50)
- ✅ Each shows:
   - Payer name
   - Expense title
   - Group name
   - Amount
   - Your share/payment amount
   - Date/time

---

### Test 9.2: API Activity Feed Endpoint
**Scenario:** Verify backend provides activity data

1. DevTools → Network
2. Look for `/api/expense/activity/feed` request
3. Check Response

**Verify response includes:**
- ✅ Array of expenses and payments
- ✅ Each entry has all required fields
- ✅ Sorted by date (newest first)
- ✅ Shows user's share calculation

---

## Phase 10: Navigation & UI (10 minutes)

### Test 10.1: Top Navigation
**Scenario:** Test all navigation elements

1. Verify Top Navigation shows:
   - [ ] Bill Buddies logo (click → goes to Dashboard)
   - [ ] Navigation tabs: Dashboard, Friends, Groups, Activity
   - [ ] Active tab highlighted
   - [ ] Notifications icon (bell)
   - [ ] Profile dropdown

---

### Test 10.2: Profile Dropdown
**Scenario:** Test profile menu

1. Click profile avatar in top-right
2. Dropdown shows options:
   - [ ] View Profile
   - [ ] Settings
   - [ ] Payment Methods
   - [ ] Logout

3. Click outside to close

**Verify:**
- ✅ Menu closes
- ✅ Can reopen menu

---

### Test 10.3: Responsive Design
**Scenario:** Test mobile responsiveness

1. DevTools → Device Toolbar (Ctrl+Shift+M)
2. Select iPhone 12 (375px width)
3. Navigate between pages

**Verify:**
- ✅ Dashboard readable on mobile
- ✅ Forms fit screen
- ✅ Buttons touch-friendly (44px+)
- ✅ Modals show properly
- ✅ No horizontal scrolling

---

## Phase 11: Error Handling (10 minutes)

### Test 11.1: Invalid Login
**Scenario:** Wrong credentials rejected

1. Go to Login page
2. Enter wrong email or password
3. Click Sign In

**Verify:**
- ✅ Toast error message
- ✅ Not logged in
- ✅ Stays on Login page

---

### Test 11.2: Network Error Handling
**Scenario:** Test behavior when backend unavailable

1. Stop backend server (Ctrl+C)
2. Try to navigate or refresh
3. Click any action button

**Verify:**
- ✅ Error toast appears
- ✅ Graceful error message (not raw error)
- ✅ Can navigate away
- ✅ Restart backend and functionality returns

---

### Test 11.3: Invalid Form Submission
**Scenario:** Missing required fields rejected

1. Click "Add Expense"
2. Leave Title empty
3. Click "Add Expense" button

**Verify:**
- ✅ Toast: "Please fill in all required fields"
- ✅ Modal stays open
- ✅ Form data preserved

---

## Phase 12: Data Persistence (10 minutes)

### Test 12.1: Refresh Page
**Scenario:** Data persists across page refresh

1. Create expense or add friend
2. Press F5 to refresh
3. Observe page reload

**Verify:**
- ✅ Still logged in (token persists)
- ✅ Dashboard data loads correctly
- ✅ Friends list same
- ✅ Activity feed same
- ✅ No data loss

---

### Test 12.2: Browser Close & Reopen
**Scenario:** Session persists across browser restart

1. Note current state
2. Close browser completely
3. Reopen browser
4. Navigate to `http://localhost:3000`

**Verify:**
- ✅ Auto-logged in (token in localStorage)
- ✅ Dashboard loads
- ✅ Same data visible
- ✅ All previous actions reflected

---

## Performance Testing (5 minutes)

### Test 13.1: Dashboard Load Time
**Scenario:** Measure performance

1. DevTools → Performance tab
2. Click Record button (red dot)
3. Navigate to Dashboard
4. Stop recording after 5 seconds
5. Review Main thread activity

**Target Metrics:**
- ✅ Dashboard loads in < 2 seconds
- ✅ No jank (60fps in smooth scroll)
- ✅ No long tasks > 50ms

---

### Test 13.2: API Response Times
**Scenario:** Check API performance

1. DevTools → Network tab
2. Refresh page
3. Look at each API request:
   - Response time column
   - Size column

**Target Metrics:**
- ✅ All responses < 500ms
- ✅ Bundle size < 500KB
- ✅ No slow network requests

---

## Final Verification Checklist

- [ ] All tests from Phase 1-12 passed
- [ ] No console errors (F12 → Console tab empty or only warnings)
- [ ] No network errors (Network tab shows 200/201 responses)
- [ ] Users can signup/login
- [ ] Expenses create correctly
- [ ] Balances calculate accurately
- [ ] Payments settle balances
- [ ] Friends work bidirectionally
- [ ] Groups manage members
- [ ] Dashboard shows real-time data
- [ ] Mobile responsive
- [ ] Performance acceptable

---

## ✅ Testing Complete

If all checks pass, the application is **ready for deployment**!

### If Issues Found

1. **Note the exact issue**
2. **Check browser console for error messages**
3. **Check backend terminal for error logs**
4. **Verify database has data**: Connect to MongoDB and query collections
5. **Test individual API endpoints** using Postman
6. **Review relevant code file** for issues
7. **Recreate with fresh test data**

### Next Steps

1. Deploy backend to hosting service (Heroku, AWS, etc.)
2. Deploy frontend to CDN (Vercel, Netlify, etc.)
3. Update API endpoints in frontend for production
4. Configure production MongoDB Atlas database
5. Set up SSL certificates
6. Monitor with error tracking (Sentry, etc.)

---

**Generated:** 2024
**Status:** Complete Test Suite
**Last Updated:** Implementation Phase
