const Contact = require('../../models/contact');
const { createTestUser, createTestContact, validContactData } = require('../utils/testHelpers');

describe('Contact Model', () => {
  let testUser;
  let userId;

  beforeEach(async () => {
    testUser = await createTestUser();
    userId = testUser._id.toString();
  });

  describe('Contact Creation', () => {
    it('should create a contact with valid data', async () => {
      const contactData = {
        email: 'contact@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: 1234567890,
        user_id: userId
      };

      const contact = new Contact(contactData);
      const savedContact = await contact.save();

      expect(savedContact._id).toBeDefined();
      expect(savedContact.email).toBe(contactData.email);
      expect(savedContact.firstName).toBe(contactData.firstName);
      expect(savedContact.lastName).toBe(contactData.lastName);
      expect(savedContact.phone).toBe(contactData.phone);
      expect(savedContact.user_id).toBe(contactData.user_id);
      expect(savedContact.createdAt).toBeDefined();
      expect(savedContact.updatedAt).toBeDefined();
    });

    it('should not create a contact without email', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: 1234567890,
        user_id: userId
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow();
    });

    it('should not create a contact without firstName', async () => {
      const contactData = {
        email: 'contact@example.com',
        lastName: 'Doe',
        phone: 1234567890,
        user_id: userId
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow();
    });

    it('should not create a contact without lastName', async () => {
      const contactData = {
        email: 'contact@example.com',
        firstName: 'John',
        phone: 1234567890,
        user_id: userId
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow();
    });

    it('should not create a contact without phone', async () => {
      const contactData = {
        email: 'contact@example.com',
        firstName: 'John',
        lastName: 'Doe',
        user_id: userId
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow();
    });

    it('should not create a contact without user_id', async () => {
      const contactData = {
        email: 'contact@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: 1234567890
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow();
    });

    it('should not create contacts with duplicate lastName for same user', async () => {
      const contactData = {
        email: 'contact1@example.com',
        firstName: 'John',
        lastName: 'Duplicate',
        phone: 1234567890,
        user_id: userId
      };

      const contact1 = new Contact(contactData);
      await contact1.save();

      const contact2Data = {
        ...contactData,
        email: 'contact2@example.com',
        firstName: 'Jane'
      };
      const contact2 = new Contact(contact2Data);
      
      await expect(contact2.save()).rejects.toThrow();
    });
  });

  describe('Contact Validation', () => {
    it('should require email field', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: 1234567890,
        user_id: userId
      };

      const contact = new Contact(contactData);
      const validationError = contact.validateSync();
      
      expect(validationError.errors.email).toBeDefined();
      expect(validationError.errors.email.message).toContain('required');
    });

    it('should require firstName field', async () => {
      const contactData = {
        email: 'contact@example.com',
        lastName: 'Doe',
        phone: 1234567890,
        user_id: userId
      };

      const contact = new Contact(contactData);
      const validationError = contact.validateSync();
      
      expect(validationError.errors.firstName).toBeDefined();
      expect(validationError.errors.firstName.message).toContain('required');
    });

    it('should require lastName field', async () => {
      const contactData = {
        email: 'contact@example.com',
        firstName: 'John',
        phone: 1234567890,
        user_id: userId
      };

      const contact = new Contact(contactData);
      const validationError = contact.validateSync();
      
      expect(validationError.errors.lastName).toBeDefined();
      expect(validationError.errors.lastName.message).toContain('required');
    });

    it('should require phone field', async () => {
      const contactData = {
        email: 'contact@example.com',
        firstName: 'John',
        lastName: 'Doe',
        user_id: userId
      };

      const contact = new Contact(contactData);
      const validationError = contact.validateSync();
      
      expect(validationError)
    });

    it('should require user_id field', async () => {
      const contactData = {
        email: 'contact@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: 1234567890
      };

      const contact = new Contact(contactData);
      const validationError = contact.validateSync();
      
      expect(validationError.errors.user_id).toBeDefined();
      expect(validationError.errors.user_id.message).toContain('required');
    });

    it('should validate phone as number', async () => {
      const contactData = {
        email: 'contact@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: 'invalid-phone',
        user_id: userId
      };

      const contact = new Contact(contactData);
      
      await expect(contact.save()).rejects.toThrow();
    });
  });

  describe('Contact Timestamps', () => {
    it('should automatically add createdAt and updatedAt timestamps', async () => {
      const contact = await createTestContact(userId, validContactData);

      expect(contact.createdAt).toBeDefined();
      expect(contact.updatedAt).toBeDefined();
      expect(contact.createdAt).toBeInstanceOf(Date);
      expect(contact.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt when contact is modified', async () => {
      const contact = await createTestContact(userId, validContactData);
      const originalUpdatedAt = contact.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      contact.email = 'updated@example.com';
      await contact.save();

      expect(contact.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Contact Methods', () => {
    it('should convert contact to JSON correctly', async () => {
      const contact = await createTestContact(userId, validContactData);
      const contactJSON = contact.toJSON();

      expect(contactJSON).toHaveProperty('_id');
      expect(contactJSON).toHaveProperty('email');
      expect(contactJSON).toHaveProperty('firstName');
      expect(contactJSON).toHaveProperty('lastName');
      expect(contactJSON).toHaveProperty('phone');
      expect(contactJSON).toHaveProperty('user_id');
      expect(contactJSON).toHaveProperty('createdAt');
      expect(contactJSON).toHaveProperty('updatedAt');
    });
  });
});
