// Determine the correct API URL based on environment
const getApiUrl = () => {
  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In production, use HTTPS without port (Coolify SSL termination)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'psycall.net' || hostname === 'www.psycall.net') {
      return 'https://api.psycall.net';
    }
  }
  
  // Default to localhost for development
  return 'http://localhost:5109';
};

export const config = {
  apiUrl: getApiUrl()
}; 