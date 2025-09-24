// Mock authentication service for testing when backend is not available
export const mockAuthService = {
  // Mock login function
  async login(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple mock validation
    if (email === 'admin@test.com' && password === 'password') {
      const mockUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'admin'
      };
      
      const mockToken = 'mock_jwt_token_' + Date.now() + '_' + Math.random();
      
      return {
        success: true,
        data: {
          user: mockUser,
          token: mockToken
        }
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  // Mock signup function  
  async signup(userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      id: Date.now(),
      name: userData.name || 'New User',
      email: userData.email,
      role: 'user'
    };
    
    const mockToken = 'mock_jwt_token_' + Date.now() + '_' + Math.random();
    
    return {
      success: true,
      data: {
        user: mockUser,
        token: mockToken
      }
    };
  },
  
  // Mock profile fetch
  async getProfile() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    
    // Mock user based on stored token
    const mockUser = {
      id: 1,
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin'
    };
    
    return {
      success: true,
      data: mockUser
    };
  }
};