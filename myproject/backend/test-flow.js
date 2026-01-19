/**
 * Bill Buddies - Complete API Testing Flow
 * Tests all endpoints end-to-end with realistic data flow
 * 
 * Run: node test-flow.js
 */

const BASE_URL = 'http://127.0.0.1:3001/api';
let testToken = null;
let testUserId = null;
let testFriendId = null;
let testGroupId = null;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const color = {
    success: colors.green,
    error: colors.red,
    info: colors.blue,
    test: colors.cyan,
    request: colors.yellow,
  }[type] || colors.reset;

  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

async function apiCall(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(testToken && { Authorization: `Bearer ${testToken}` }),
    },
    ...(data && { body: JSON.stringify(data) }),
  };

  log(`${method} ${endpoint}`, 'request');

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      log(`❌ ${response.status}: ${result.message || 'Unknown error'}`, 'error');
      if (process.env.DEBUG) {
        console.error('Full error response:', result);
      }
      return null;
    }

    log(`✓ Success: ${result.success ? result.message || 'OK' : 'Unknown'}`, 'success');
    return result;
  } catch (error) {
    log(`❌ Network error: ${error.message}`, 'error');
    console.error(error);
    return null;
  }
}

async function runTests() {
  log('🚀 Starting Bill Buddies API Tests', 'test');
  log('================================\n', 'test');

  // Test 1: Register Users
  log('TEST 1: User Registration', 'test');
  log('------------------------', 'test');

  const user1 = await apiCall('POST', '/auth/signup', {
    firstName: 'Test',
    lastName: 'User1',
    email: `user1-${Date.now()}@test.com`,
    phone: '555-0001',
    password: 'TestPass123!',
  });

  if (!user1) {
    log('Failed to create test user 1', 'error');
    return;
  }

  testToken = user1.token;
  testUserId = user1.user.id;
  log(`User 1 ID: ${testUserId}\n`, 'success');

  // Test 2: Login
  log('TEST 2: User Login', 'test');
  log('------------------', 'test');

  const login = await apiCall('POST', '/auth/login', {
    email: user1.user.email,
    password: 'TestPass123!',
  });

  if (!login) {
    log('Failed to login', 'error');
    return;
  }

  testToken = login.token;
  log(`Token received: ${testToken.substring(0, 20)}...\n`, 'success');

  // Test 3: Create second user for friend tests
  log('TEST 3: Create Second User (for friend tests)', 'test');
  log('---------------------------------------------', 'test');

  const user2Data = {
    firstName: 'Test',
    lastName: 'User2',
    email: `user2-${Date.now()}@test.com`,
    phone: '555-0002',
    password: 'TestPass123!',
  };

  const user2 = await apiCall('POST', '/auth/signup', user2Data);
  if (!user2) {
    log('Failed to create second user', 'error');
    return;
  }

  testFriendId = user2.user.id;
  log(`User 2 ID: ${testFriendId}\n`, 'success');

  // Test 4: Send Friend Request
  log('TEST 4: Send Friend Request', 'test');
  log('---------------------------', 'test');

  // Make sure we're still using user 1's token
  testToken = login.token;

  const friendRequest = await apiCall('POST', '/friend/request/send', {
    recipientId: testFriendId,
  });

  if (!friendRequest) {
    log('Failed to send friend request', 'error');
  } else {
    log('Friend request sent\n', 'success');
  }

  // Test 5: Create Group
  log('TEST 5: Create Group', 'test');
  log('--------------------', 'test');

  const group = await apiCall('POST', '/group/create', {
    name: 'Test Group',
    description: 'A test group for expenses',
    members: [testFriendId],
  });

  if (!group || !group.group) {
    log('Failed to create group', 'error');
    return;
  }

  testGroupId = group.group._id;
  log(`Group ID: ${testGroupId}\n`, 'success');

  // Test 6: Add Expense
  log('TEST 6: Add Expense', 'test');
  log('-------------------', 'test');

  const expense = await apiCall('POST', '/expense/add', {
    title: 'Test Lunch',
    description: 'Lunch with friend',
    amount: 45.0,
    category: 'Food',
    groupId: testGroupId,
    splitMethod: 'equal',
    splits: [
      { userId: testUserId, amount: 22.5 },
      { userId: testFriendId, amount: 22.5 },
    ],
    date: new Date(),
  });

  if (!expense) {
    log('Failed to add expense', 'error');
  } else {
    log(`Expense created: $${expense.expense.amount}\n`, 'success');
  }

  // Test 7: Get Payment Dashboard
  log('TEST 7: Get Payment Dashboard', 'test');
  log('-----------------------------', 'test');

  const dashboard = await apiCall('GET', '/payment/summary/dashboard');

  if (!dashboard) {
    log('Failed to get dashboard', 'error');
  } else {
    log('Dashboard data retrieved:', 'success');
    log(`  Total Balance: $${dashboard.balance.total}`, 'info');
    log(`  You Owe: $${dashboard.balance.youOwe}`, 'info');
    log(`  You Are Owed: $${dashboard.balance.youAreOwed}`, 'info');
    log(`  Recent Expenses: ${dashboard.recentExpenses.length}`, 'info');
    log(`  Your Groups: ${dashboard.groupsCount}\n`, 'info');
  }

  // Test 8: Get Balances
  log('TEST 8: Get All Balances', 'test');
  log('------------------------', 'test');

  const balances = await apiCall('GET', '/payment/balances');

  if (!balances) {
    log('Failed to get balances', 'error');
  } else {
    log('Balances retrieved:', 'success');
    log(`  You Owe Count: ${balances.youOwe.length}`, 'info');
    log(`  You Are Owed Count: ${balances.youAreOwed.length}`, 'info');
    log(`  Total You Owe: $${balances.totalYouOwe}`, 'info');
    log(`  Total You Are Owed: $${balances.totalYouAreOwed}\n`, 'info');
  }

  // Test 9: Get Friends List
  log('TEST 9: Get Friends List', 'test');
  log('------------------------', 'test');

  const friends = await apiCall('GET', '/friend/list');

  if (!friends) {
    log('Failed to get friends', 'error');
  } else {
    log(`Friends retrieved: ${friends.data.length} friend(s)\n`, 'success');
  }

  // Test 10: Search Friends
  log('TEST 10: Search Friends', 'test');
  log('-----------------------', 'test');

  const search = await apiCall('GET', `/friend/search?query=${user2Data.email}`);

  if (!search) {
    log('Failed to search friends', 'error');
  } else {
    log(`Search results: ${search.data.length} result(s)\n`, 'success');
  }

  // Test 11: Get My Groups
  log('TEST 11: Get My Groups', 'test');
  log('----------------------', 'test');

  const myGroups = await apiCall('GET', '/group/my-groups');

  if (!myGroups) {
    log('Failed to get groups', 'error');
  } else {
    log(`Groups retrieved: ${myGroups.groups.length} group(s)\n`, 'success');
  }

  // Test 12: Get Activity Feed
  log('TEST 12: Get Activity Feed', 'test');
  log('---------------------------', 'test');

  const feed = await apiCall('GET', '/expense/activity/feed');

  if (!feed) {
    log('Failed to get activity feed', 'error');
  } else {
    log(`Activity feed retrieved: ${feed.data.length} item(s)\n`, 'success');
  }

  // Test 13: Record Payment
  log('TEST 13: Record Payment', 'test');
  log('-----------------------', 'test');

  const payment = await apiCall('POST', '/payment/record-payment', {
    toUserId: testFriendId,
    amount: 22.5,
    method: 'cash',
    description: 'Settled for lunch',
  });

  if (!payment) {
    log('Failed to record payment', 'error');
  } else {
    log('Payment recorded successfully\n', 'success');
  }

  // Test 14: Final Dashboard Check
  log('TEST 14: Final Dashboard Check', 'test');
  log('------------------------------', 'test');

  const finalDashboard = await apiCall('GET', '/payment/summary/dashboard');

  if (finalDashboard) {
    log('Final Dashboard State:', 'success');
    log(`  Total Balance: $${finalDashboard.balance.total}`, 'info');
    log(`  Status: ${finalDashboard.balance.status}`, 'info');
  }

  // Summary
  log('\n✅ All tests completed!', 'test');
  log('================================', 'test');
}

// Run tests
runTests().catch((error) => {
  log(`Test suite error: ${error.message}`, 'error');
  process.exit(1);
});
