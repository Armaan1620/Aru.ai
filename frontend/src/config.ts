// Base URL for the backend API
// IMPORTANT: Set VITE_API_BASE_URL in your deployment environment variables
// For production (Vercel): https://aru-ai.onrender.com
// For development: http://localhost:5000 (default)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Validate API URL is set correctly in production
if (import.meta.env.MODE === 'production' && API_BASE_URL.includes('localhost')) {
  console.error('⚠️  WARNING: Using localhost API URL in production! Set VITE_API_BASE_URL environment variable.');
}