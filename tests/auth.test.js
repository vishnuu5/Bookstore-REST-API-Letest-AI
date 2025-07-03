const request = require("supertest");

// Import app after environment is set in setup.js
const app = require("../app");

describe("Authentication Endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "User registered successfully"
      );
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toHaveProperty("email", userData.email);
      expect(response.body.user).toHaveProperty("name", userData.name);
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("createdAt");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should register user without name (optional field)", async () => {
      const userData = {
        email: "test2@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "User registered successfully"
      );
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toHaveProperty("email", userData.email);
      expect(response.body.user).toHaveProperty("name", "test2"); // Should default to email prefix
    });

    it("should return error for missing email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ password: "password123" })
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "Email and password are required"
      );
    });

    it("should return error for missing password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com" })
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "Email and password are required"
      );
    });

    it("should return error for invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "Please provide a valid email address"
      );
    });

    it("should return error for short password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test2@example.com",
          password: "123",
        })
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "Password must be at least 6 characters long"
      );
    });

    it("should return error for duplicate email", async () => {
      const userData = {
        email: "duplicate@example.com",
        password: "password123",
      };

      // Register first user
      await request(app).post("/api/auth/register").send(userData).expect(201);

      // Try to register with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty(
        "error",
        "User with this email already exists"
      );
    });
  });

  describe("POST /api/auth/login", () => {
    const testUser = {
      email: "logintest@example.com",
      password: "password123",
      name: "Login Test User",
    };

    beforeEach(async () => {
      // Register a user for login tests
      await request(app).post("/api/auth/register").send(testUser);
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("message", "Login successful");
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toHaveProperty("email", testUser.email);
      expect(response.body.user).toHaveProperty("name", testUser.name);
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("createdAt");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return error for invalid password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body).toHaveProperty(
        "error",
        "Invalid email or password"
      );
    });

    it("should return error for non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        })
        .expect(401);

      expect(response.body).toHaveProperty(
        "error",
        "Invalid email or password"
      );
    });

    it("should return error for missing credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "Email and password are required"
      );
    });
  });

  describe("Authentication Token Validation", () => {
    let validToken;

    beforeEach(async () => {
      // Register and get token
      const response = await request(app).post("/api/auth/register").send({
        email: "tokentest@example.com",
        password: "password123",
      });
      validToken = response.body.token;
    });

    it("should accept valid JWT token", async () => {
      const response = await request(app)
        .get("/api/books")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("books");
    });

    it("should reject invalid JWT token", async () => {
      const response = await request(app)
        .get("/api/books")
        .set("Authorization", "Bearer invalid-token")
        .expect(403);

      expect(response.body).toHaveProperty("error", "Invalid or expired token");
    });

    it("should reject request without token", async () => {
      const response = await request(app).get("/api/books").expect(401);

      expect(response.body).toHaveProperty("error", "Access token is required");
    });
  });
});
