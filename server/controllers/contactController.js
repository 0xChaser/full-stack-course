const Contact = require("../models/contact");

const createContact = async (req, res) => {
  try {
    const existingContact = await Contact.findOne({
      phone: req.body.phone,
      user_id: req.user.user_id
    });
    
    if (existingContact) {
      return res.status(400).json({
        message: "Contact with this phone already exists"
      });
    }
    
    const contactData = {
      ...req.body,
      user_id: req.user.user_id
    };

    const newContact = new Contact(contactData);
    const savedContact = await newContact.save();
    
    const contactResponse = {
      id: savedContact._id,
      email: savedContact.email,
      firstName: savedContact.firstName,
      lastName: savedContact.lastName,
      phone: savedContact.phone,
      user_id: savedContact.user_id
    };

    res.status(201).json({
      message: "Contact added successfully",
      contact: contactResponse
    });
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: error.message
    });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ user_id: req.user.user_id });
    
    const contactsResponse = contacts.map(contact => ({
      id: contact._id,
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
    }));

    res.status(200).json({
      message: "Contacts retrieved successfully",
      contacts: contactsResponse,
      count: contactsResponse.length
    });
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: error.message
    });
  }
};

const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user_id: req.user.user_id
    });

    if (!contact) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }

    const contactResponse = {
      id: contact._id,
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
    };

    res.status(200).json({
      message: "Contact retrieved successfully",
      contact: contactResponse
    });
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: error.message
    });
  }
};

const updateContact = async (req, res) => {
  try {
    const contactId = req.params.id;
    
    const existingContact = await Contact.findOne({
      _id: contactId,
      user_id: req.user.user_id
    });

    if (!existingContact) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }

    if (req.body.phone && req.body.phone !== existingContact.phone) {
      const duplicateContact = await Contact.findOne({
        phone: req.body.phone,
        user_id: req.user.user_id,
        _id: { $ne: contactId }
      });

      if (duplicateContact) {
        return res.status(400).json({
          message: "Contact with this phone already exists"
        });
      }
    }

    const allowedUpdates = ['email', 'firstName', 'lastName', 'phone'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, user_id: req.user.user_id },
      updates,
      { new: true, runValidators: true }
    );

    const contactResponse = {
      id: updatedContact._id,
      email: updatedContact.email,
      firstName: updatedContact.firstName,
      lastName: updatedContact.lastName,
      phone: updatedContact.phone,
    };

    res.status(200).json({
      message: "Contact updated successfully",
      contact: contactResponse
    });
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: error.message
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contactId = req.params.id;
    
    const deletedContact = await Contact.findOneAndDelete({
      _id: contactId,
      user_id: req.user.user_id
    });

    if (!deletedContact) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }

    res.status(200).json({
      message: "Contact deleted successfully",
      deletedContact: {
        id: deletedContact._id,
        firstName: deletedContact.firstName,
        lastName: deletedContact.lastName
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact
};
