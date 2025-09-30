const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Representative = require('../models/Representative');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role === 'admin') {
        req.user = await Admin.findById(decoded.id).select('-password');
      } else if (decoded.role === 'field_representative') {
        req.user = await Representative.findById(decoded.id).select('-password');
      }
      
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user.role = decoded.role; // Attach role to user object
      req.user.nationalId = decoded.nationalId; // Attach nationalId for convenience

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, authorize };