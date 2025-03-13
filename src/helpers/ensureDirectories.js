/**
 * This script ensures that all required directories exist in the build output
 * This is particularly important for Vercel deployments
 */

const fs = require('fs');
const path = require('path');

// Directories that need to exist in the build output
const directories = [
  'public/assets/models',
  'public/assets/models/buildingDetail', // Ensure this directory exists
  'public/assets/data'
];

// Create directories if they don't exist
directories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    console.log(`Creating directory: ${fullPath}`);
    fs.mkdirSync(fullPath, { recursive: true });
    
    // Create a .gitkeep file to ensure the directory is included in git
    fs.writeFileSync(path.join(fullPath, '.gitkeep'), '# This file ensures the directory is included in git');
  }
});

console.log('Directory structure verified');
