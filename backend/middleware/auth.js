// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const blacklist = new Set();

// generate short-lived JWT for a user object (expects user._id and user.email)
function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

function revokeToken(token) {
  blacklist.add(token);
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: "No token" });
  }

  const token = auth.split(' ')[1];
  if (blacklist.has(token)) return res.status(401).json({ message: "Token revoked" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { generateToken, revokeToken, authMiddleware };
