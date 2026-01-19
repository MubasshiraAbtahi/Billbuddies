# Database Queries & Operations for Bill Buddies

This document contains MongoDB queries and operations for storing and managing data.

## 1. USER REGISTRATION & STORAGE

### Create New User (Signup)
```javascript
// Backend: backend/routes/auth.js
const user = new User({
  email: req.body.email,
  password: req.body.password, // Hashed by pre-save hook
  firstName: req.body.firstName,
  lastName: req.body.lastName,
  username: req.body.username,
});

await user.save();
```

### MongoDB Storage - Users Collection
```javascript
// Stored as:
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "email": "john@example.com",
  "password": "$2a$10$...", // bcryptjs hashed
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "profilePicture": "https://...",
  "phone": "",
  "friends": [],
  "groups": [],
  "createdAt": ISODate("2024-01-19T10:00:00Z"),
  "lastLogin": ISODate("2024-01-19T10:00:00Z")
}
```

---

## 2. USER LOGIN & AUTHENTICATION

### Find User by Email
```javascript
const user = await User.findOne({ email: "john@example.com" });
```

### Verify Password
```javascript
const isPasswordValid = await user.comparePassword(requestPassword);
```

### Generate JWT Token
```javascript
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

---

## 3. FRIEND SYSTEM

### Send Friend Request
```javascript
const friendRequest = new FriendRequest({
  from: userId1,
  to: userId2,
  status: 'pending'
});
await friendRequest.save();
```

### MongoDB Storage - Friend Requests
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "from": ObjectId("507f1f77bcf86cd799439011"),
  "to": ObjectId("507f1f77bcf86cd799439013"),
  "status": "pending", // or "accepted", "rejected"
  "createdAt": ISODate("2024-01-19T10:00:00Z")
}
```

### Accept Friend Request
```javascript
// Add to both users' friends arrays
await User.findByIdAndUpdate(userId1, {
  $push: { friends: userId2 }
});

await User.findByIdAndUpdate(userId2, {
  $push: { friends: userId1 }
});

// Update request status
await FriendRequest.findByIdAndUpdate(requestId, {
  status: 'accepted'
});
```

### Get All Friends
```javascript
const user = await User.findById(userId).populate('friends');
const friends = user.friends;
```

---

## 4. GROUP MANAGEMENT

### Create New Group
```javascript
const group = new Group({
  name: "Roommates 2024",
  description: "Apartment bills",
  createdBy: userId,
  members: [userId, friendId1, friendId2],
  defaultSplitMethod: 'equal'
});
await group.save();

// Add group to all members
await User.updateMany(
  { _id: { $in: group.members } },
  { $push: { groups: group._id } }
);
```

### MongoDB Storage - Groups
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439020"),
  "name": "Roommates 2024",
  "description": "Apartment bills",
  "groupIcon": "👥",
  "createdBy": ObjectId("507f1f77bcf86cd799439011"),
  "members": [
    ObjectId("507f1f77bcf86cd799439011"),
    ObjectId("507f1f77bcf86cd799439013"),
    ObjectId("507f1f77bcf86cd799439014")
  ],
  "defaultSplitMethod": "equal",
  "expenses": [],
  "isActive": true,
  "createdAt": ISODate("2024-01-19T10:00:00Z")
}
```

### Get All Groups for User
```javascript
const groups = await Group.find({
  members: userId,
  isActive: true
}).populate('members', 'username profilePicture');
```

### Add Members to Group
```javascript
await Group.findByIdAndUpdate(groupId, {
  $push: { members: { $each: [newMemberId1, newMemberId2] } }
});

// Add group to new members
await User.updateMany(
  { _id: { $in: [newMemberId1, newMemberId2] } },
  { $push: { groups: groupId } }
);
```

---

## 5. EXPENSE TRACKING

### Create Expense (Manual Entry)
```javascript
const expense = new Expense({
  title: "Grocery Shopping",
  totalAmount: 120.50,
  paidBy: userId1,
  group: groupId,
  splitMethod: 'equal',
  splits: [
    { user: userId1, amount: 40.17 },
    { user: userId2, amount: 40.17 },
    { user: userId3, amount: 40.16 }
  ],
  category: 'food',
  expenseDate: new Date()
});
await expense.save();

