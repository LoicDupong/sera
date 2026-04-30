const path = require('path');
const sequelize = require('../config/database');

const migrationsPath = path.join(__dirname, 'migrations');
const fs = require('fs');

async function migrate() {
  try {
    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.js')).sort();

    console.log('Running migrations...');

    for (const file of migrationFiles) {
      const migration = require(path.join(migrationsPath, file));
      console.log(`Executing: ${file}`);
      await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      console.log(`✓ ${file} completed`);
    }

    console.log('\nAll migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

const command = process.argv[2];

if (command === 'migrate') {
  migrate();
} else {
  console.error('Unknown command:', command);
  process.exit(1);
}
