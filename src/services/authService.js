const MOCK_USERS = {
  'loan.officer@example.com': {
    id: '1',
    email: 'loan.officer@example.com',
    role: 'loan_officer',
    name: 'John Wilson',
    permissions: ['view_applications', 'review_applications']
  },
  'manager@example.com': {
    id: '2',
    email: 'manager@example.com',
    role: 'manager',
    name: 'Jane Smith',
    permissions: ['approve_loans', 'view_reports', 'manage_officers']
  },
  'director@example.com': {
    id: '3',
    email: 'director@example.com',
    role: 'director',
    name: 'Robert Johnson',
    permissions: ['view_all', 'approve_high_value', 'manage_all']
  },
  'finance.officer@example.com': {
    id: '4',
    email: 'finance.officer@example.com',
    role: 'finance_officer',
    name: 'Mary Wilson',
    permissions: ['manage_disbursements', 'view_collections']
  }
};

export const authService = {
  currentUser: null,

  login: async (email, password) => {
    console.log('Login attempt:', { email, password });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (MOCK_USERS[email] && password === 'password123') {
      const user = MOCK_USERS[email];
      console.log('Login successful:', user);
      localStorage.setItem('mockUser', JSON.stringify(user));
      return { user, error: null };
    }
    console.log('Login failed: Invalid credentials');
    return { user: null, error: 'Invalid credentials' };
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('mockUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  logout: async () => {
    localStorage.removeItem('mockUser');
    return { error: null };
  }
};

export default authService; 