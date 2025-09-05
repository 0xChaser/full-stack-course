import { apiClient }from "../axios"

const CONTACT_ENDPOINT = "/contact"; 

const ContactService = {
  getAllContacts: async () => {
    const response = await apiClient.get(CONTACT_ENDPOINT);
    return response.data;
  },

  getContactById: async (id) => {
    const response = await apiClient.get(`${CONTACT_ENDPOINT}/${id}`);
    return response.data;
  },

  addContact: async (contactData) => {
    const response = await apiClient.post(CONTACT_ENDPOINT, contactData);
    return response.data;
  },

  updateContact: async (id, updatedData) => {
    const response = await apiClient.patch(`${CONTACT_ENDPOINT}/${id}`, updatedData);
    return response.data;
  },

  deleteContact: async (id) => {
    const response = await apiClient.delete(`${CONTACT_ENDPOINT}/${id}`);
    return response.data;
  },
};

export default ContactService;
