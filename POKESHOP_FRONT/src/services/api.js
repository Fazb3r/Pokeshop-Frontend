// POKESHOP_FRONT/src/services/api.js

// Base URL for API calls
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Function to get stored authentication token
const getAuthToken = () => {
  return localStorage.getItem('pokeShopToken');
};

// API Service object
const apiService = {
  // Auth endpoints
  auth: {
    login: async (username, password) => {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      return handleResponse(response);
    },
    
    register: async (username, password, userType) => {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, userType }),
      });
      return handleResponse(response);
    },
    
    getUserProfile: async () => {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      return handleResponse(response);
    },
    
    updateUserProfile: async (userData) => {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(userData),
      });
      return handleResponse(response);
    },
  },
  
  // Pokemon endpoints
  pokemon: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/pokemon`);
      return handleResponse(response);
    },
    
    getById: async (id) => {
      const response = await fetch(`${API_BASE_URL}/pokemon/${id}`);
      return handleResponse(response);
    },
    
    create: async (pokemonData) => {
      const response = await fetch(`${API_BASE_URL}/pokemon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(pokemonData),
      });
      return handleResponse(response);
    },
    
    update: async (id, pokemonData) => {
      const response = await fetch(`${API_BASE_URL}/pokemon/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(pokemonData),
      });
      return handleResponse(response);
    },
    
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}/pokemon/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      return handleResponse(response);
    },
  },
  
  // Cart endpoints
  cart: {
    get: async () => {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      return handleResponse(response);
    },
    
    addItem: async (pokemonId, quantity = 1) => {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ pokemonId, quantity }),
      });
      return handleResponse(response);
    },
    
    updateItem: async (cartItemId, quantity) => {
      const response = await fetch(`${API_BASE_URL}/cart/item/${cartItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ quantity }),
      });
      return handleResponse(response);
    },
    
    removeItem: async (cartItemId) => {
      const response = await fetch(`${API_BASE_URL}/cart/item/${cartItemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      return handleResponse(response);
    },
    
    clear: async () => {
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      return handleResponse(response);
    },
  },
};

// Export the API service
export default apiService;