// Add to group
await Group.findByIdAndUpdate(groupId, {
  $push: { expenses: expense._id }
});
```

### MongoDB Storage - Expenses
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439030"),
  "title": "Grocery Shopping",
  "description": "Weekly groceries",
  "totalAmount": 120.50,
  "currency": "USD",
  "paidBy": ObjectId("507f1f77bcf86cd799439011"),
  "group": ObjectId("507f1f77bcf86cd799439020"),
  "splitMethod": "equal",
  "splits": [
    {
      "user": ObjectId("507f1f77bcf86cd799439011"),
      "amount": 40.17
    },
    {
      "user": ObjectId("507f1f77bcf86cd799439013"),
      "amount": 40.17
    },
    {
      "user": ObjectId("507f1f77bcf86cd799439014"),
      "amount": 40.16
    }
  ],
  "receiptData": {
    "merchantName": "Walmart",
    "date": ISODate("2024-01-19T10:00:00Z"),
    "items": [
      { "name": "Milk", "price": 3.99 },
      { "name": "Bread", "price": 2.49 }
    ],
    "subtotal": 100.00,
    "tax": 8.50,
    "tip": 12.00,
    "receiptImage": "/uploads/receipts/receipt-1705667400.png",
    "ocrConfidence": 0.92
  },
  "category": "food",
  "expenseDate": ISODate("2024-01-19T10:00:00Z"),
  "createdAt": ISODate("2024-01-19T10:00:00Z"),
  "updatedAt": ISODate("2024-01-19T10:00:00Z")
}
```

### Get All Expenses for Group
```javascript
const expenses = await Expense.find({ group: groupId })
  .populate('paidBy', 'username profilePicture')
  .populate('splits.user', 'username profilePicture')
  .sort('-expenseDate');
```

### Update Expense
```javascript
await Expense.findByIdAndUpdate(expenseId, {
  title: "Updated Title",
  totalAmount: 125.00,
  splits: [
    { user: userId1, amount: 41.67 },
    { user: userId2, amount: 41.67 },
    { user: userId3, amount: 41.66 }
  ],
  updatedAt: new Date()
});
```

### Delete Expense
```javascript
await Expense.findByIdAndDelete(expenseId);

// Remove from group
await Group.findByIdAndUpdate(groupId, {
  $pull: { expenses: expenseId }
});
```

---

## 6. BILL SCANNER (OCR)

### Store Scanned Receipt Data
```javascript
const expense = new Expense({
  title: "Chipotle - 1/19/2024",
  totalAmount: 45.62,
  paidBy: userId,
  group: groupId,
  splitMethod: 'by_item',
  splits: [
    {
      user: userId1,
      amount: 15.54,
      items: [{ name: "Burrito", price: 15.54 }]
    },
    {
      user: userId2,
      amount: 15.04,
      items: [{ name: "Bowl", price: 15.04 }]
    }
  ],
  receiptData: {
    merchantName: "Chipotle Mexican Grill",
    date: new Date("2024-01-19"),
    items: [
      { name: "Burrito", price: 13.99, assignedTo: [userId1] },
      { name: "Bowl", price: 13.49, assignedTo: [userId2] }
    ],
    subtotal: 27.48,
    tax: 2.74,
    tip: 15.40,
    receiptImage: "/uploads/receipts/receipt-1705667400.png",
    ocrConfidence: 0.89
  },
  category: 'food',
  expenseDate: new Date("2024-01-19")
});
await expense.save();
```

---

## 7. SETTLEMENTS & PAYMENTS

### Record Payment
```javascript
const settlement = new Settlement({
  from: userId1,
  to: userId2,
  amount: 50.00,
  group: groupId,
  paymentMethod: 'venmo',
  notes: 'Payment for lunch',
  status: 'completed'
});
await settlement.save();
```

### MongoDB Storage - Settlements
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439040"),
  "from": ObjectId("507f1f77bcf86cd799439011"),
  "to": ObjectId("507f1f77bcf86cd799439013"),
  "amount": 50.00,
  "group": ObjectId("507f1f77bcf86cd799439020"),
  "paymentMethod": "venmo",
  "notes": "Payment for lunch",
  "status": "completed",
  "settledAt": ISODate("2024-01-19T10:00:00Z")
}
```

### Calculate Balances
```javascript
// Get all expenses involving user
const expenses = await Expense.find({
  $or: [
    { paidBy: userId },
    { 'splits.user': userId }
  ]
}).populate('paidBy splits.user', 'username');

// Calculate net balance with each person
const balances = {};
expenses.forEach(expense => {
  // Processing logic...
});

// Return: { userId2: { amount: 50 owed }, userId3: { amount: -25 owed them } }
```

### Get Payment History
```javascript
const settlements = await Settlement.find({
  group: groupId
})
  .populate('from to', 'username profilePicture')
  .sort('-settledAt');
