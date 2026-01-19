# Bill Buddies - Complete Testing Guide

## Prerequisites
- Node.js installed (v14+)
- MongoDB running locally or remote connection configured
- Two test user accounts created

## Setup & Launch

### Backend Setup
```bash
cd backend
npm install
node server.js
# Should start on http://localhost:5000
```

### Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm start
# Should open http://localhost:3000 in browser
```

## Complete Feature Testing

### 1. Authentication Flow
**Test Case 1.1: Login**
- Navigate to `http://localhost:3000/login`
- Enter email: `test1@example.com`
- Enter password: `password123`
- Click "Sign In"
- **Expected**: Redirected to Dashboard, token saved in localStorage

**Test Case 1.2: Signup**
- Click "Create an account"
- Fill in form: First Name, Last Name, Email, Phone, Password
- Click "Create Account"
- **Expected**: New user created, redirected to Dashboard

---

### 2. Dashboard (Main Feature)
**Test Case 2.1: Dashboard Loads**
- Log in as User 1
- Navigate to `/dashboard`
- **Expected**: Should see:
  - Balance Summary Card (net balance with color coding)
  - Outstanding Balances section with You Owe/You Are Owed tabs
  - Activity Feed showing last 10 expenses
  - Quick Access Cards (Groups, Friends, Analytics)

**Test Case 2.2: Balance Calculation**
- Create an expense in a group (see Test 3.2)
- Return to Dashboard
- **Expected**: Balance Summary Card updates to show correct amounts

**Test Case 2.3: Settle Up Modal**
- Click "Settle Up" button
- Select a person from dropdown
- Select payment method (Cash/Venmo/PayPal/Bank)
- Review amount to pay
- Click "Record Payment"
- **Expected**: Payment recorded, balance updates

**Test Case 2.4: Add Expense Modal**
- Click "Add Expense" button on Dashboard
- **Expected Modal Opens with**:
  - Expense Title field
  - Amount & Currency dropdowns
  - Category selector
  - Group selector
  - Split Method (Equal/Percentage/Custom)
  - Split Between checkboxes
  - Date picker
  - Notes field

---

### 3. Add Expense Complete Flow
**Test Case 3.1: Select Group**
- Open "Add Expense" modal
- Click "Select Group" dropdown
- **Expected**: Lists all user's groups

**Test Case 3.2: Create Expense**
1. Modal opens → Fill in:
   - Title: "Lunch"
   - Amount: "45.00"
   - Currency: "USD"
   - Category: "Food"
   - Select Group: "Friends Group"
   
2. Member Selection:
   - Group members appear as checkboxes
   - Select members to split with
   
3. Split Settings:
   - Split Method: "Equal"
   - Amount per person auto-calculates
   
4. Click "Add Expense"
- **Expected**: 
  - Toast: "Expense added successfully!"
  - Modal closes
  - Dashboard refreshes with new expense in Activity Feed
  - Balances update

**Test Case 3.3: Verify Split Calculation**
- Create expense with 3 people, amount $45
- **Expected**: Each person's split = $15.00

---

### 4. Friends Feature
**Test Case 4.1: View Friends List**
- Click "Friends" in navigation
- Navigate to `/friends`
- **Expected**: 
  - Tab 1: "All Friends" showing list
  - Tab 2: "Pending Requests" 
  - "+ Add Friend" button

**Test Case 4.2: Add Friend**
1. Click "+ Add Friend" button
2. Search box appears
3. Enter search: `test2@example.com`
4. Click "Send Request" on result
- **Expected**: 
  - Toast: "Friend request sent!"
  - User appears in search results with "Pending" status

**Test Case 4.3: Accept Friend Request** (Login as test2)
1. Log in as test2
2. Navigate to Friends → "Pending Requests"
3. See request from test1
4. Click "Accept"
- **Expected**: 
  - Request moved to All Friends list for both users
  - Toast: "Friend request accepted!"

**Test Case 4.4: Search Friends**
- In Add Friend search, try searches:
  - By email: `test@`
  - By username: partial names
  - By phone: `555-`
- **Expected**: Matching results show with action buttons

---

### 5. Groups Feature
**Test Case 5.1: View Groups**
- Click "Groups" in navigation
- Navigate to `/groups`
- **Expected**: 
  - Grid of group cards showing:
    - Group name
    - Member count
    - Total spent
  - "+ Create Group" button

**Test Case 5.2: Create Group**
1. Click "+ Create Group" button
2. Fill form:
   - Group Name: "Roommates"
   - Description: "Shared expenses"
   - Add Members: (search and select friends)
3. Click "Create"
- **Expected**: 
  - Group created
  - Redirected to group detail page
  - Toast: "Group created successfully!"

**Test Case 5.3: View Group Details** (Click on group card)
- Navigate to `/group/[groupId]`
- **Expected**: Should show:
  - Group members with avatars
  - Group balances
  - Expenses list
  - "Add Expense" button for group

---

