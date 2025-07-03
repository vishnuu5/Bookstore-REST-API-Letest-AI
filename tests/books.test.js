const request = require("supertest");

// Import app after environment is set in setup.js
const app = require("../app");

describe("Books Endpoints", () => {
  let authToken;
  let userId;
  let secondAuthToken;
  let secondUserId;

  beforeEach(async () => {
    // Register first user and get auth token
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: "booktest@example.com",
        password: "password123",
        name: "Book Test User",
      });

    // Check if registration was successful
    if (registerResponse.status !== 201) {
      console.error("Registration failed:", registerResponse.body);
      throw new Error(
        `Registration failed with status ${registerResponse.status}`
      );
    }

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;

    // Register second user for authorization tests
    const secondRegisterResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: "booktest2@example.com",
        password: "password123",
        name: "Second Book Test User",
      });

    // Check if second registration was successful
    if (secondRegisterResponse.status !== 201) {
      console.error("Second registration failed:", secondRegisterResponse.body);
      throw new Error(
        `Second registration failed with status ${secondRegisterResponse.status}`
      );
    }

    secondAuthToken = secondRegisterResponse.body.token;
    secondUserId = secondRegisterResponse.body.user.id;
  });

  describe("POST /api/books", () => {
    it("should create a new book successfully", async () => {
      const bookData = {
        title: "Test Book",
        author: "Test Author",
        genre: "Fiction",
        publishedYear: 2023,
      };

      const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${authToken}`)
        .send(bookData)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "Book added successfully"
      );
      expect(response.body.book).toHaveProperty("title", bookData.title);
      expect(response.body.book).toHaveProperty("author", bookData.author);
      expect(response.body.book).toHaveProperty("genre", bookData.genre);
      expect(response.body.book).toHaveProperty(
        "publishedYear",
        bookData.publishedYear
      );
      expect(response.body.book).toHaveProperty("userId", userId);
      expect(response.body.book).toHaveProperty("id");
      expect(typeof response.body.book.id).toBe("string");
    });

    it("should return error without authentication", async () => {
      const bookData = {
        title: "Test Book",
        author: "Test Author",
        genre: "Fiction",
        publishedYear: 2023,
      };

      const response = await request(app)
        .post("/api/books")
        .send(bookData)
        .expect(401);

      expect(response.body).toHaveProperty("error", "Access token is required");
    });

    it("should return error for missing required fields", async () => {
      const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Test Book" })
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "Title, author, genre, and publishedYear are required"
      );
    });

    it("should return error for invalid published year", async () => {
      const response = await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Book",
          author: "Test Author",
          genre: "Fiction",
          publishedYear: "invalid",
        })
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "Published year must be a valid year"
      );
    });
  });

  describe("GET /api/books", () => {
    beforeEach(async () => {
      // Add some test books
      await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Fiction Book 1",
          author: "Fiction Author 1",
          genre: "Fiction",
          publishedYear: 2020,
        });

      await request(app)
        .post("/api/books")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Science Book 1",
          author: "Science Author 1",
          genre: "Science",
          publishedYear: 2021,
        });
    });

    it("should get all books successfully", async () => {
      const response = await request(app)
        .get("/api/books")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("books");
      expect(response.body).toHaveProperty("pagination");
      expect(Array.isArray(response.body.books)).toBe(true);
      expect(response.body.books.length).toBeGreaterThan(0);
    });

    it("should filter books by genre", async () => {
      const response = await request(app)
        .get("/api/books?genre=Fiction")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.books.length).toBeGreaterThan(0);
      response.body.books.forEach((book) => {
        expect(book.genre.toLowerCase()).toContain("fiction");
      });
    });

    it("should return error without authentication", async () => {
      const response = await request(app).get("/api/books").expect(401);

      expect(response.body).toHaveProperty("error", "Access token is required");
    });
  });

  describe("API Health Check", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/api/health").expect(200);

      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty(
        "message",
        "Bookstore API is running"
      );
      expect(response.body).toHaveProperty("timestamp");
    });
  });
});
