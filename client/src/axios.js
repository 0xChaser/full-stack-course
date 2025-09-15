import axios from 'axios'


export const apiClient = axios.create({
    baseURL: "https://full-js-api.flo-isk.fr",
    headers: {
        'Content-Type': 'application/json',
      },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("user_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);