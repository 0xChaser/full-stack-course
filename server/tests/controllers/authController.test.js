const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { register, login } = require('../../controllers/authController');
const User = require('../../models/user');
const { createTestUser, validUserData } = require('../utils/testHelpers');

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123'
      };
      
      req.body = userData;
      
      const hashedPassword = 'hashed_password_123';
      bcrypt.hash.mockResolvedValue(hashedPassword);

      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await register(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
        user: expect.objectContaining({
          email: userData.email
        })
      });
    });

    it('should return error if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123'
      };
      
      req.body = userData;

      const existingUser = { email: userData.email };
      jest.spyOn(User, 'findOne').mockResolvedValue(existingUser);

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User with this email already exists"
      });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should handle registration errors', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      req.body = userData;

      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      
      bcrypt.hash.mockResolvedValue('hashed_password');

      const errorMessage = 'Database error';
      jest.spyOn(User.prototype, 'save').mockRejectedValue(new Error(errorMessage));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage
      });
    });

    it('should handle bcrypt error', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      req.body = userData;

      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      const errorMessage = 'Bcrypt error';
      bcrypt.hash.mockRejectedValue(new Error(errorMessage));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage
      });
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      req.body = loginData;

      const mockUser = {
        id: 'user123',
        email: loginData.email,
        password: 'hashed_password'
      };

      const mockToken = 'jwt_token_123';

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      
      bcrypt.compare.mockResolvedValue(true);
      
      jwt.sign.mockReturnValue(mockToken);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { 
          user_id: mockUser.id, 
          email: mockUser.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email
        },
        expiresIn: "24h"
      });
    });

    it('should return error if user not found', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      req.body = loginData;

      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid email or password"
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return error if password is invalid', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      req.body = loginData;

      const mockUser = {
        id: 'user123',
        email: loginData.email,
        password: 'hashed_password'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid email or password"
      });
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should handle login errors', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      req.body = loginData;

      const errorMessage = 'Database error';
      jest.spyOn(User, 'findOne').mockRejectedValue(new Error(errorMessage));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage
      });
    });

    it('should handle bcrypt compare error', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      req.body = loginData;

      const mockUser = {
        id: 'user123',
        email: loginData.email,
        password: 'hashed_password'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      
      const errorMessage = 'Bcrypt compare error';
      bcrypt.compare.mockRejectedValue(new Error(errorMessage));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage
      });
    });

    it('should handle JWT signing error', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      req.body = loginData;

      const mockUser = {
        id: 'user123',
        email: loginData.email,
        password: 'hashed_password'
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      
      bcrypt.compare.mockResolvedValue(true);
      
      const errorMessage = 'JWT signing error';
      jwt.sign.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage
      });
    });
  });
});
