import { apiClient }from "../axios"

const CONTACT_ENDPOINT = "/contact"; 

const ContactService = {
  getAllContacts: async () => {
    try {
      const response = await apiClient.get(CONTACT_ENDPOINT);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des contacts' };
    }
  },

  getContactById: async (id) => {
    try {
      const response = await apiClient.get(`${CONTACT_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du contact' };
    }
  },

  addContact: async (contactData) => {
    try {
      const response = await apiClient.post(CONTACT_ENDPOINT, contactData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du contact' };
    }
  },

  updateContact: async (id, updatedData) => {
    try {
      const response = await apiClient.patch(`${CONTACT_ENDPOINT}/${id}`, updatedData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour du contact' };
    }
  },

  deleteContact: async (id) => {
    try {
      const response = await apiClient.delete(`${CONTACT_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du contact' };
    }
  },
};

export default ContactService;
