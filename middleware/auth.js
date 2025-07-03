const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: "Access token is required",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken,
};
