// Determine the correct API URL based on environment
const getApiUrl = () => {
  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In production, we need to work around mixed content restrictions
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'psycall.net' || hostname === 'www.psycall.net') {
      // For now, use HTTP with port until SSL is properly configured
      // This will require browser to allow mixed content or configure properly in Coolify
      return 'http://api.psycall.net:5109';
    }
  }
  
  // Default to localhost for development
  return 'http://localhost:5109';
};

export const config = {
  apiUrl: getApiUrl()
}; 