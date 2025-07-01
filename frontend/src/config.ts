// Determine the API URL based on environment
const getApiUrl = () => {
  // If explicitly set via environment variable, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In production, use the known working API endpoint
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'psycall.net' || hostname === 'www.psycall.net') {
      return 'http://api.psycall.net:5109';
    }
  }
  
  // Default to localhost for development
  return 'http://localhost:5109';
};

export const config = {
  apiUrl: getApiUrl()
}; 