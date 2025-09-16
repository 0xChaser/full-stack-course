const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const Contact = require('../../models/contact');

const createTestUser = async (userData = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'testpassword123'
  };
  
  const user = { ...defaultUser, ...userData };
  const hashedPassword = await bcrypt.hash(user.password, 10);
  
  const newUser = new User({
    ...user,
    password: hashedPassword
  });
  
  return await newUser.save();
};

const createTestContact = async (userId, contactData = {}) => {
  const defaultContact = {
    email: 'contact@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: 1234567890,
    user_id: userId
  };
  
  const contact = { ...defaultContact, ...contactData };
  const newContact = new Contact(contact);
  
  return await newContact.save();
};

const generateTestToken = (userId, email = 'test@example.com') => {
  return jwt.sign(
    { 
      user_id: userId, 
      email: email 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const createAuthHeaders = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const validUserData = {
  email: 'valid@example.com',
  password: 'validpassword123'
};

const validContactData = {
  email: 'contact@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: 1234567890
};

const invalidUserData = {
  noEmail: { password: 'password123' },
  noPassword: { email: 'test@example.com' },
  invalidEmail: { email: 'invalid-email', password: 'password123' },
  shortPassword: { email: 'test@example.com', password: '123' }
};

const invalidContactData = {
  noEmail: { firstName: 'John', lastName: 'Doe', phone: 1234567890 },
  noFirstName: { email: 'test@example.com', lastName: 'Doe', phone: 1234567890 },
  noLastName: { email: 'test@example.com', firstName: 'John', phone: 1234567890 },
  noPhone: { email: 'test@example.com', firstName: 'John', lastName: 'Doe' },
  invalidPhone: { email: 'test@example.com', firstName: 'John', lastName: 'Doe', phone: 'invalid' }
};

module.exports = {
  createTestUser,
  createTestContact,
  generateTestToken,
  createAuthHeaders,
  validUserData,
  validContactData,
  invalidUserData,
  invalidContactData
};
