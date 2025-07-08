// Determine the correct API URL based on environment
const getApiUrl = () => {
  // If environment variable is set, use it (highest priority)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If running on localhost or 127.0.0.1, use local backend
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost')) {
      return 'http://127.0.0.1:5109';
    }
    
    // If running on psycall.net domain, use local backend for now
    // TODO: Update this when production backend is properly configured
    if (hostname === 'psycall.net' || hostname === 'www.psycall.net') {
      // For now, use local backend even in production
      // Change this to 'https://backend.psycall.net' when backend is ready
      return 'http://127.0.0.1:5109';
    }
  }
  
  // Default fallback for server-side rendering
  return 'http://127.0.0.1:5109';
};

export const config = {
  apiUrl: getApiUrl()
};