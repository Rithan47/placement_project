const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-production-api-url.com/api' // We will replace this later
  : 'http://localhost:5000/api';

export default API_URL; 