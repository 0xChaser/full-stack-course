const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact
} = require("../controllers/contactController");

router.post("/", requireAuth, createContact);
router.get("/", requireAuth, getAllContacts);
router.get("/:id", requireAuth, getContactById);
router.patch("/:id", requireAuth, updateContact);
router.delete("/:id", requireAuth, deleteContact);

module.exports = router;