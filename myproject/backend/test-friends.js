import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test users
const testUsers = [
  { email: 'alice@test.com', password: 'Test123!', firstName: 'Alice', lastName: 'Smith' },
  { email: 'bob@test.com', password: 'Test123!', firstName: 'Bob', lastName: 'Johnson' },
  { email: 'charlie@test.com', password: 'Test123!', firstName: 'Charlie', lastName: 'Brown' },
];

let tokens = {};
let userIds = {};

async function signup() {
  console.log('\n=== SIGNING UP TEST USERS ===');
  for (const user of testUsers) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/signup`, {
        email: user.email,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.firstName.toLowerCase(),
      });
      tokens[user.email] = response.data.token;
      userIds[user.email] = response.data.data._id;
      console.log(`✓ ${user.firstName} signed up successfully`);
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log(`~ ${user.firstName} already exists (using existing account)`);
        // Try to login instead
        try {
          const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: user.email,
            password: user.password,
          });
          tokens[user.email] = loginResponse.data.token;
          userIds[user.email] = loginResponse.data.data._id;
          console.log(`  (logged in successfully)`);
        } catch (loginError) {
          console.log(`  (login failed)`);
        }
      } else {
        console.log(`✗ ${user.firstName} signup failed:`, error.response?.data?.message || error.message);
        console.log(`  Full error:`, error.response?.data || error.toString());
      }
    }
  }
}

async function testSearch() {
  console.log('\n=== TESTING FRIEND SEARCH ===');
  const aliceToken = tokens['alice@test.com'];
  try {
    const response = await axios.get(`${BASE_URL}/friend/search?query=bob`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    console.log(`✓ Search results:`, response.data.data.length, 'users found');
    if (response.data.data.length > 0) {
      console.log(`  - ${response.data.data[0].firstName} ${response.data.data[0].lastName}`);
    }
  } catch (error) {
    console.log(`✗ Search failed:`, error.response?.data?.message || error.message);
  }
}

async function testSendRequest() {
  console.log('\n=== TESTING SEND FRIEND REQUEST ===');
  const aliceToken = tokens['alice@test.com'];
  const bobId = userIds['bob@test.com'];
  try {
    const response = await axios.post(`${BASE_URL}/friend/request/send`, {
      recipientId: bobId,
    }, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    console.log(`✓ Friend request sent successfully`);
  } catch (error) {
    console.log(`✗ Send request failed:`, error.response?.data?.message || error.message);
  }
}

async function testGetRequests() {
  console.log('\n=== TESTING GET PENDING REQUESTS ===');
  const bobToken = tokens['bob@test.com'];
  try {
    const response = await axios.get(`${BASE_URL}/friend/requests`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    console.log(`✓ Pending requests:`, response.data.data.length);
    if (response.data.data.length > 0) {
      console.log(`  - From: ${response.data.data[0].sender?.firstName}`);
    }
  } catch (error) {
    console.log(`✗ Get requests failed:`, error.response?.data?.message || error.message);
  }
}

async function testAcceptRequest() {
  console.log('\n=== TESTING ACCEPT FRIEND REQUEST ===');
  const bobToken = tokens['bob@test.com'];
  try {
    const reqResponse = await axios.get(`${BASE_URL}/friend/requests`, {
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    if (reqResponse.data.data.length > 0) {
      const requestId = reqResponse.data.data[0]._id;
      const response = await axios.post(`${BASE_URL}/friend/request/accept/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${bobToken}` },
      });
      console.log(`✓ Friend request accepted`);
    }
  } catch (error) {
    console.log(`✗ Accept request failed:`, error.response?.data?.message || error.message);
  }
}

async function testGetFriends() {
  console.log('\n=== TESTING GET FRIENDS LIST ===');
  const aliceToken = tokens['alice@test.com'];
  try {
    const response = await axios.get(`${BASE_URL}/friend/list`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    console.log(`✓ Friends list:`, response.data.data.length, 'friends');
    response.data.data.forEach(f => {
      console.log(`  - ${f.firstName} ${f.lastName}`);
    });
  } catch (error) {
    console.log(`✗ Get friends failed:`, error.response?.data?.message || error.message);
  }
}

async function runTests() {
  try {
    await signup();
    await testSearch();
    await testSendRequest();
    await new Promise(r => setTimeout(r, 500)); // Small delay
    await testGetRequests();
    await testAcceptRequest();
    await new Promise(r => setTimeout(r, 500)); // Small delay
    await testGetFriends();
    console.log('\n=== TESTS COMPLETED ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

runTests();