```

---

## 8. CHAT MESSAGES

### Send Message
```javascript
const message = new Message({
  group: groupId,
  sender: userId,
  content: "Who paid for dinner last night?",
  relatedExpense: expenseId // Optional
});
await message.save();

// Broadcast via Socket.io
io.to(groupId).emit('new-message', {
  message: await message.populate('sender', 'username profilePicture')
});
```

### MongoDB Storage - Messages
```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439050"),
  "group": ObjectId("507f1f77bcf86cd799439020"),
  "sender": ObjectId("507f1f77bcf86cd799439011"),
  "content": "Who paid for dinner?",
  "relatedExpense": ObjectId("507f1f77bcf86cd799439030"),
  "createdAt": ISODate("2024-01-19T10:00:00Z")
}
```

### Get Group Messages
```javascript
const messages = await Message.find({ group: groupId })
  .populate('sender', 'username profilePicture')
  .sort('-createdAt')
  .limit(50);
```

---

## 9. USEFUL MONGODB QUERIES

### Count expenses per group
```javascript
const count = await Expense.countDocuments({ group: groupId });
```

### Get total spent per person
```javascript
const totals = await Expense.aggregate([
  { $match: { group: groupId } },
  { $group: {
    _id: '$paidBy',
    total: { $sum: '$totalAmount' }
  }}
]);
```

### Find all pending friend requests
```javascript
const pending = await FriendRequest.find({
  to: userId,
  status: 'pending'
}).populate('from', 'username email');
```

### Get group statistics
```javascript
const stats = await Expense.aggregate([
  { $match: { group: groupId } },
  { $group: {
    _id: '$category',
    count: { $sum: 1 },
    total: { $sum: '$totalAmount' }
  }}
]);
```

### Clear old settlements
```javascript
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
await Settlement.deleteMany({
  status: 'completed',
  settledAt: { $lt: thirtyDaysAgo }
});
```

---

## 10. DATA VALIDATION

All data is validated at multiple levels:

### Frontend (Formik + Yup)
- Email format validation
- Password strength
- Required fields

### Backend (Express Validator)
- Input sanitization
- Type checking
- Range validation

### MongoDB (Mongoose Schemas)
- Field types
- Default values
- Unique constraints

---

## Example Complete Signup Flow

```javascript
// 1. User submits form on frontend
const signupData = {
  email: "john@example.com",
  password: "SecurePass123!",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe"
};

// 2. Frontend validates with Yup
// (email format, password length, etc.)

// 3. Sends to backend
POST /api/auth/signup {
  ...signupData
}

// 4. Backend validates again
// 5. Check if user exists
const existingUser = await User.findOne({ email });
if (existingUser) return error;

// 6. Hash password
// (done automatically by pre-save hook)

// 7. Create and save user
const user = new User(signupData);
await user.save();

// 8. MongoDB stores:
{
  "_id": ObjectId("..."),
  "email": "john@example.com",
  "password": "$2a$10$...", // hashed
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "friends": [],
  "groups": [],
  "createdAt": ISODate("..."),
  "lastLogin": ISODate("...")
}

// 9. Generate JWT token
const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '7d' });

// 10. Send back to frontend
{
  success: true,
  token: "eyJhbGc...",
  user: {
    id: "507f...",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe"
  }
}

// 11. Frontend stores token in localStorage
localStorage.setItem('token', token);

// 12. Redirect to dashboard
navigate('/dashboard');
```

---

## Performance Optimization

### Indexes to add:
```javascript
// User model
db.users.createIndex({ email: 1 });
db.users.createIndex({ username: 1 });

// FriendRequest model
db.friendrequests.createIndex({ from: 1, to: 1 });
db.friendrequests.createIndex({ to: 1, status: 1 });

// Expense model
db.expenses.createIndex({ group: 1 });
db.expenses.createIndex({ paidBy: 1 });
db.expenses.createIndex({ expenseDate: -1 });

// Message model
db.messages.createIndex({ group: 1, createdAt: -1 });

// Settlement model
db.settlements.createIndex({ group: 1 });
db.settlements.createIndex({ from: 1, to: 1 });
```

---

## Backup & Recovery

### Backup to file:
```bash
mongodump --db billbuddies --out /backup/billbuddies-backup
```

### Restore from file:
```bash
mongorestore --db billbuddies /backup/billbuddies-backup/billbuddies
```

---

This document covers all major database operations for Bill Buddies!
