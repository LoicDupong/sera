const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function runMigrations() {
  try {
    // Ensure migration metadata table exists
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        "name" VARCHAR(255) PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith('.js'))
      .sort();

    // Get already-executed migrations
    const executedMigrations = await sequelize.query(
      'SELECT name FROM "SequelizeMeta" ORDER BY name;',
      { type: QueryTypes.SELECT }
    );
    const executedNames = executedMigrations.map(m => m.name);

    console.log('Running migrations...\n');

    // Run pending migrations
    for (const file of migrationFiles) {
      if (executedNames.includes(file)) {
        console.log(`✓ ${file} (already applied)`);
        continue;
      }

      const migration = require(path.join(migrationsDir, file));

      try {
        console.log(`→ Running ${file}...`);
        await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" (name) VALUES (?)',
          { replacements: [file], type: QueryTypes.INSERT }
        );
        console.log(`✓ ${file} completed`);
      } catch (err) {
        console.error(`✗ ${file} failed:`, err.message);
        process.exit(1);
      }
    }

    console.log('\n✓ All migrations complete');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

const command = process.argv[2];

if (command === 'migrate') {
  runMigrations();
} else {
  console.error('Unknown command:', command);
  process.exit(1);
}
