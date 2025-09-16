const User = require('../../models/user');
const { createTestUser, validUserData } = require('../utils/testHelpers');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'hashedpassword123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.password).toBe(userData.password);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should not create a user without email', async () => {
      const userData = {
        password: 'hashedpassword123'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should not create a user without password', async () => {
      const userData = {
        email: 'test@example.com'
      };

      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should not create users with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'hashedpassword123'
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('User Validation', () => {
    it('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'hashedpassword123'
      };

      const user = new User(userData);
      
      const savedUser = await user.save();
      expect(savedUser.email).toBe(userData.email);
    });

    it('should require email field', async () => {
      const userData = {
        password: 'hashedpassword123'
      };

      const user = new User(userData);
      const validationError = user.validateSync();
      
      expect(validationError.errors.email).toBeDefined();
      expect(validationError.errors.email.message).toContain('required');
    });

    it('should require password field', async () => {
      const userData = {
        email: 'test@example.com'
      };

      const user = new User(userData);
      const validationError = user.validateSync();
      
      expect(validationError.errors.password).toBeDefined();
      expect(validationError.errors.password.message).toContain('required');
    });
  });

  describe('User Timestamps', () => {
    it('should automatically add createdAt and updatedAt timestamps', async () => {
      const user = await createTestUser(validUserData);

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when user is modified', async () => {
      const user = await createTestUser(validUserData);
      const originalUpdatedAt = user.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      user.email = 'updated@example.com';
      await user.save();

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('User Methods', () => {
    it('should convert user to JSON correctly', async () => {
      const user = await createTestUser(validUserData);
      const userJSON = user.toJSON();

      expect(userJSON).toHaveProperty('_id');
      expect(userJSON).toHaveProperty('email');
      expect(userJSON).toHaveProperty('password');
      expect(userJSON).toHaveProperty('createdAt');
      expect(userJSON).toHaveProperty('updatedAt');
    });
  });
});
