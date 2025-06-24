const fs = require('fs');
const path = require('path');

console.log('🧹 Starting project cleanup...');

// Files and directories to remove (unnecessary test files, debug files, etc.)
const filesToRemove = [
  // Test files
  'test-*.js',
  'test_*.js',
  '*-test.js',
  '*test.js',
  'test-*.html',
  
  // Debug files
  'debug-*.js',
  
  // Check files
  'check-*.js',
  'check-*.bat',
  
  // Server variants and test servers
  'basic-server.js',
  'server-check.js',
  'server-simplified.js',
  'server-test.bat',
  'simple-server-test.js',
  'simple-server.js',
  'direct-server-test.js',
  'final-verification-test.js',
  
  // Start scripts (keeping only essential ones)
  'start-and-test-server.js',
  'start-backend.bat',
  'start-clean.bat',
  'start-client.bat',
  'start-full-stack.bat',
  'start-original-server.bat',
  'start-react-app.bat',
  'start-server-5000.bat',
  'start-server-final.bat',
  'start-server-simple.bat',
  'start-server-test.bat',
  'start-server.bat',
  'start-server.js',
  'start-server.ps1',
  'start-simple-server.js',
  'start-simple.bat',
  'start-test-server-reliable.bat',
  'start-test-server.bat',
  'start-working-server.bat',
  'START_SERVER.bat',
  
  // Browser test files
  'browser-test-script.js',
  'create-browser-test.js',
  'admin-login-test.html',
  'transaction-page-test.html',
  
  // Utility and setup files (development only)
  'add-user-address-fields.js',
  'setup-and-test-users.js',
  'run-customer-migration.js',
  'prove-cart-isolation.js',
  'quick-cart-test.js',
  'quick-test-api.js',
  'fix-custom-orders.js',
  
  // Create files
  'create-*.js',
  
  // Free port utility
  'free-port-3001.bat',
  
  // Backup files
  'package-backup.json',
  
  // SQL files in root (should be in server/sql)
  'create_cancellation_requests_table.sql',
  'create_products_table.sql',
  'test-database.sql',
  
  // Setup files
  'setup-enhanced-database.bat'
];

// Keep these essential files
const essentialFiles = [
  'package.json',
  'package-lock.json',
  'README.md',
  '.gitignore',
  'working-server.js',
  'RUN-SERVER.bat',
  'RUN-CLIENT.bat'
];

// Essential directories to keep
const essentialDirs = [
  '.git',
  '.vscode', 
  'client',
  'server',
  'src',
  'public',
  'node_modules',
  'uploads',
  'database',
  'docs',
  'postman',
  'backups'
];

function isGlobMatch(filename, pattern) {
  const regex = pattern.replace(/\*/g, '.*');
  return new RegExp(`^${regex}$`).test(filename);
}

function shouldRemove(filename) {
  // Don't remove essential files
  if (essentialFiles.includes(filename)) return false;
  
  // Don't remove essential directories
  if (essentialDirs.includes(filename)) return false;
  
  // Check if file matches any removal pattern
  return filesToRemove.some(pattern => isGlobMatch(filename, pattern));
}

// Get all files in root directory
const rootFiles = fs.readdirSync('.', { withFileTypes: true });

let removedCount = 0;
let errors = [];

rootFiles.forEach(dirent => {
  const filename = dirent.name;
  
  if (shouldRemove(filename)) {
    try {
      if (dirent.isDirectory()) {
        fs.rmSync(filename, { recursive: true, force: true });
        console.log(`🗂️  Removed directory: ${filename}`);
      } else {
        fs.unlinkSync(filename);
        console.log(`📄 Removed file: ${filename}`);
      }
      removedCount++;
    } catch (error) {
      errors.push(`Failed to remove ${filename}: ${error.message}`);
    }
  }
});

console.log(`\n✅ Cleanup complete!`);
console.log(`📊 Removed ${removedCount} files/directories`);

if (errors.length > 0) {
  console.log(`\n⚠️  Errors encountered:`);
  errors.forEach(error => console.log(`   ${error}`));
}

console.log(`\n📋 Kept essential files:`);
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✓ ${file}`);
  }
});

console.log(`\n📁 Kept essential directories:`);
essentialDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`   ✓ ${dir}`);
  }
});
