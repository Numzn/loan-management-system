export const mockLoans = [
  {
    id: 'L001',
    clientName: 'John Doe',
    amount: 25000,
    type: 'PERSONAL',
    status: 'new',
    submittedDate: '2024-03-15',
    documents: ['id.pdf', 'payslip.pdf'],
  },
  {
    id: 'L002',
    clientName: 'Jane Smith',
    amount: 50000,
    type: 'BUSINESS',
    status: 'manager_approved',
    submittedDate: '2024-03-14',
    documents: ['business_plan.pdf', 'financial_statements.pdf'],
  },
  {
    id: 'L003',
    clientName: 'Robert Johnson',
    amount: 75000,
    type: 'GRZ',
    status: 'director_approved',
    submittedDate: '2024-03-13',
    documents: ['employment_letter.pdf', 'salary_slip.pdf'],
  },
  {
    id: 'L004',
    clientName: 'Sarah Williams',
    amount: 15000,
    type: 'SALARY_ADVANCE',
    status: 'disbursed',
    submittedDate: '2024-03-12',
    documents: ['payslip.pdf'],
  }
];

export const mockMetrics = {
  totalLoans: {
    value: '1.2M',
    trend: { value: 12, type: 'increase' }
  },
  activeApplications: {
    value: 156,
    trend: { value: 8, type: 'increase' }
  },
  approvalRate: {
    value: '85%',
    trend: { value: 3, type: 'decrease' }
  },
  disbursedAmount: {
    value: '850K',
    trend: { value: 15, type: 'increase' }
  }
};

export const mockUsers = [
  {
    id: 'U001',
    name: 'John Doe',
    role: 'LOAN_OFFICER',
    email: 'john@example.com'
  },
  // Add more mock users...
]; 