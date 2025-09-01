// Debug utility for API connection
export const debugAPI = async () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  
  console.log('🔍 API Debug Information:');
  console.log('VITE_API_URL:', API_URL);
  console.log('Full API URL:', `${API_URL}/api/events`);
  
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check response:', data);
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
  
  try {
    const response = await fetch(`${API_URL}/api/events`);
    const data = await response.json();
    console.log('✅ Events API response:', data);
  } catch (error) {
    console.error('❌ Events API failed:', error);
  }
};

// Call debug function on page load
if (import.meta.env.DEV) {
  debugAPI();
}
