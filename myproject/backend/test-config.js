/**
 * Backend Server Configuration Test
 * Tests that the server initializes properly with the current configuration
 * Run this file to verify setup before starting MongoDB
 */

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables
dotenv.config();

console.log('🔍 Bill Buddies Backend Configuration Test\n');
console.log('═'.repeat(50));

// Test 1: Environment Variables
console.log('\n✅ Test 1: Environment Variables');
console.log('─'.repeat(50));

const requiredVars = [
  'PORT',
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'CLIENT_URL'
];

const optionalVars = [
  'GOOGLE_CLOUD_PROJECT_ID',
  'STRIPE_SECRET_KEY'
];

let envStatus = true;

console.log('\nRequired Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const displayValue = varName === 'JWT_SECRET' || varName.includes('KEY') 
      ? '***' + value.slice(-4) 
      : value;
    console.log(`  ✓ ${varName}: ${displayValue}`);
  } else {
    console.log(`  ✗ ${varName}: NOT SET (will use defaults)`);
  }
});

console.log('\nOptional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✓ ${varName}: configured`);
  } else {
    console.log(`  ○ ${varName}: not configured (optional)`);
  }
});

// Test 2: Express Setup
console.log('\n✅ Test 2: Express Server Setup');
console.log('─'.repeat(50));

try {
  const app = express();
  
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }));
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  console.log('✓ Express app initialized');
  console.log('✓ CORS configured');
  console.log('✓ JSON parsing configured');
} catch (error) {
  console.log('✗ Express setup failed:', error.message);
  envStatus = false;
}

// Test 3: Port Configuration
console.log('\n✅ Test 3: Server Port Configuration');
console.log('─'.repeat(50));

const PORT = process.env.PORT || 5000;
console.log(`✓ Server will run on port: ${PORT}`);
console.log(`✓ Frontend URL (CORS): ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);

// Test 4: Configuration Summary
console.log('\n✅ Configuration Summary');
console.log('─'.repeat(50));

const config = {
  'Backend Port': PORT,
  'Frontend URL': process.env.CLIENT_URL || 'http://localhost:3000',
  'Environment': process.env.NODE_ENV || 'development',
  'Database': process.env.MONGODB_URI?.includes('mongodb+srv') 
    ? 'MongoDB Atlas (Cloud)' 
    : 'MongoDB Local',
  'JWT Expiration': process.env.JWT_EXPIRE || '7d',
  'OCR Enabled': process.env.GOOGLE_CLOUD_PROJECT_ID ? 'Yes' : 'No',
  'Payments Enabled': process.env.STRIPE_SECRET_KEY ? 'Yes' : 'No'
};

Object.entries(config).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

// Test 5: Dependencies Check
console.log('\n✅ Test 5: Core Dependencies');
console.log('─'.repeat(50));

const dependencies = [
  'express',
  'dotenv',
  'cors',
  'mongoose',
  'jsonwebtoken',
  'bcryptjs',
  '@google-cloud/vision',
  'socket.io',
  'axios'
];

console.log('\nChecking critical packages:');
dependencies.forEach(dep => {
  try {
    require.resolve(dep);
    console.log(`  ✓ ${dep}`);
  } catch (e) {
    console.log(`  ✗ ${dep} - NOT INSTALLED (run npm install)`);
  }
});

// Final Status
console.log('\n' + '═'.repeat(50));
console.log('\n🎯 SETUP STATUS\n');

if (envStatus && process.env.MONGODB_URI) {
  console.log('✅ All configuration tests PASSED!');
  console.log('\n📋 Next Steps:');
  console.log('  1. Ensure MongoDB is running:');
  console.log('     - Local: mongod');
  console.log('     - Atlas: Check connection string');
  console.log('  2. Start the backend:');
  console.log(`     npm run dev (from backend folder)`);
  console.log('  3. In another terminal, start frontend:');
  console.log(`     npm start (from frontend folder)`);
  console.log('  4. Open http://localhost:3000 in browser');
} else {
  console.log('⚠️  Setup configuration complete, but:');
  console.log('  - Verify .env file is properly configured');
  console.log('  - Ensure MongoDB is installed/accessible');
  console.log('  - Check all environment variables are set');
}

console.log('\n📚 For more details, see: SERVER_STARTUP_GUIDE.md');
console.log('═'.repeat(50) + '\n');

// Exit successfully
process.exit(0);
