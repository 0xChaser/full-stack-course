const {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} = require("../../controllers/contactController");
const Contact = require("../../models/contact");
const {
  createTestUser,
  createTestContact,
  validContactData,
} = require("../utils/testHelpers");

describe("Contact Controller", () => {
  let req, res, testUser, userId;

  beforeEach(async () => {
    testUser = await createTestUser();
    userId = testUser._id.toString();

    req = {
      body: {},
      params: {},
      user: {
        user_id: userId,
        email: testUser.email,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("createContact", () => {
    it("should create a new contact successfully", async () => {
      const contactData = {
        email: "newcontact@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "1234567890",
      };

      req.body = contactData;

      jest.spyOn(Contact, "findOne").mockResolvedValue(null);

      await createContact(req, res);

      expect(Contact.findOne).toHaveBeenCalledWith({
        phone: contactData.phone,
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contact added successfully",
        contact: expect.objectContaining({
          email: contactData.email,
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          phone: contactData.phone,
          user_id: userId,
        }),
      });
    });

    it("should return error if contact with same phone already exists for user", async () => {
      const contactData = {
        email: "newcontact@example.com",
        firstName: "John",
        lastName: "ExistingLastName",
        phone: "1234567890",
      };

      req.body = contactData;

      const existingContact = { phone: contactData.phone, user_id: userId };
      jest.spyOn(Contact, "findOne").mockResolvedValue(existingContact);

      await createContact(req, res);

      expect(Contact.findOne).toHaveBeenCalledWith({
        phone: contactData.phone,
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contact with this phone already exists",
      });
    });

    it("should handle creation errors", async () => {
      const contactData = {
        email: "newcontact@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "1234567890",
      };

      req.body = contactData;

      jest.spyOn(Contact, "findOne").mockResolvedValue(null);

      const errorMessage = "Database error";
      jest
        .spyOn(Contact.prototype, "save")
        .mockRejectedValue(new Error(errorMessage));

      await createContact(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });
  });

  describe("getAllContacts", () => {
    it("should get all contacts for user successfully", async () => {
      const mockContacts = [
        {
          _id: "contact1",
          email: "contact1@example.com",
          firstName: "John",
          lastName: "Doe",
          phone: "1234567890",
        },
        {
          _id: "contact2",
          email: "contact2@example.com",
          firstName: "Jane",
          lastName: "Smith",
          phone: "9876543210",
        },
      ];

      jest.spyOn(Contact, "find").mockResolvedValue(mockContacts);

      await getAllContacts(req, res);

      expect(Contact.find).toHaveBeenCalledWith({ user_id: userId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contacts retrieved successfully",
        contacts: mockContacts.map((contact) => ({
          id: contact._id,
          email: contact.email,
          firstName: contact.firstName,
          lastName: contact.lastName,
          phone: contact.phone,
        })),
        count: mockContacts.length,
      });
    });

    it("should return empty array if no contacts found", async () => {
      jest.spyOn(Contact, "find").mockResolvedValue([]);

      await getAllContacts(req, res);

      expect(Contact.find).toHaveBeenCalledWith({ user_id: userId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contacts retrieved successfully",
        contacts: [],
        count: 0,
      });
    });

    it("should handle retrieval errors", async () => {
      const errorMessage = "Database error";
      jest.spyOn(Contact, "find").mockRejectedValue(new Error(errorMessage));

      await getAllContacts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });
  });

  describe("getContactById", () => {
    it("should get contact by id successfully", async () => {
      const contactId = "contact123";
      req.params.id = contactId;

      const mockContact = {
        _id: contactId,
        email: "contact@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "1234567890",
      };

      jest.spyOn(Contact, "findOne").mockResolvedValue(mockContact);

      await getContactById(req, res);

      expect(Contact.findOne).toHaveBeenCalledWith({
        _id: contactId,
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contact retrieved successfully",
        contact: {
          id: mockContact._id,
          email: mockContact.email,
          firstName: mockContact.firstName,
          lastName: mockContact.lastName,
          phone: mockContact.phone,
        },
      });
    });

    it("should return 404 if contact not found", async () => {
      const contactId = "nonexistent123";
      req.params.id = contactId;

      jest.spyOn(Contact, "findOne").mockResolvedValue(null);

      await getContactById(req, res);

      expect(Contact.findOne).toHaveBeenCalledWith({
        _id: contactId,
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contact not found",
      });
    });

    it("should handle retrieval errors", async () => {
      const contactId = "contact123";
      req.params.id = contactId;

      const errorMessage = "Database error";
      jest.spyOn(Contact, "findOne").mockRejectedValue(new Error(errorMessage));

      await getContactById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });
  });

  describe("updateContact", () => {
    it("should update contact successfully", async () => {
      const contactId = "contact123";
      const updateData = {
        email: "updated@example.com",
        firstName: "UpdatedName",
      };

      req.params.id = contactId;
      req.body = updateData;

      const existingContact = {
        _id: contactId,
        email: "old@example.com",
        firstName: "OldName",
        lastName: "Doe",
        phone: "1234567890",
      };

      const updatedContact = {
        _id: contactId,
        email: updateData.email,
        firstName: updateData.firstName,
        lastName: "Doe",
        phone: "1234567890",
      };

      jest.spyOn(Contact, "findOne").mockResolvedValue(existingContact);

      jest.spyOn(Contact, "findOneAndUpdate").mockResolvedValue(updatedContact);

      await updateContact(req, res);

      expect(Contact.findOne).toHaveBeenCalledWith({
        _id: contactId,
        user_id: userId,
      });
      expect(Contact.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: contactId, user_id: userId },
        updateData,
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contact updated successfully",
        contact: {
          id: updatedContact._id,
          email: updatedContact.email,
          firstName: updatedContact.firstName,
          lastName: updatedContact.lastName,
          phone: updatedContact.phone,
        },
      });
    });

    it("should return 404 if contact not found for update", async () => {
      const contactId = "nonexistent123";
      req.params.id = contactId;
      req.body = { email: "updated@example.com" };

      jest.spyOn(Contact, "findOne").mockResolvedValue(null);

      await updateContact(req, res);

      expect(Contact.findOne).toHaveBeenCalledWith({
        _id: contactId,
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contact not found",
      });
    });

    it("should return error if updating phone to existing one", async () => {
      const contactId = "contact123";
      const updateData = {
        phone: "1234567800",
      };

      req.params.id = contactId;
      req.body = updateData;

      const existingContact = {
        _id: contactId,
        phone: "1234567890",
      };

      const duplicateContact = {
        _id: "other123",
        phone: "1234567800",
      };

      jest
        .spyOn(Contact, "findOne")
        .mockResolvedValueOnce(existingContact)
        .mockResolvedValueOnce(duplicateContact);

      await updateContact(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contact with this phone already exists",
      });
    });

    it("should update contact phone when no duplicate exists", async () => {
      const contactId = "contact123";
      const updateData = {
        phone: "9999999999",
      };

      req.params.id = contactId;
      req.body = updateData;

      const existingContact = {
        _id: contactId,
        email: "existing@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "1234567890",
      };

      const updatedContact = {
        _id: contactId,
        email: "existing@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "9999999999",
      };

      jest
        .spyOn(Contact, "findOne")
        .mockResolvedValueOnce(existingContact)
        .mockResolvedValueOnce(null);

      jest.spyOn(Contact, "findOneAndUpdate").mockResolvedValue(updatedContact);

      await updateContact(req, res);

      expect(Contact.findOne).toHaveBeenCalledTimes(2);

      expect(Contact.findOne).toHaveBeenNthCalledWith(1, {
        _id: contactId,
        user_id: userId,
      });

      expect(Contact.findOne).toHaveBeenNthCalledWith(2, {
        phone: "9999999999",
        user_id: userId,
        _id: { $ne: contactId },
      });

      expect(Contact.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: contactId, user_id: userId },
        updateData,
        { new: true, runValidators: true }
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contact updated successfully",
        contact: {
          id: updatedContact._id,
          email: updatedContact.email,
          firstName: updatedContact.firstName,
          lastName: updatedContact.lastName,
          phone: updatedContact.phone,
        },
      });
    });

    it("should handle update errors", async () => {
      const contactId = "contact123";
      req.params.id = contactId;
      req.body = { email: "updated@example.com" };

      const errorMessage = "Database error";
      jest.spyOn(Contact, "findOne").mockRejectedValue(new Error(errorMessage));

      await updateContact(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });
  });

  describe("deleteContact", () => {
    it("should delete contact successfully", async () => {
      const contactId = "contact123";
      req.params.id = contactId;

      const deletedContact = {
        _id: contactId,
        firstName: "John",
        lastName: "Doe",
      };

      jest.spyOn(Contact, "findOneAndDelete").mockResolvedValue(deletedContact);

      await deleteContact(req, res);

      expect(Contact.findOneAndDelete).toHaveBeenCalledWith({
        _id: contactId,
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contact deleted successfully",
        deletedContact: {
          id: deletedContact._id,
          firstName: deletedContact.firstName,
          lastName: deletedContact.lastName,
        },
      });
    });

    it("should return 404 if contact not found for deletion", async () => {
      const contactId = "nonexistent123";
      req.params.id = contactId;

      jest.spyOn(Contact, "findOneAndDelete").mockResolvedValue(null);

      await deleteContact(req, res);

      expect(Contact.findOneAndDelete).toHaveBeenCalledWith({
        _id: contactId,
        user_id: userId,
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Contact not found",
      });
    });

    it("should handle deletion errors", async () => {
      const contactId = "contact123";
      req.params.id = contactId;

      const errorMessage = "Database error";
      jest
        .spyOn(Contact, "findOneAndDelete")
        .mockRejectedValue(new Error(errorMessage));

      await deleteContact(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });
  });
});
