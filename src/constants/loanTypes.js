export const LOAN_TYPES = {
  GRZ: {
    id: 'grz',
    name: 'Government Employee Loan',
    maxAmount: 500000,
    minAmount: 5000,
    maxDuration: 60,
    minDuration: 12,
    monthlyInterestRate: 4,
    serviceFee: 2.5,
    requiredDocuments: [
      'National Registration Card (NRC)',
      '3 months bank statements',
      '3 latest pay slips',
      'Introduction letter',
      'Passport-sized photo',
      'Proof of residence',
      'Signature on white background'
    ],
    eligibilityCriteria: [
      'Must be a permanent government employee',
      'Minimum service of 1 year',
      'Salary account with approved bank',
      'Age below retirement age'
    ]
  },
  SALARY_ADVANCE: {
    id: 'salary',
    name: 'Salary Advance',
    maxAmount: 20000,
    minAmount: 1000,
    maxDuration: 3,
    minDuration: 1,
    monthlyInterestRate: 20,
    serviceFee: 1,
    requiredDocuments: [
      'National Registration Card (NRC)',
      '3 months bank statements',
      '3 latest pay slips',
      'Introduction letter',
      'Memorandum of Understanding',
      'Passport-sized photo',
      'Signature on white background'
    ],
    eligibilityCriteria: [
      'Currently employed',
      'Minimum employment period of 3 months',
      'Salary account with approved bank'
    ]
  },
  BUSINESS: {
    id: 'business',
    name: 'Business Loan',
    maxAmount: 1000000,
    minAmount: 10000,
    maxDuration: 36,
    minDuration: 6,
    monthlyInterestRate: 7,
    serviceFee: 3,
    requiredDocuments: [
      'National Registration Card (NRC)',
      '6 months bank statements',
      'Business registration certificate',
      'Business plan',
      'Financial statements',
      'Tax clearance certificate',
      'Proof of address',
      'Signature on white background'
    ],
    eligibilityCriteria: [
      'Registered business',
      'Minimum 1 year in operation',
      'Good credit history',
      'Valid business permits'
    ]
  },
  PERSONAL: {
    id: 'personal',
    name: 'Personal Loan',
    maxAmount: 50000,
    minAmount: 2000,
    maxDuration: 24,
    minDuration: 3,
    monthlyInterestRate: 7,
    serviceFee: 2,
    requiredDocuments: [
      'National Registration Card (NRC)',
      '3 months bank statements',
      'Proof of income',
      'Collateral documentation',
      'Employment confirmation letter',
      'Passport-sized photo',
      'Proof of residence',
      'Personal references',
      'Signature on white background'
    ],
    eligibilityCriteria: [
      'Formally employed',
      'Minimum monthly income K3,000',
      'Clean credit history',
      'Age 21-55 years'
    ]
  }
};

export const calculateLoanDetails = (amount, duration, loanType) => {
  const loan = LOAN_TYPES[loanType];
  const serviceFeeAmount = (amount * loan.serviceFee) / 100;
  const monthlyInterestRate = loan.monthlyInterestRate / 100;
  
  // Calculate monthly payment using compound interest formula
  const monthlyPayment = (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, duration)) / 
                        (Math.pow(1 + monthlyInterestRate, duration) - 1);
  
  const totalRepayment = monthlyPayment * duration;
  
  return {
    loanAmount: amount,
    serviceFee: serviceFeeAmount,
    netLoanAmount: amount - serviceFeeAmount,
    monthlyPayment,
    totalRepayment,
    interestRate: loan.monthlyInterestRate,
    duration,
    startDate: new Date(),
    endDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000)
  };
};

// Helper function to generate repayment schedule
export const generateRepaymentSchedule = (loanDetails) => {
  const schedule = [];
  let remainingBalance = loanDetails.loanAmount;
  const monthlyInterestRate = loanDetails.interestRate / 100;

  for (let month = 1; month <= loanDetails.duration; month++) {
    const interestPayment = remainingBalance * monthlyInterestRate;
    const principalPayment = loanDetails.monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;

    schedule.push({
      month,
      paymentDate: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000),
      monthlyPayment: loanDetails.monthlyPayment,
      principalPayment,
      interestPayment,
      remainingBalance: Math.max(0, remainingBalance)
    });
  }

  return schedule;
}; 