#!/usr/bin/env node

/**
 * Bill Buddies - Project Validation Script
 * Verifies all required files and components are in place
 * 
 * Run: node validate-setup.js
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = {
  'Backend Setup': [
    'backend/server.js',
    'backend/package.json',
    'backend/middleware/auth.js',
    'backend/middleware/errorHandler.js',
    'backend/models/User.js',
    'backend/models/Expense.js',
    'backend/models/Group.js',
    'backend/models/Friend.js',
    'backend/models/Payment.js',
    'backend/routes/auth.js',
    'backend/routes/expense.js',
    'backend/routes/group.js',
    'backend/routes/friend.js',
    'backend/routes/payment.js',
    'backend/utils/db.js',
  ],
  'Frontend Setup': [
    'frontend/package.json',
    'frontend/src/index.js',
    'frontend/src/App.js',
    'frontend/src/context/AuthContext.js',
    'frontend/src/context/GroupContext.js',
    'frontend/src/pages/Dashboard.js',
    'frontend/src/pages/LoginPage.js',
    'frontend/src/pages/SignupPage.js',
    'frontend/src/pages/FriendsPage.js',
    'frontend/src/pages/GroupsPage.js',
    'frontend/src/components/TopNav.js',
    'frontend/src/components/BalanceSummaryCard.js',
    'frontend/src/components/OutstandingBalances.js',
    'frontend/src/components/ActivityFeed.js',
    'frontend/src/components/QuickAccessCards.js',
    'frontend/src/components/AddExpenseModal.js',
    'frontend/src/components/SettleUpModal.js',
  ],
  'Documentation': [
    'TESTING_GUIDE.md',
    'QUICK_START.md',
    'PROGRESS.md',
    'IMPLEMENTATION_COMPLETE.md',
    'README.md',
  ],
  'Test Files': [
    'backend/test-flow.js',
  ],
};

const REQUIRED_PACKAGES = {
  Backend: [
    'express',
    'mongoose',
    'jsonwebtoken',
    'bcryptjs',
    'dotenv',
    'socket.io',
    'multer',
  ],
  Frontend: [
    'react',
    'react-router-dom',
    'react-hot-toast',
    '@heroicons/react',
    'tailwindcss',
  ],
};

function checkFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  return fs.existsSync(fullPath);
}

function getPackageJson(type) {
  const fullPath = path.join(__dirname, `${type === 'Backend' ? 'backend' : 'frontend'}/package.json`);
  try {
    const data = fs.readFileSync(fullPath, 'utf8');
    const json = JSON.parse(data);
    return json.dependencies || {};
  } catch (e) {
    return {};
  }
}

console.log('\n🔍 Bill Buddies - Project Validation\n');
console.log('=====================================\n');

let allValid = true;

// Check files
for (const [category, files] of Object.entries(REQUIRED_FILES)) {
  console.log(`📋 ${category}:`);

  let categoryValid = true;
  let count = 0;

  for (const file of files) {
    const exists = checkFile(file);
    const status = exists ? '✅' : '❌';

    if (!exists) {
      categoryValid = false;
      allValid = false;
      console.log(`  ${status} ${file}`);
    } else {
      count++;
    }
  }

  if (categoryValid) {
    console.log(`  ✅ All ${count} files present`);
  } else {
    console.log(`  ⚠️  Missing ${files.length - count} file(s)\n`);
  }

  console.log('');
}

// Check packages
console.log('📦 Dependencies:');

for (const [type, packages] of Object.entries(REQUIRED_PACKAGES)) {
  const deps = getPackageJson(type);
  let installed = 0;
  let missing = [];

  for (const pkg of packages) {
    if (deps[pkg]) {
      installed++;
    } else {
      missing.push(pkg);
    }
  }

  if (missing.length === 0) {
    console.log(`  ✅ ${type}: All ${installed} packages installed`);
  } else {
    console.log(
      `  ⚠️  ${type}: ${installed}/${packages.length} packages installed`
    );
    missing.forEach((pkg) => console.log(`     ❌ Missing: ${pkg}`));
    allValid = false;
  }
}

// Summary
console.log('\n' + '='.repeat(37) + '\n');

if (allValid) {
  console.log('✅ All validations passed! Ready to test.\n');
  console.log('Next steps:');
  console.log('1. Start backend: cd backend && npm install && node server.js');
  console.log('2. Start frontend: cd frontend && npm install && npm start');
  console.log('3. Run tests: node backend/test-flow.js');
  console.log('4. Review TESTING_GUIDE.md for manual test scenarios\n');
} else {
  console.log(
    '❌ Some validations failed. Please review the issues above.\n'
  );
  console.log('To fix:');
  console.log(
    '1. Install missing packages: npm install (in backend and frontend)'
  );
  console.log('2. Create any missing files/directories');
  console.log('3. Re-run this validation script\n');
}

process.exit(allValid ? 0 : 1);
