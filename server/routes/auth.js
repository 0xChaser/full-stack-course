const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const User = require("../models/user");

router.post("/register/", async (req, res) => {
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
});

router.post("/login/", async (req, res) => {
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
});


const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const token = authHeader.substring(7);

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
    console.error(error.message)
    return res.status(500).json({
        message: "An error occured"
    })
  }
};

router.requireAuth = requireAuth;
module.exports = router;