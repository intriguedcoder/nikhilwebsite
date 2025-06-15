const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? '' // Same domain for Vercel
    : 'http://localhost:5101' //  local backend
};

export default config;
