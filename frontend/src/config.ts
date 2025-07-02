// Determine the correct API URL based on environment
const getApiUrl = () => {
  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // When served by the backend (unified app), use relative paths
  if (typeof window !== 'undefined') {
    // Use the current origin for API calls (same server)
    return window.location.origin;
  }
  
  // Default to localhost for development
  return 'http://localhost:5109';
};

export const config = {
  apiUrl: getApiUrl()
}; 