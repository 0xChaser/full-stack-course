import { useState, useEffect } from "react";
import Modal from "./Modal";

export default function ContactFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        phone: ""
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const cleaned = value.replace(/[^0-9+]/g, ""); 
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Modifier un contact" : "Ajouter un contact"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="firstName"
          placeholder="Prénom"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Nom"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="tel"
          name="phone"
          placeholder="Téléphone (ex: +33612345678)"
          value={formData.phone}
          onChange={handleChange}
          pattern="^\+?[0-9]{10,15}$"
          title="Entrez un numéro valide (ex: +33612345678 ou 0612345678)"
          className="w-full p-2 border rounded"
          required
        />

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {initialData ? "Modifier" : "Ajouter"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
