import fs from 'fs';
import path from 'path';

async function globalSetup() {
  const dbPath = path.resolve(process.cwd(), 'lib/data/db.json');
  const backupPath = path.resolve(process.cwd(), 'lib/data/db.json.bak');
  const mockPath = path.resolve(process.cwd(), 'tests/mocks/db.mock.json');

  // 1. Create backup of original data if it exists and backup doesn't already exist
  if (fs.existsSync(dbPath) && !fs.existsSync(backupPath)) {
    fs.copyFileSync(dbPath, backupPath);
    console.log('✅ Backup of production db.json created.');
  }

  // 2. Replace with mock data
  if (fs.existsSync(mockPath)) {
    fs.copyFileSync(mockPath, dbPath);
    console.log('🚀 Mock data injected for E2E tests.');
  } else {
    console.warn('⚠️ Mock data file not found at:', mockPath);
  }
}

export default globalSetup;
