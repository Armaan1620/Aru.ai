// Base URL for the backend API
// MUST be set via VITE_API_BASE_URL environment variable in production
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Validate configuration
if (import.meta.env.MODE === 'production' && !import.meta.env.VITE_API_BASE_URL) {
  console.error('❌ CRITICAL: VITE_API_BASE_URL environment variable is not set in production!');
  console.error('The app will not work correctly. Please set it in your Vercel dashboard.');
}

// Log API URL for debugging
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL);
}