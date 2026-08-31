import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_LOCAL_BACKEND_API
});

// Automatically intercept all responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred.';
    
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || error.message || 'Server request failed.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return Promise.reject(errorMessage);
  }
);
