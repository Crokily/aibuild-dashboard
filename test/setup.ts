import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from '../lib/db/schema';

// Load test environment variables
config({ path: '.env.test' });

// Create test database connection
let testDbInstance: ReturnType<typeof drizzle> | null = null;

export const getTestDb = () => {
  if (!testDbInstance) {
    testDbInstance = drizzle(sql, { schema });
  }
  return testDbInstance;
};

// Setup function to run before each test
export async function setupTestDb() {
  try {
    const db = getTestDb();
    // Clear test data before each test run
    await db.delete(schema.dailyRecords);
    await db.delete(schema.products);
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}

// Cleanup function to run after all tests
export async function cleanupTestDb() {
  try {
    if (testDbInstance) {
      const db = getTestDb();
      // Clean up test data
      await db.delete(schema.dailyRecords);
      await db.delete(schema.products);
    }
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
  }
}
