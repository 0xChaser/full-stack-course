import { useState, useEffect } from "react";
import Modal from "./Modal";

export default function ContactFormModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      const message = err?.message || err?.error || err?.errors?.[0]?.msg || "Une erreur est survenue";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Modifier un contact" : "Ajouter un contact"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-2 text-sm text-red-700 bg-red-100 border border-red-200 rounded">
            {errorMessage}
          </div>
        )}
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
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Veuillez patienter..." : (initialData ? "Modifier" : "Ajouter")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
