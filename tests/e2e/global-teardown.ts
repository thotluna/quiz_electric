import fs from 'fs';
import path from 'path';

async function globalTeardown() {
  const dbPath = path.resolve(process.cwd(), 'lib/data/db.json');
  const backupPath = path.resolve(process.cwd(), 'lib/data/db.json.bak');

  // 1. Restore original data from backup
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, dbPath);
    fs.unlinkSync(backupPath); // Delete backup
    console.log('🔄 Production db.json restored.');
  }
}

export default globalTeardown;
