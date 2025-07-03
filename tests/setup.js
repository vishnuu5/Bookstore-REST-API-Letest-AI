// Set test environment variables BEFORE any imports
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";

// Global test setup
const fs = require("fs").promises;
const path = require("path");
const { beforeAll, beforeEach, afterAll } = require("@jest/globals");

const TEST_DATA_DIR = path.join(__dirname, "..", "data");
const TEST_BOOKS_FILE = path.join(TEST_DATA_DIR, "books.json");
const TEST_USERS_FILE = path.join(TEST_DATA_DIR, "users.json");

// Ensure clean test environment
const setupTestEnvironment = async () => {
  try {
    // Ensure data directory exists
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });

    // Write clean empty arrays to both files
    await fs.writeFile(TEST_BOOKS_FILE, "[]", "utf8");
    await fs.writeFile(TEST_USERS_FILE, "[]", "utf8");
  } catch (error) {
    console.warn("Setup test environment error:", error.message);
  }
};

// Clean up test data
const cleanupTestEnvironment = async () => {
  try {
    await fs.writeFile(TEST_BOOKS_FILE, "[]", "utf8");
    await fs.writeFile(TEST_USERS_FILE, "[]", "utf8");
  } catch (error) {
    console.warn("Cleanup test environment error:", error.message);
  }
};

// Global setup - run once before all tests
beforeAll(async () => {
  await setupTestEnvironment();
});

// Clean up before each test
beforeEach(async () => {
  await cleanupTestEnvironment();
});

// Clean up after all tests
afterAll(async () => {
  await cleanupTestEnvironment();
});

module.exports = {
  setupTestEnvironment,
  cleanupTestEnvironment,
};
