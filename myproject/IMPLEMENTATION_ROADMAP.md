# Remaining Implementation Tasks

## Priority 1: Essential Pages (Do These First)

### 1. ProfilePage (`/src/pages/ProfilePage.js`)
**Purpose:** User can view and edit their profile

**Components Needed:**
- Profile picture upload
- Edit name, email, phone, bio
- Currency/language preferences
- Payment methods management
- Settings (notifications, privacy)
- Save changes button

**API Calls:**
- `GET /api/user/profile` - Load profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/upload-picture` - Upload photo
- `POST /api/user/payment-methods` - Add payment method

### 2. GroupDetailPage (`/src/pages/GroupDetail.js`)
**Purpose:** View group details, expenses, balances, members

**Tabs Needed:**
- **Expenses Tab:** List all expenses in group
- **Balances Tab:** Who owes whom within the group
- **Members Tab:** List members, add/remove
- **Settings Tab:** Edit group, archive, leave (if member)

**Key Features:**
- Add expense button (defaults to this group)
- Group settings (edit name, icon, members)
- Leave group option
- Unsettled balance warnings

**API Calls:**
- `GET /api/group/:groupId` - Get group details
- `GET /api/expense/group/:groupId` - Get expenses
- `POST /api/group/:groupId/add-members` - Add members
- `POST /api/group/:groupId/leave` - Leave group

---

## Priority 2: Modals & Dialogs

### 3. ExpenseDetailModal (`/src/components/ExpenseDetailModal.js`)
**Shows When:** User clicks on an expense in activity feed

**Display Information:**
- Full expense details (title, amount, date, category)
- Who paid
- Split breakdown (per person)
- Comments section
- Receipt image (if any)

**Actions:**
- Edit button (if you're the payer)
- Delete button (if you're the payer and no one paid yet)
- Add comment button
- Share expense

**API Calls:**
- `GET /api/expense/:expenseId` - Get expense details
- `POST /api/expense/:expenseId/comment` - Add comment
- `PUT /api/expense/:expenseId` - Edit expense
- `DELETE /api/expense/:expenseId` - Delete expense

---

## Priority 3: Additional Pages

### 4. ActivityHistoryPage (`/src/pages/ActivityHistory.js`)
**Purpose:** Complete history of all expenses with filtering

**Features:**
- List all expenses (paginated)
- Filter by date range
- Filter by category
- Filter by group
- Search by title
- Sort options (newest, oldest, highest amount)

**API Calls:**
- `GET /api/expense/activity/feed?page=1&limit=20` - Get paginated expenses
- Use filtering parameters for filters

### 5. NotificationsPanel (`/src/components/NotificationsPanel.js`)
**Shows When:** User clicks bell icon in TopNav

**Features:**
- Slide-in panel from right
- List of notifications with timestamps
- Notification types:
  - New expense added
  - Payment received
  - Friend request
  - Group invitation
  - Payment reminder
- Click notification → Navigate to relevant page
- Mark all as read button
- Mark individual as read

**API Calls:**
- `GET /api/notification` - Get all notifications
- `PUT /api/notification/:id/read` - Mark as read
- `PUT /api/notification/all/read` - Mark all as read

---

## Backend Tasks (If Not Already Done)

### Notification Endpoints
```javascript
// In /backend/routes/notification.js
router.get('/', authenticate, getNotifications); // Get all
router.post('/', authenticate, createNotification); // Create
router.put('/:id/read', authenticate, markAsRead); // Mark one
router.put('/all/read', authenticate, markAllAsRead); // Mark all
router.delete('/:id', authenticate, deleteNotification); // Delete
```

### Notification Model Enhancement
```javascript
// In /backend/models/Notification.js
const NotificationSchema = {
  recipient: ObjectId,
  type: 'expense|payment|friend_request|group_invite|reminder',
  title: String,
  message: String,
  relatedId: ObjectId, // expense/payment/user/group id
  isRead: Boolean,
  createdAt: Date
}
```

---

## Optional Enhancements

### 6. SettlementDetailPage
- Show detailed settlement history
- Bill split analysis
- Who owes whom graph
- Payment schedule

### 7. ReceiptScannerModal
- Camera access
- Image upload
- OCR processing
- Extract item details

### 8. ChatPanel (for groups)
- Real-time messaging
- User avatars
- Timestamps
- Socket.io integration

### 9. ReportsPage
- Monthly spending breakdown
- Category charts
- Group spending comparison
- Trends analysis

---

## Code Templates

### ProfilePage Basic Structure
```jsx
import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav';
import toast from 'react-hot-toast';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setProfile(data.user);
      setFormData(data.user);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Profile updated!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      {/* Add profile form here */}
    </div>
  );
}

export default ProfilePage;
```

### Notification Model
```javascript
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['expense', 'payment', 'friend_request', 'group_invite', 'reminder'],
      required: true,
    },
    title: String,
    message: String,
    relatedId: mongoose.Schema.Types.ObjectId,
    relatedModel: String,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', NotificationSchema);
```

---

## Testing Scenarios

After implementing each page, test:

1. **ProfilePage**
   - Load profile data
   - Edit each field
   - Upload profile picture
   - Add payment method
   - Change preferences

2. **GroupDetailPage**
   - View group expenses
   - See balance breakdowns
   - Add/remove members
   - Leave group
   - Edit group settings

3. **ExpenseDetailModal**
   - View expense from activity feed
   - See split breakdown
   - Add comments
   - Edit/delete (as creator)

4. **ActivityHistoryPage**
   - Pagination works
   - Filters work
   - Search works
   - Sorting works

5. **NotificationsPanel**
   - Shows correct notifications
   - Notifications disappear on read
   - Clicking navigates correctly
   - Mark all works

---

## Dependencies That Might Be Needed

```bash
# If not already installed:
npm install react-icons
npm install date-fns  # For date formatting
npm install axios    # Alternative to fetch
```

---

## Notes

- All backend endpoints are already available
- Models are already created
- Just need to build the UI components
- Follow the established pattern from Dashboard.js
- Use consistent styling with Tailwind
- Keep mobile-first approach

---

**Recommended Order of Implementation:**
1. ProfilePage (simpler)
2. GroupDetailPage (more complex)
3. ExpenseDetailModal
4. NotificationsPanel & backend notification endpoints
5. ActivityHistoryPage
6. Optional enhancements

---

**Estimated Time:**
- ProfilePage: 1-2 hours
- GroupDetailPage: 2-3 hours
- ExpenseDetailModal: 1 hour
- NotificationsPanel: 2-3 hours
- ActivityHistoryPage: 1-2 hours
- Optional features: Variable

**Total: 8-14 hours for complete implementation**
