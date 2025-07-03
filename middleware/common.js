// Request logging middleware
const requestLogger = (req, res, next) => {
  // Only log in non-test environments
  if (process.env.NODE_ENV !== "test") {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.path;
    const ip = req.ip || req.connection.remoteAddress;

    console.log(`[${timestamp}] ${method} ${path} - IP: ${ip}`);
  }
  next();
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      auth: ["POST /api/auth/register", "POST /api/auth/login"],
      books: [
        "GET /api/books",
        "GET /api/books/:id",
        "POST /api/books",
        "PUT /api/books/:id",
        "DELETE /api/books/:id",
        "GET /api/books/search?genre=<genre>",
      ],
      health: ["GET /api/health"],
    },
  });
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  // Only log in non-test environments
  if (process.env.NODE_ENV !== "test") {
    console.error("Error:", err);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
    });
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation error",
      details: err.message,
    });
  }

  // Default error
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};

module.exports = {
  requestLogger,
  notFoundHandler,
  errorHandler,
};
