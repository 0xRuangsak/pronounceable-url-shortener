// Base URL for API requests
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// API endpoints
export const ENDPOINTS = {
  SHORTEN: `${API_BASE_URL}/api/shorten`,
  HEALTH: `${API_BASE_URL}/api/health`,
};
