# Bookstore REST API

A comprehensive RESTful API for a bookstore application built with Node.js and Express. Features JWT authentication, CRUD operations for books, file-based data persistence, and advanced search capabilities.

## 🚀 Features

### Core Features

- **User Authentication**: JWT-based authentication with registration and login
- **Book Management**: Full CRUD operations for books
- **File-Based Persistence**: Data stored in JSON files using Node.js fs.promises
- **Authorization**: Users can only modify books they created
- **Request Logging**: All requests are logged with timestamp and IP
- **Error Handling**: Comprehensive error handling with meaningful messages

### Bonus Features

- **Search by Genre**: Filter books by genre using query parameters
- **Pagination**: Support for paginated results with customizable page size
- **UUID Generation**: Unique identifiers for all books using the uuid package
- **Advanced Search**: Search across title, author, and genre
- **Rate Limiting**: Protection against abuse with request rate limiting
- **Security Headers**: Enhanced security with Helmet.js
- **Test Suite**: Comprehensive test coverage using Jest and Supertest

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/vishnuu5/Bookstore-REST-API-Letest-AI.git
cd bookstore-rest-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables (optional)**
   Create a \`.env\` file in the root directory:

```bash
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

4. **Start the server**

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on \`http://localhost:3000\`

## 📊 **Data Storage**

The project uses file-based JSON storage for development and testing:

- **`data/books.json`** - Stores all book records
- **`data/users.json`** - Stores all user accounts
- **Initial State** - Both files start empty (`[]`) and are populated as you use the API

### Getting Started with Data

1. **Register a user** - Use POST `/api/auth/register` to create your first account
2. **Login** - Use POST `/api/auth/login` to get an authentication token
3. **Add books** - Use POST `/api/books` with your token to add books to the system

**Note**: In production, you should migrate to a proper database (MongoDB, PostgreSQL, etc.)

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register a New User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe" // optional
}
```

**Response:**

```bash
{
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```bash
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Book Endpoints

**Note:** All book endpoints require authentication. Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

#### Get All Books

```bash
GET /api/books
GET /api/books?page=1&limit=10
GET /api/books?genre=fiction
GET /api/books?search=harry
```

**Query Parameters:**

- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 10, max: 100)
- \`genre\`: Filter by genre
- \`search\`: Search in title, author, or genre

**Response:**

```bash
{
  "books": [
    {
      "id": "auto-generated UUID",
      "title": "String",
      "author": "String",
      "genre": "String",
      "publishedYear": Number,
      "userId": "ID of user who added the book"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalBooks": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Get Book by ID

```bash
GET /api/books/:id
```

#### Add New Book

```bash
POST /api/books
Content-Type: application/json

{
  "title": "Book Title",
  "author": "Author Name",
  "genre": "Genre",
  "publishedYear": 2023
}
```

#### Update Book

```bash
PUT /api/books/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "author": "Updated Author",
  "genre": "Updated Genre",
  "publishedYear": 2024
}
```

**Note:** You can only update books that you created.

#### Delete Book

```bash
DELETE /api/books/:id
```

**Note:** You can only delete books that you created.

#### Search Books by Genre

```bash
GET /api/books/search?genre=fiction
```

### Health Check

```bash
GET /api/health
```

## 🧪 Testing

The project includes comprehensive test coverage using Jest and Supertest.

### Test Setup

- **Automated cleanup** - Tests automatically reset data files before each test
- **Isolated environment** - Each test runs with a clean slate
- **Environment variables** - Test-specific JWT secrets and configurations

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (if you have nodemon installed globally)
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

### Test Coverage

The project includes tests for:

- ✅ User registration and login
- ✅ JWT token validation
- ✅ Book CRUD operations
- ✅ Authorization (users can only modify their own books)
- ✅ Input validation and error handling
- ✅ Search and pagination functionality
- ✅ API health checks

### Test Files

- **`tests/auth.test.js`** - Authentication endpoint tests
- **`tests/books.test.js`** - Book management endpoint tests
- **`tests/setup.js`** - Global test configuration and cleanup

#### 3. JWT Token Issues

- Ensure `JWT_SECRET` is set in your `.env` file
- Tokens expire after 24 hours - get a new token by logging in again
- Make sure to include `Bearer ` prefix in Authorization header

#### 4. Test Environment Issues

```bash
# Reset test environment
rm -rf data/ coverage/
npm test
```

### Debug Mode

To run the server with detailed logging:

```bash
NODE_ENV=development npm start
```

### API Testing Tips

1. **Use Postman or Thunder Client** for manual API testing
2. **Check response headers** for detailed error information
3. **Verify JSON format** in request bodies
4. **Include proper Authorization headers** for protected endpoints

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Passwords are hashed using bcryptjs with salt rounds
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Helmet.js for security headers
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS**: Cross-Origin Resource Sharing configuration
- **Authorization**: Users can only modify their own books

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