### 6. Navigation & UI
**Test Case 6.1: Top Navigation**
- Verify TopNav shows:
  - Bill Buddies logo (clickable, goes to Dashboard)
  - Navigation tabs: Dashboard, Friends, Groups, Activity
  - Notifications icon (bell)
  - Profile dropdown

**Test Case 6.2: Profile Dropdown**
- Click profile avatar/dropdown
- **Expected**: Options:
  - View Profile
  - Settings
  - Payment Methods
  - Logout

**Test Case 6.3: Logout**
- Click Profile → Logout
- **Expected**: 
  - Token removed from localStorage
  - Redirected to Login page

---

### 7. Data Persistence
**Test Case 7.1: Page Refresh**
- Add expense
- Refresh page (F5)
- **Expected**: 
  - Data persists
  - Dashboard still shows correct balances
  - Not logged out

**Test Case 7.2: Backend Connection**
- Check browser DevTools → Network
- Open Dashboard
- **Expected**: See API calls:
  - `GET /api/payment/summary/dashboard`
  - Returns balance data and recent expenses

---

### 8. API Endpoint Verification

| Endpoint | Method | Purpose | Test |
|----------|--------|---------|------|
| `/api/auth/login` | POST | User login | Test 1.1 |
| `/api/auth/register` | POST | User signup | Test 1.2 |
| `/api/payment/summary/dashboard` | GET | Dashboard data | Test 2.1 |
| `/api/expense/activity/feed` | GET | Recent expenses | Test 2.1 |
| `/api/expense/add` | POST | Create expense | Test 3.2 |
| `/api/friend/list` | GET | Get friends | Test 4.1 |
| `/api/friend/search` | GET | Search friends | Test 4.4 |
| `/api/friend/request/send` | POST | Send request | Test 4.2 |
| `/api/friend/request/accept/:id` | POST | Accept request | Test 4.3 |
| `/api/group/my-groups` | GET | Get user's groups | Test 5.1 |
| `/api/group/create` | POST | Create group | Test 5.2 |
| `/api/payment/record` | POST | Record payment | Test 2.3 |

---

## Debugging Checklist

### If Dashboard doesn't load:
- [ ] Check backend is running: `localhost:5000`
- [ ] Verify token in localStorage (DevTools → Application → Storage)
- [ ] Check Network tab for 401 errors (need re-login)
- [ ] Check Console for JavaScript errors

### If Add Expense fails:
- [ ] Verify group selected
- [ ] Verify at least 1 member selected
- [ ] Check network tab for error response
- [ ] Verify `/api/expense/add` endpoint is accessible

### If Friends search doesn't work:
- [ ] Ensure second user exists in database
- [ ] Check `/api/friend/search?query=test` in browser manually
- [ ] Verify Bearer token includes user authentication

### If Balance doesn't update:
- [ ] Clear localStorage and re-login
- [ ] Verify expense created with correct splits
- [ ] Check MongoDB for expense document
- [ ] Verify calculation: `amount / numberOfPeople`

---

## Performance Monitoring

Open DevTools → Performance tab:

**Dashboard Load Time (Target: < 2 seconds)**
1. Open Dashboard
2. Click Perform button
3. Record 5 seconds
4. Stop recording
5. Check Main thread activity

**Network Requests (Target: All < 500ms)**
1. Open DevTools → Network
2. Refresh page
3. Verify request times for:
   - `/api/payment/summary/dashboard`
   - `/api/friend/list`
   - `/api/group/my-groups`

---

## Test Data Scenarios

### Scenario 1: Zero Balance
- User 1 pays User 2: $50
- User 2 pays User 1: $50
- **Expected**: Both show $0.00 balance

### Scenario 2: Group with 4 People
- Create $100 expense
- Split equally with 3 others
- **Expected**: Each person owes $25.00

### Scenario 3: Mixed Payments
- User owes: $30 to Person A, $20 to Person B
- Pays: $10 to Person A
- **Expected**: 
  - Shows You Owe Person A: $20
  - Shows You Owe Person B: $20
  - Outstanding Balances updated

---

## Success Criteria

✅ **All tests pass** = Implementation complete and working

- [ ] Authentication works (login/signup)
- [ ] Dashboard displays correct balance data
- [ ] Add Expense modal functional with group/member selection
- [ ] Expense creates splits correctly
- [ ] Friends list loads and search works
- [ ] Friend requests send and accept
- [ ] Groups display and can be created
- [ ] Settle Up modal works
- [ ] Data persists on page refresh
- [ ] All API endpoints return expected data
- [ ] No console errors
- [ ] Navigation works between pages
- [ ] Logout clears session properly

---

## Next Steps After Testing

If all tests pass:
1. Deploy backend to cloud (Heroku/AWS)
2. Deploy frontend to cloud (Vercel/Netlify)
3. Set up production MongoDB Atlas cluster
4. Configure environment variables for production
5. Set up CI/CD pipeline for automated testing

