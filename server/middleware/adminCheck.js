// server/middleware/adminCheck.js
/**
 * Middleware to verify if the authenticated user has admin privileges
 */
module.exports = (req, res, next) => {
  console.log('AdminCheck middleware called');
  console.log('User object:', req.user);
  
  // Check if user exists and has admin role
  if (!req.user) {
    console.log('AdminCheck failed: No user object in request');
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }
  
  if (req.user.role !== 'admin') {
    console.log(`AdminCheck failed: User role is ${req.user.role}, not admin`);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  
  console.log('AdminCheck passed: User is an admin');
  // User is authenticated and has admin role, proceed
  next();
};
