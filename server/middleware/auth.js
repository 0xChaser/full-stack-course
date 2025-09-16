const jwt = require("jsonwebtoken");
const User = require("../models/user");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const token = authHeader.substring(7);

    if (!token || token.trim() === '') {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.user_id);
    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    req.user = {
      user_id: decoded.user_id,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      message: "An error occurred"
    });
  }
};

module.exports = { requireAuth };
