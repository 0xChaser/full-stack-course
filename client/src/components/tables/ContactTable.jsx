import { useEffect, useState } from "react";
import contactService from "../../services/ContactService";
import ContactFormModal from "../modals/ContactFormModal";

export default function ContactsTable() {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await contactService.getAllContacts();
      setContacts(data.contacts);
    } catch (error) {
      console.error("Erreur de récupération des contacts :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await contactService.deleteContact(id);
      await fetchContacts();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handleSubmit = async (data) => {
    if (editingContact) {
      await contactService.updateContact(editingContact.id, data);
    } else {
      await contactService.addContact(data);
    }
    await fetchContacts();
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold">Bienvenue sur MyContacts !</h1>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Contacts</h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ajouter un contact
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Email</th>
            <th className="border p-2">Prénom</th>
            <th className="border p-2">Nom</th>
            <th className="border p-2">Téléphone</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id} className="text-center">
              <td className="border p-2">{contact.email}</td>
              <td className="border p-2">{contact.firstName}</td>
              <td className="border p-2">{contact.lastName}</td>
              <td className="border p-2">{contact.phone}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => handleEdit(contact)}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          {contacts.length === 0 && (
            <tr>
              <td colSpan="5" className="p-4 text-gray-500">
                Aucun contact trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ContactFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingContact}
      />
    </div>
  );
}
