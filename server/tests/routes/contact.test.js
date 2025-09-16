const request = require('supertest');
const express = require('express');
const contactRouter = require('../../routes/contact');
const Contact = require('../../models/contact');
const { 
  createTestUser, 
  createTestContact, 
  generateTestToken, 
  createAuthHeaders,
  validContactData 
} = require('../utils/testHelpers');

jest.mock('../../middleware/auth', () => ({
  requireAuth: (req, res, next) => {
    if (req.headers['x-test-user-id'] && req.headers['x-test-user-email']) {
      req.user = {
        user_id: req.headers['x-test-user-id'],
        email: req.headers['x-test-user-email']
      };
      next();
    } else {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }
  }
}));

const app = express();
app.use(express.json());
app.use('/contact', contactRouter);

describe('Contact Routes', () => {
  let testUser, userId, authHeaders;

  beforeEach(async () => {
    testUser = await createTestUser();
    userId = testUser._id.toString();
    const token = generateTestToken(userId, testUser.email);
    authHeaders = {
      ...createAuthHeaders(token),
      'x-test-user-id': userId,
      'x-test-user-email': testUser.email
    };
  });

  describe('POST /contact', () => {
    it('should create a new contact successfully', async () => {
      const contactData = {
        email: 'newcontact@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: 1234567890
      };

      const response = await request(app)
        .post('/contact')
        .set(authHeaders)
        .send(contactData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Contact added successfully');
      expect(response.body).toHaveProperty('contact');
      expect(response.body.contact).toHaveProperty('email', contactData.email);
      expect(response.body.contact).toHaveProperty('firstName', contactData.firstName);
      expect(response.body.contact).toHaveProperty('lastName', contactData.lastName);
      expect(response.body.contact).toHaveProperty('phone', contactData.phone.toString());
      expect(response.body.contact).toHaveProperty('user_id', userId);

      const savedContact = await Contact.findOne({ 
        lastName: contactData.lastName,
        user_id: userId 
      });
      expect(savedContact).toBeTruthy();
      expect(savedContact.email).toBe(contactData.email);
    });


    it('should return error for missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        firstName: 'John'
      };

      const response = await request(app)
        .post('/contact')
        .set(authHeaders)
        .send(incompleteData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 without authentication', async () => {
      const contactData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: 1234567890
      };

      const response = await request(app)
        .post('/contact')
        .send(contactData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorized');
    });
  });

  describe('GET /contact', () => {
    it('should get all contacts for authenticated user', async () => {
      const contact1 = await createTestContact(userId, {
        email: 'contact1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: 1234567890
      });

      const contact2 = await createTestContact(userId, {
        email: 'contact2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: 9876543210
      });

      const response = await request(app)
        .get('/contact')
        .set(authHeaders)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Contacts retrieved successfully');
      expect(response.body).toHaveProperty('contacts');
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body.contacts).toHaveLength(2);

      response.body.contacts.forEach(contact => {
        expect(['contact1@example.com', 'contact2@example.com']).toContain(contact.email);
      });
    });

    it('should return empty array if no contacts found', async () => {
      const response = await request(app)
        .get('/contact')
        .set(authHeaders)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Contacts retrieved successfully');
      expect(response.body).toHaveProperty('contacts', []);
      expect(response.body).toHaveProperty('count', 0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/contact')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorized');
    });

    it('should only return contacts for authenticated user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherUserId = otherUser._id.toString();
      
      await createTestContact(otherUserId, {
        email: 'other-contact@example.com',
        lastName: 'OtherContact'
      });

      await createTestContact(userId, {
        email: 'my-contact@example.com',
        lastName: 'MyContact'
      });

      const response = await request(app)
        .get('/contact')
        .set(authHeaders)
        .expect(200);

      expect(response.body.contacts).toHaveLength(1);
      expect(response.body.contacts[0].email).toBe('my-contact@example.com');
    });
  });

  describe('GET /contact/:id', () => {
    let testContact;

    beforeEach(async () => {
      testContact = await createTestContact(userId, validContactData);
    });

    it('should get contact by id successfully', async () => {
      const contactId = testContact._id.toString();

      const response = await request(app)
        .get(`/contact/${contactId}`)
        .set(authHeaders)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Contact retrieved successfully');
      expect(response.body).toHaveProperty('contact');
      expect(response.body.contact).toHaveProperty('id', contactId);
      expect(response.body.contact).toHaveProperty('email', testContact.email);
      expect(response.body.contact).toHaveProperty('firstName', testContact.firstName);
      expect(response.body.contact).toHaveProperty('lastName', testContact.lastName);
      expect(response.body.contact).toHaveProperty('phone', testContact.phone);
    });

    it('should return 404 for non-existent contact', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/contact/${fakeId}`)
        .set(authHeaders)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Contact not found');
    });

    it('should return 404 for contact belonging to another user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherUserId = otherUser._id.toString();
      const otherContact = await createTestContact(otherUserId, {
        email: 'other@example.com',
        lastName: 'OtherLastName'
      });

      const response = await request(app)
        .get(`/contact/${otherContact._id}`)
        .set(authHeaders)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Contact not found');
    });

    it('should return 401 without authentication', async () => {
      const contactId = testContact._id.toString();

      const response = await request(app)
        .get(`/contact/${contactId}`)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorized');
    });
  });

  describe('PATCH /contact/:id', () => {
    let testContact;

    beforeEach(async () => {
      testContact = await createTestContact(userId, validContactData);
    });

    it('should update contact successfully', async () => {
      const contactId = testContact._id.toString();
      const updateData = {
        email: 'updated@example.com',
        firstName: 'UpdatedName'
      };

      const response = await request(app)
        .patch(`/contact/${contactId}`)
        .set(authHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Contact updated successfully');
      expect(response.body).toHaveProperty('contact');
      expect(response.body.contact).toHaveProperty('email', updateData.email);
      expect(response.body.contact).toHaveProperty('firstName', updateData.firstName);

      const updatedContact = await Contact.findById(contactId);
      expect(updatedContact.email).toBe(updateData.email);
      expect(updatedContact.firstName).toBe(updateData.firstName);
    });

    it('should return 404 for non-existent contact', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { email: 'updated@example.com' };

      const response = await request(app)
        .patch(`/contact/${fakeId}`)
        .set(authHeaders)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Contact not found');
    });


    it('should allow updating lastName to non-existing one', async () => {
      const contactId = testContact._id.toString();
      const updateData = {
        lastName: 'NewUniqueLastName'
      };

      const response = await request(app)
        .patch(`/contact/${contactId}`)
        .set(authHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Contact updated successfully');
      expect(response.body).toHaveProperty('contact');
      expect(response.body.contact).toHaveProperty('lastName', updateData.lastName);

      const updatedContact = await Contact.findById(contactId);
      expect(updatedContact.lastName).toBe(updateData.lastName);
    });

    it('should return 401 without authentication', async () => {
      const contactId = testContact._id.toString();
      const updateData = { email: 'updated@example.com' };

      const response = await request(app)
        .patch(`/contact/${contactId}`)
        .send(updateData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorized');
    });
  });

  describe('DELETE /contact/:id', () => {
    let testContact;

    beforeEach(async () => {
      testContact = await createTestContact(userId, validContactData);
    });

    it('should delete contact successfully', async () => {
      const contactId = testContact._id.toString();

      const response = await request(app)
        .delete(`/contact/${contactId}`)
        .set(authHeaders)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Contact deleted successfully');
      expect(response.body).toHaveProperty('deletedContact');
      expect(response.body.deletedContact).toHaveProperty('id', contactId);
      expect(response.body.deletedContact).toHaveProperty('firstName', testContact.firstName);
      expect(response.body.deletedContact).toHaveProperty('lastName', testContact.lastName);

      const deletedContact = await Contact.findById(contactId);
      expect(deletedContact).toBeNull();
    });

    it('should return 404 for non-existent contact', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/contact/${fakeId}`)
        .set(authHeaders)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Contact not found');
    });

    it('should return 404 for contact belonging to another user', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherUserId = otherUser._id.toString();
      const otherContact = await createTestContact(otherUserId, {
        email: 'other@example.com',
        lastName: 'OtherLastName'
      });

      const response = await request(app)
        .delete(`/contact/${otherContact._id}`)
        .set(authHeaders)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Contact not found');

      const stillExists = await Contact.findById(otherContact._id);
      expect(stillExists).toBeTruthy();
    });

    it('should return 401 without authentication', async () => {
      const contactId = testContact._id.toString();

      const response = await request(app)
        .delete(`/contact/${contactId}`)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Unauthorized');

      const stillExists = await Contact.findById(contactId);
      expect(stillExists).toBeTruthy();
    });
  });

  describe('Route validation', () => {
    it('should handle invalid routes', async () => {
      await request(app)
        .post('/contact/invalid')
        .set(authHeaders)
        .send({})
        .expect(404);
    });

    it('should handle invalid HTTP methods', async () => {
      await request(app)
        .put('/contact')
        .set(authHeaders)
        .send({})
        .expect(404);
    });

    it('should handle malformed contact IDs', async () => {
      const response = await request(app)
        .get('/contact/invalid-id')
        .set(authHeaders)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });
});
