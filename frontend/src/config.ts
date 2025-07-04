// Determine the correct API URL based on environment
const getApiUrl = () => {
  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('Using env API URL:', process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In production, use HTTPS without port (Coolify SSL termination)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('Current hostname:', hostname);
    if (hostname === 'psycall.net' || hostname === 'www.psycall.net') {
      const apiUrl = 'https://backend.psycall.net';
      console.log('Using production API URL:', apiUrl);
      return apiUrl;
    }
  }
  
  // Default to 127.0.0.1 for development (better compatibility than localhost)
  console.log('Using localhost API URL');
  return 'http://127.0.0.1:5109';
};

export const config = {
  apiUrl: getApiUrl()
};