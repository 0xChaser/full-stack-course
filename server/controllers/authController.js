const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const register = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    const userData = {
      ...req.body,
      password: hashedPassword,
    };

    const newUser = new User(userData);
    const savedUser = await newUser.save();

    const userResponse = {
      id: savedUser._id,
      email: savedUser.email,
    };

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { 
        user_id: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: "24h" 
      }
    );

    const userResponse = {
      id: user.id,
      email: user.email,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: userResponse,
      expiresIn: "24h"
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login
};
