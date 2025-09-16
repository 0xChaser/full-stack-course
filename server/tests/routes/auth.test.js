const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const authRouter = require('../../routes/auth');
const User = require('../../models/user');
const { createTestUser, validUserData } = require('../utils/testHelpers');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');

      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser.email).toBe(userData.email);
      
      const isPasswordHashed = await bcrypt.compare(userData.password, savedUser.password);
      expect(isPasswordHashed).toBe(true);
    });

    it('should return error for duplicate email', async () => {
      const existingUser = await createTestUser({
        email: 'existing@example.com',
        password: 'password123'
      });

      const userData = {
        email: existingUser.email,
        password: 'anotherpassword'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'User with this email already exists');
    });

    it('should return error for missing email', async () => {
      const userData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should return error for missing password', async () => {
      const userData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid request body', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({})
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/login', () => {
    let testUser;
    const testPassword = 'testpassword123';

    beforeEach(async () => {
      testUser = await createTestUser({
        email: 'testuser@example.com',
        password: testPassword
      });
    });

    it('should login user successfully with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: testPassword
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('expiresIn', '24h');
      
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');
      
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it('should return error for non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return error for incorrect password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should return error for missing email', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should return error for missing password', async () => {
      const loginData = {
        email: testUser.email
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should return error for empty request body', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should handle case-sensitive email', async () => {
      const loginData = {
        email: testUser.email.toUpperCase(),
        password: testPassword
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should return token with correct format', async () => {
      const loginData = {
        email: testUser.email,
        password: testPassword
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      const tokenParts = response.body.token.split('.');
      expect(tokenParts).toHaveLength(3);
    });
  });

  describe('Route validation', () => {
    it('should handle invalid routes', async () => {
      await request(app)
        .post('/auth/invalid')
        .send({})
        .expect(404);
    });

    it('should handle GET requests on POST routes', async () => {
      await request(app)
        .get('/auth/register')
        .expect(404);

      await request(app)
        .get('/auth/login')
        .expect(404);
    });

    it('should handle PUT requests on POST routes', async () => {
      await request(app)
        .put('/auth/register')
        .send({})
        .expect(404);

      await request(app)
        .put('/auth/login')
        .send({})
        .expect(404);
    });

    it('should handle DELETE requests on POST routes', async () => {
      await request(app)
        .delete('/auth/register')
        .expect(404);

      await request(app)
        .delete('/auth/login')
        .expect(404);
    });
  });
});
