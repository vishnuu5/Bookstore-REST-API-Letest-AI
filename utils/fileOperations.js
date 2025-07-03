const fs = require("fs").promises;
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const BOOKS_FILE = path.join(DATA_DIR, "books.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
};

// Safe JSON parse with fallback
const safeJsonParse = (data) => {
  try {
    const trimmed = data.trim();
    if (!trimmed || trimmed === "") {
      return [];
    }
    return JSON.parse(trimmed);
  } catch (error) {
    console.warn("JSON parse error, returning empty array:", error.message);
    return [];
  }
};

// Read books from file using fs.promises as specified
const readBooks = async () => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(BOOKS_FILE, "utf8");
    return safeJsonParse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // File doesn't exist, return empty array and create file
      await writeBooks([]);
      return [];
    }
    console.warn(
      "Error reading books file, returning empty array:",
      error.message
    );
    return [];
  }
};

// Write books to file using fs.promises as specified
const writeBooks = async (books) => {
  try {
    await ensureDataDir();
    const jsonData = JSON.stringify(books, null, 2);
    await fs.writeFile(BOOKS_FILE, jsonData, "utf8");
  } catch (error) {
    console.error("Error writing books file:", error);
    throw error;
  }
};

// Read users from file using fs.promises as specified
const readUsers = async () => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(USERS_FILE, "utf8");
    return safeJsonParse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      // File doesn't exist, return empty array and create file
      await writeUsers([]);
      return [];
    }
    console.warn(
      "Error reading users file, returning empty array:",
      error.message
    );
    return [];
  }
};

// Write users to file using fs.promises as specified
const writeUsers = async (users) => {
  try {
    await ensureDataDir();
    const jsonData = JSON.stringify(users, null, 2);
    await fs.writeFile(USERS_FILE, jsonData, "utf8");
  } catch (error) {
    console.error("Error writing users file:", error);
    throw error;
  }
};

module.exports = {
  readBooks,
  writeBooks,
  readUsers,
  writeUsers,
};
