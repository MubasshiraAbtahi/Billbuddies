import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize = (roles = []) => {
  return async (req, res, next) => {
    try {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Unauthorized role' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Authorization failed' });
    }
  };
};
