const jwt = require('jsonwebtoken');
const { requireAuth } = require('../../middleware/auth');
const User = require('../../models/user');
const { createTestUser, generateTestToken } = require('../utils/testHelpers');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next, testUser, userId;

  beforeEach(async () => {
    testUser = await createTestUser();
    userId = testUser._id.toString();

    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should authenticate user with valid token', async () => {
      const token = 'valid_jwt_token';
      const decodedToken = {
        user_id: userId,
        email: testUser.email
      };

      req.headers.authorization = `Bearer ${token}`;

      jwt.verify.mockReturnValue(decodedToken);
      
      jest.spyOn(User, 'findById').mockResolvedValue(testUser);

      await requireAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(decodedToken.user_id);
      expect(req.user).toEqual({
        user_id: decodedToken.user_id,
        email: decodedToken.email
      });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 401 if no authorization header', async () => {
      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized"
      });
      expect(next).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', async () => {
      req.headers.authorization = 'Basic sometoken';

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized"
      });
      expect(next).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is just Bearer without token', async () => {
      req.headers.authorization = 'Bearer ';

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized"
      });
      expect(next).not.toHaveBeenCalled();
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should return 500 if JWT verification fails', async () => {
      const token = 'invalid_jwt_token';
      req.headers.authorization = `Bearer ${token}`;

      const errorMessage = 'Invalid token';
      jwt.verify.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      await requireAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "An error occurred"
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found in database', async () => {
      const token = 'valid_jwt_token';
      const decodedToken = {
        user_id: 'nonexistent_user_id',
        email: 'nonexistent@example.com'
      };

      req.headers.authorization = `Bearer ${token}`;

      jwt.verify.mockReturnValue(decodedToken);
      
      jest.spyOn(User, 'findById').mockResolvedValue(null);

      await requireAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(decodedToken.user_id);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User not found."
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 500 if database query fails', async () => {
      const token = 'valid_jwt_token';
      const decodedToken = {
        user_id: userId,
        email: testUser.email
      };

      req.headers.authorization = `Bearer ${token}`;

      jwt.verify.mockReturnValue(decodedToken);
      
      const errorMessage = 'Database error';
      jest.spyOn(User, 'findById').mockRejectedValue(new Error(errorMessage));

      await requireAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(decodedToken.user_id);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "An error occurred"
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle expired token', async () => {
      const token = 'expired_jwt_token';
      req.headers.authorization = `Bearer ${token}`;

      const expiredError = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw expiredError;
      });

      await requireAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "An error occurred"
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle malformed token', async () => {
      const token = 'malformed_jwt_token';
      req.headers.authorization = `Bearer ${token}`;

      const malformedError = new Error('jwt malformed');
      malformedError.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw malformedError;
      });

      await requireAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "An error occurred"
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should extract token correctly from authorization header', async () => {
      const token = 'test_token_123';
      const decodedToken = {
        user_id: userId,
        email: testUser.email
      };

      req.headers.authorization = `Bearer ${token}`;

      jwt.verify.mockReturnValue(decodedToken);
      
      jest.spyOn(User, 'findById').mockResolvedValue(testUser);

      await requireAuth(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(next).toHaveBeenCalled();
    });

    it('should set req.user with correct user data', async () => {
      const token = 'valid_jwt_token';
      const decodedToken = {
        user_id: userId,
        email: testUser.email
      };

      req.headers.authorization = `Bearer ${token}`;

      jwt.verify.mockReturnValue(decodedToken);
      
      jest.spyOn(User, 'findById').mockResolvedValue(testUser);

      await requireAuth(req, res, next);

      expect(req.user).toEqual({
        user_id: decodedToken.user_id,
        email: decodedToken.email
      });
      expect(next).toHaveBeenCalled();
    });
  });
});
