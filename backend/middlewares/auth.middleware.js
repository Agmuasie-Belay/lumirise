import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware to protect routes and ensure the user is logged in
export const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (format: "Bearer TOKEN")
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token and decode user ID/Role
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach user data to the request object, selecting necessary fields
      req.user = await User.findById(decoded.id).select(
        "_id name email role profilePicture"
      );
      
      if (!req.user) {
        return res.status(401).json({ success: false, message: "User not found or recently deleted" });
      }

      next();
    } catch (error) {
      // Handles token expiration, bad signature, etc.
      console.error("JWT verification error:", error);
      return res.status(401).json({ success: false, message: "Not authorized, token failed or expired" });
    }
  }

  // If the Authorization header was present but not well-formed, or if token was nullified.
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }
};

/**
 * Middleware to restrict access based on user role.
 * Usage: restrictTo('admin', 'tutor')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user.role is populated by the 'protect' middleware
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied. You do not have permission for this action." });
    }
    next();
  };
};